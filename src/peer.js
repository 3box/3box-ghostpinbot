const Box = require('3box');
const crypto = require('crypto');
const IdentityWallet = require('identity-wallet');

const logger = require('./logger');

const THREAD_KEEP_ALIVE_PERIOD = process.env.THREAD_KEEP_ALIVE_PERIOD || 3600000; // 1 hour

/**
 * IPFS peer
 */
class Peer {
  constructor() {
    this.rooms = {};
  }

  /**
   * Start peer
   * @return {Promise<void>}
   */
  async start() {
    logger.info('Starting ghost pinbot peer...');

    const seed = crypto.randomBytes(32).toString('hex');
    const wallet = new IdentityWallet(() => true, { seed: `0x${seed}` });

    const provider = wallet.get3idProvider();

    this.box = await Box.openBox(null, provider, {
      ipfsOptions: {
        config: {
          Bootstrap: [],
          Addresses: {
            Swarm: [
              '/ip4/0.0.0.0/tcp/4001',
              '/ip4/0.0.0.0/tcp/4002/ws',
            ],
          },
        },
      },
    });

    const id = await this.box._ipfs.id();
    logger.info(JSON.stringify(id, null, 2));

    await this.box.syncDone;

    logger.info(`Peer ${this.box._ipfs._peerInfo.id._idB58String} successfully synced`);

    this._startThreadKeepAliveMonitor();
  }

  /**
   * Start thread monitor/cleaner
   * @return {Promise<void>}
   * @private
   */
  async _startThreadKeepAliveMonitor() {
    const self = this;
    this.keepAliveMonitorHandle = setInterval(() => {
      try {
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(self.rooms)) {
          if (Date.now() > value.lastUpdatedTime + THREAD_KEEP_ALIVE_PERIOD) {
            self.leave(Peer._getSpaceFromRoomName(key), Peer._getThreadFromRoomName(key));
          }
        }
      } catch (e) {
        // do nothing
      }
    }, 10000);
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
      const room = Peer._createRoomName(spaceName, threadName);

      if (this.rooms[room] != null) {
        this.rooms[room].lastUpdatedTime = Date.now(); // it's already attached, just update time
        return;
      }

      const space = await this.box.openSpace(spaceName, {
        consentCallback: () => true,
      });

      await space.syncDone;

      const thread = await space.joinThread(threadName, {
        ghost: true,
      });

      thread.onUpdate(async (msg) => {
        logger.debug(JSON.stringify(msg));
      });

      thread.onNewCapabilities((event, did, peerId) => logger.info(`Peer ${peerId} has ${event} the chat`));

      this.rooms[room] = {
        thread,
        lastUpdatedTime: Date.now(),
      };

      logger.info(`Peer ${this.box._ipfs._peerInfo.id._idB58String} joined chat ${threadName}`);
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   * Leave thread
   * @param spaceName - Space name
   * @param threadName - Thread name
   * @return {Promise<void>}
   */
  async leave(spaceName, threadName) {
    try {
      const room = Peer._createRoomName(spaceName, threadName);

      const thread = this.rooms[room];
      if (thread != null) {
        await thread.close();
        delete this.rooms[room];
        logger.info(`Peer ${this.box._ipfs._peerInfo.id._idB58String} left chat ${threadName}`);
      }
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   * Creates Room name needed for cache
   * @param spaceName - Space name
   * @param threadName - Thread name
   * @return {string}
   * @private
   */
  static _createRoomName(spaceName, threadName) {
    return `${spaceName}.${threadName}`;
  }

  /**
   * Gets Space name from Room name
   * @param roomName - Room name
   * @return {*|string}
   * @private
   */
  static _getSpaceFromRoomName(roomName) {
    return roomName.split('.')[0];
  }

  /**
   * Gets Thread name from Room name
   * @param roomName - Room name
   * @return {*|string}
   * @private
   */
  static _getThreadFromRoomName(roomName) {
    return roomName.split('.')[1];
  }
}

module.exports = Peer;
