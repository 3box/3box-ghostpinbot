const express = require('express');
const bodyParser = require('body-parser');

const logger = require('../logger');

const ApiHandler = require('./api-handler');

/**
 * Ghost Pinbot API implementation
 */
class Api {
  constructor(apiHandler) {
    this.port = process.env.PORT || 8081;
    this.handler = apiHandler || new ApiHandler();
  }

  /**
   * Starts the server
   * @return {Promise<void>}
   */
  start() {
    return new Promise((resolve, reject) => {
      this.app = express();
      this.app.use(bodyParser.urlencoded({ extended: false }));
      this.app.use(bodyParser.json());

      // rooms
      this.app.get('/api/v0/rooms', this.listRooms.bind(this));
      this.app.post('/api/v0/rooms', this.attach.bind(this));
      this.app.delete('/api/v0/rooms', this.detach.bind(this));

      // peers
      this.app.get('/api/v0/peer', this.info.bind(this));

      // callbacks
      this.app.post('/api/v0/callback', this.callback.bind(this));

      this.app.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          logger.info(`Server started on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  /**
   * Peer info route
   */
  info(req, res) {
    logger.debug('get peer information');
    return res.status(200)
      .send(this.handler.info);
  }

  /**
   * List attached rooms
   */
  listRooms(req, res) {
    logger.debug('list rooms');
    const rooms = this.handler.listRooms();
    return res.status(200)
      .send(rooms);
  }

  /**
   * Attach to space/thread
   */
  async attach(req, res) {
    const { space, thread } = req.body;

    try {
      logger.debug(`attach to space ${space} and thread ${thread}`);

      const result = await this.handler.joinThread(space, thread);
      return res.status(200)
        .send(result);
    } catch (e) {
      return res.status(400)
        .send({
          status: 400,
          message: e.message,
        });
    }
  }

  /**
   * Detach from space/thread
   */
  async detach(req, res) {
    const { space, thread } = req.body;

    try {
      logger.debug(`detach from space ${space} and thread ${thread}`);

      const result = await this.handler.leaveThread(space, thread);
      return res.status(200)
        .send(result);
    } catch (e) {
      return res.status(400)
        .send({
          status: 400,
          message: e.message,
        });
    }
  }

  /**
   * Executes callback operation
   */
  async callback(req, res) {
    try {
      const {
        action, peerInfo, space, thread,
      } = req.body;

      logger.debug(`execute callback ${JSON.stringify({
        action,
        peerInfo,
        space,
        thread,
      }, null, 2)}`);

      let result;
      switch (action) {
        case 'PEER_STARTED': {
          result = this.handler.peerStarted(peerInfo);
          break;
        }
        case 'THREAD_JOINED': {
          result = this.handler.threadJoined(space, thread);
          break;
        }
        case 'THREAD_LEFT': {
          result = this.handler.threadLeft(space, thread);
          break;
        }
        default: {
          // do nothing
        }
      }

      return res.status(200)
        .send(result);
    } catch (e) {
      return res.status(200)
        .send({
          status: 400,
          message: e.message,
        });
    }
  }
}

module.exports = Api;
