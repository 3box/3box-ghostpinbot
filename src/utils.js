/**
 * Common utility method
 */
class Utils {
  /**
   * Creates Room name needed for cache
   * @param spaceName - Space name
   * @param threadName - Thread name
   * @return {string}
   */
  static createRoomName(spaceName, threadName) {
    return `${spaceName}.${threadName}`;
  }

  /**
   * Gets Space name from Room name
   * @param roomName - Room name
   * @return {*|string}
   */
  static getSpaceFromRoomName(roomName) {
    return roomName.split('.')[0];
  }

  /**
   * Gets Thread name from Room name
   * @param roomName - Room name
   * @return {*|string}
   */
  static getThreadFromRoomName(roomName) {
    return roomName.split('.')[1];
  }
}

module.exports = Utils;
