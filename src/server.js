const express = require('express');
const bodyParser = require('body-parser');

const Peer = require('./peer');
const logger = require('./logger');

const SERVER_PORT = process.env.SERVER_PORT || 8081

/**
 * Simple server implementation
 */
class Server {
	constructor() {
		this.port = SERVER_PORT
	}

	/**
	 * Starts the server
	 * @return {Promise<void>}
	 */
	async start() {
		this.peer = new Peer(logger)
		await this.peer.start()

		this.app = express()
		this.app.use(bodyParser.urlencoded({extended: false}))
		this.app.use(bodyParser.json())

		this.app.post('/v0/ghost/attach', this.attach.bind(this))
		this.app.post('/v0/ghost/detach', this.detach.bind(this))
		this.app.get('/v0/ghost/healthcheck', this.healthcheckHandler.bind(this))

		this.app.listen(this.port, () => logger.info(`Server started on port ${this.port}`))
	}

	/**
	 * Healthcheck route
	 */
	async healthcheckHandler(req, res, next) {
		return res.status(200).send()
	}

	/**
	 * Attach to space/thread
	 */
	async attach(req, res) {
		const {space, thread} = req.body

		await this.peer.join(space, thread)
		return res.status(200).send()
	}

	/**
	 * Detach from space/thread
	 */
	async detach(req, res) {
		const {thread} = req.body

		await this.peer.leave(thread)
		return res.status(200).send()
	}

}

module.exports = Server