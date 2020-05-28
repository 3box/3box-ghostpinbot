const Box = require('3box');
const crypto = require('crypto');
const IdentityWallet = require('identity-wallet');

const logger = require('./logger');

const ENABLE_THREAD_CLEANUP = process.env.ENABLE_THREAD_CLEANUP || false;
const THREAD_CLEANUP_PERIOD = process.env.THREAD_CLEANUP_PERIOD || 3600000; // 1 hour

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

    this.box = await Box.create(provider, {
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

    await this.box.syncDone;

    logger.info(`Peer ${this.getPeerInfo().id} successfully synced`);

    if (ENABLE_THREAD_CLEANUP) {
      this._startThreadKeepAliveMonitor();
    }
  }

  /**
    * Get IPFS peer information
    */
  getPeerInfo() {
    return {
      id: this.box._ipfs._peerInfo.id._idB58String,
      multiaddrs: this.box._ipfs._peerInfo.multiaddrs,
      protocols: this.box._ipfs._peerInfo.protocols,
    };
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
          const { lastUpdatedTime, members } = value;
          const deadline = lastUpdatedTime + THREAD_CLEANUP_PERIOD;

          if (Date.now() > deadline && members === 0) {
            self.leave(Peer._getSpaceFromRoomName(key), Peer._getThreadFromRoomName(key));
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
    * List attached rooms
    */
  listRooms() {
    const result = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key] of Object.entries(this.rooms)) {
      result.push({
        space: this._getSpaceFromRoomName(key),
        thread: this._getThreadFromRoomName(key),
      });
    }
    return result;
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

      const thread = await this.box.openThread(spaceName, threadName, {
        ghost: true,
      });

      const self = this;
      thread.onUpdate(async (msg) => {
        logger.debug(JSON.stringify(msg));
        if (msg.type === 'backlog') {
          // increase the number of members
          self.rooms[room].lastUpdatedTime = Date.now();
          self.rooms[room].members = this.rooms[room].members + 1;
        }
      });

      thread.onNewCapabilities((event, did, peerId) => {
        if (event === 'left') {
          // decrease the number of members
          self.rooms[room].lastUpdatedTime = Date.now();
          self.rooms[room].members = this.rooms[room].members - 1;
        }
        logger.info(`Peer ${peerId} has ${event} the chat`);
      });

      this.rooms[room] = {
        thread,
        lastUpdatedTime: Date.now(),
        members: 0,
      };

      logger.info(`Peer ${this.box._ipfs._peerInfo.id._idB58String} joined chat ${threadName}`);
    } catch (e) {
      logger.error(e);
    }
  }

  /**
  * Leave thread
  */
  async leave(spaceName, threadName) {
    try {
      const roomName = Peer._createRoomName(spaceName, threadName);

      const room = this.rooms[roomName];
      if (room != null) {
        await room.thread.close();
        delete this.rooms[roomName];
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
