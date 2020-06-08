const logger = require('../logger');

const PEER_LISTENER_INTERVAL = process.env.PEER_LISTENER_INTERVAL || 5000; // 5 seconds

class PeerListener {
  constructor(peer, apiProxy) {
    this.peer = peer;
    this.apiProxy = apiProxy;
  }

  start() {
    const self = this;
    setInterval(async () => {
      try {
        const rooms = await self.apiProxy.listRooms();

        const actions = [];
        rooms.forEach((room) => {
          switch (room.status) {
            case 'THREAD_JOINING': {
              actions.push(self.peer.join(room.space, room.thread));
              break;
            }
            case 'THREAD_LEAVING': {
              actions.push(self.peer.leave(room.space, room.thread));
              break;
            }
            default: {
              // do nothing
            }
          }
        });

        if (actions.length > 0) {
          await Promise.all(actions);
        }
      } catch (e) {
        logger.error(e);
      }
    }, PEER_LISTENER_INTERVAL);
  }
}

module.exports = PeerListener;
