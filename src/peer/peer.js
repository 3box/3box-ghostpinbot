const Box = require('3box');
const crypto = require('crypto');
const IdentityWallet = require('identity-wallet');

const utils = require('../utils');
const logger = require('../logger');

const PeerState = require('./peer-state');

const ENABLE_THREAD_CLEANUP = process.env.ENABLE_THREAD_CLEANUP || false;
const THREAD_CLEANUP_PERIOD = process.env.THREAD_CLEANUP_PERIOD || 3600000; // 1 hour

/**
 * IPFS peer
 */
class Peer {
  constructor(apiProxy) {
    this.apiProxy = apiProxy;
    this.state = new PeerState();
  }

  /**
   * Start peer
   * @return {Promise<void>}
   */
  async start() {
    logger.info('Starting ghost pinbot peer...');

    const seed = crypto.randomBytes(32)
      .toString('hex');
    const wallet = new IdentityWallet(() => true, { seed: `0x${seed}` });

    const provider = wallet.get3idProvider();

    const port = process.env.PORT || 4002;
    this.box = await Box.create(provider, {
      ipfsOptions: {
        config: {
          Bootstrap: [],
          Addresses: {
            Swarm: [
              '/ip4/0.0.0.0/tcp/4001',
              `/ip4/0.0.0.0/tcp/${port}/ws`,
            ],
          },
        },
      },
    });

    await this.box.syncDone;

    const { peerInfo } = this.box._ipfs.libp2p;

    const baseWsUrl = process.env.BASE_WS_URL;

    const addresses = peerInfo.multiaddrs._multiaddrs.map((a) => a.toString());
    if (baseWsUrl) {
      const addrWs = addresses.find((a) => a.includes(`${port}`));
      // TODO think about better way of determining multiaddress
      const multiaddrs = `/dns4/${baseWsUrl}/wss/${addrWs.substring(addrWs.lastIndexOf('ipfs'))}`;
      this.state.info = {
        id: peerInfo.id._idB58String,
        multiaddrs: [multiaddrs],
      };
    } else {
      this.state.info = {
        id: peerInfo.id._idB58String,
        multiaddrs: addresses,
      };
    }
    await this.apiProxy.peerStarted(this.state.info);

    logger.info(`Peer ${this.state.info.id} successfully synced`);

    if (ENABLE_THREAD_CLEANUP) {
      this._startThreadKeepAliveMonitor();
    }
  }

  /**
   * Start thread monitor/cleaner
   * @return {Promise<void>}
   * @private
   */
  async _startThreadKeepAliveMonitor() {
    logger.info('Started thread keep alive monitor');

    const self = this;
    this.keepAliveMonitorHandle = setInterval(() => {
      try {
        // eslint-disable-next-line no-restricted-syntax
        for (const [roomName, room] of Object.entries(self.state.rooms)) {
          const { lastUpdatedTime, members } = room;
          logger.info(`Checking room ${roomName}. Members: ${members}`);

          const deadline = lastUpdatedTime + THREAD_CLEANUP_PERIOD;

          if (Date.now() > deadline && members === 0) {
            logger.info(`Ghost Pinbot is leaving the room ${roomName}. Members: ${members}`);
            self.leave(utils.getSpaceFromRoomName(roomName), utils.getThreadFromRoomName(roomName));
          }
        }
      } catch (e) {
        // do nothing
      }
    }, 60000);
  }

  /**
   * Call on server stop
   * @return {Promise<void>}
   * @private
   */
  async _stopThreadKeepAliveMonitor() {
    clearInterval(this.keepAliveMonitorHandle);
    this.keepAliveMonitorHandle = 0;
  }

  /**
   * Joins peer to a specific thread and space
   * @param spaceName - Space name
   * @param threadName - Thread name
   * @return {Promise<void>}
   */
  async join(spaceName, threadName) {
    try {
      const roomName = utils.createRoomName(spaceName, threadName);

      const room = this.state.rooms[roomName];
      if (room != null) {
        room.lastUpdatedTime = Date.now(); // it's already attached, just update time
        return;
      }

      const thread = await this.box.openThread(spaceName, threadName, {
        ghost: true,
      });

      thread.onUpdate(async (msg) => {
        logger.debug(JSON.stringify(msg));
        if (msg.type === 'backlog') {
          // increase the number of members
          room.lastUpdatedTime = Date.now();
          room.members += 1;
        }
      });

      thread.onNewCapabilities((event, did, peerId) => {
        if (event === 'left') {
          // decrease the number of members
          room.lastUpdatedTime = Date.now();
          room.members -= 1;
        }
        logger.info(`Peer ${peerId} has ${event} the chat`);
      });

      this.state.rooms[roomName] = {
        thread,
        lastUpdatedTime: Date.now(),
        members: 0,
      };

      await this.apiProxy.joined(spaceName, threadName);

      logger.info(`Peer ${this.state.info.id} joined chat ${roomName}`);
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   * Leave thread
   */
  async leave(spaceName, threadName) {
    try {
      const roomName = utils.createRoomName(spaceName, threadName);

      const room = this.state.rooms[roomName];
      if (room != null) {
        room.thread.close();
        delete this.state.rooms[roomName];

        logger.info(`Peer ${this.state.info.id} left chat ${roomName}`);
      }

      await this.apiProxy.left(spaceName, threadName);
    } catch (e) {
      logger.error(e);
    }
  }
}

module.exports = Peer;
