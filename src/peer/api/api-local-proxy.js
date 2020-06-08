/**
 * Local API proxy - same process
 */
class ApiLocalProxy {
  constructor(apiHandler) {
    this.apiHandler = apiHandler;
  }

  /**
   * List rooms from the local API instance
   * @return {Promise<any|*[]>}
   */
  async listRooms() {
    return this.apiHandler.listRooms();
  }

  /**
   * Executes PEER_STARTED callback
   */
  async peerStarted(peerInfo) {
    this.apiHandler.peerStarted(peerInfo);
  }

  /**
   * Executes THREAD_JOINED callback
   */
  async joined(spaceName, threadName) {
    this.apiHandler.threadJoined(spaceName, threadName);
  }

  /**
   * Executes THREAD_LEFT callback
   */
  async left(spaceName, threadName) {
    this.apiHandler.threadLeft(spaceName, threadName);
  }
}

module.exports = ApiLocalProxy;
