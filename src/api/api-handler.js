const utils = require('../utils');

/**
 * Stores and handles rooms
 */
class ApiHandler {
  constructor() {
    this.rooms = {};
    this.info = null; // initially empty
  }

  /**
   * List attached rooms
   */
  listRooms() {
    const result = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(this.rooms)) {
      result.push({
        space: utils.getSpaceFromRoomName(key),
        thread: utils.getThreadFromRoomName(key),
        status: value.status,
      });
    }
    return result;
  }

  /**
   * Updates thread status
   * @param spaceName - Space name
   * @param threadName - Thread name
   * @param status - Thread status
   * @return {*}
   * @private
   */
  _updateThreadStatus(spaceName, threadName, status) {
    const room = utils.createRoomName(spaceName, threadName);

    if (this.rooms[room]) {
      this.rooms[room] = { status };
      return this.rooms[room];
    }

    throw new Error(`Non existing room for space ${spaceName} and thread ${threadName}`);
  }

  /**
   * Peers peerStarted
   * @param peerInfo - Peer information (id, multiaddress)
   */
  peerStarted(peerInfo) {
    this.info = peerInfo;
    return this.info;
  }

  /**
   * Register thread and space to be threadJoined to
   * @param spaceName - Space name
   * @param threadName - Thread name
   */
  joinThread(spaceName, threadName) {
    const roomName = utils.createRoomName(spaceName, threadName);

    if (this.rooms[roomName] && this.rooms[roomName].status !== 'THREAD_LEFT') {
      throw new Error(`Already attached to room for space ${spaceName} and thread ${threadName}`);
    }

    this.rooms[roomName] = {
      status: 'THREAD_JOINING',
    };

    return this.rooms[roomName];
  }

  /**
   * Updates status for existing thread
   * @param spaceName - Space name
   * @param threadName - Thread name
   */
  threadJoined(spaceName, threadName) {
    return this._updateThreadStatus(spaceName, threadName, 'THREAD_JOINED')
  }

  /**
   * Unregisters thread and space
   * @param spaceName - Space name
   * @param threadName - Thread name
   */
  leaveThread(spaceName, threadName) {
    const room = utils.createRoomName(spaceName, threadName);

    if (this.rooms[room]) {
      this.rooms[room] = {
        status: 'THREAD_LEAVING',
      };
      return this.rooms[room];
    }

    throw new Error(`Non existing room for space ${spaceName} and thread ${threadName}`);
  }

  /**
   *
   * @param spaceName
   * @param threadName
   */
  threadLeft(spaceName, threadName) {
    return this._updateThreadStatus(spaceName, threadName, 'THREAD_LEFT');
  }
}

module.exports = ApiHandler;
