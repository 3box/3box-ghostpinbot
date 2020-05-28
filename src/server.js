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

		this.app.get('/api/v0/rooms', this.listRooms.bind(this))
		this.app.post('/api/v0/rooms', this.attach.bind(this))
		this.app.delete('/api/v0/rooms', this.detach.bind(this))

		this.app.get('/api/v0/peer/healthcheck', this.healthcheck.bind(this))
		this.app.get('/api/v0/peer/info', this.info.bind(this))

		this.app.listen(this.port, () => logger.info(`Server started on port ${this.port}`))
	}

	/**
	 * Peer info route
	 */
	info(req, res) {
		return res.status(200).send(this.peer.getPeerInfo())
	}

	/**
	 * Healthcheck route
	 */
	healthcheck(req, res) {
		return res.status(200).send() // always return HTTP OK
	}

	/**
	 * List attached rooms
	 */
	listRooms(req, res) {
		const rooms = this.peer.listRooms()
		return res.status(200).send(rooms)
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
		const {space, thread} = req.body

		await this.peer.leave(space, thread)
		return res.status(200).send()
	}

}

module.exports = Server