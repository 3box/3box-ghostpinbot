const Box = require('3box')
const crypto = require('crypto')
const IdentityWallet = require('identity-wallet')

const logger = require('./logger')

const THREAD_KEEP_ALIVE_PERIOD = process.env.THREAD_KEEP_ALIVE_PERIOD || 3600000 // default to 1 hour

/**
 * IPFS peer
 */
class Peer {

	constructor() {
		this.rooms = {}
	}

	/**
	 * Start peer
	 */
	async start() {
		logger.info('Starting ghost pinbot peer...')

		const seed = crypto.randomBytes(32).toString('hex')
		const wallet = new IdentityWallet(() => true, {seed: '0x' + seed})

		const provider = wallet.get3idProvider()

		this.box = await Box.openBox(null, provider, {
			ipfsOptions: {
				config: {
					Bootstrap: [],
					Addresses: {
						Swarm: [
							'/ip4/0.0.0.0/tcp/4001',
							'/ip4/0.0.0.0/tcp/4002/ws'
						],
					}
				},
			},
		})

		await this.box.syncDone

		logger.info(`Peer ${this.getPeerInfo().id} successfully synced`)

		this._startThreadKeepAliveMonitor()
	}

	/**
	 * Get IPFS peer information
	 */
	getPeerInfo() {
		return {
			id: this.box._ipfs._peerInfo.id._idB58String,
			multiaddrs: this.box._ipfs._peerInfo.multiaddrs,
			protocols: this.box._ipfs._peerInfo.protocols,
		}
	}

	/**
	 * Start thread monitor/cleaner
	 * @private
	 */
	async _startThreadKeepAliveMonitor() {
		const self = this
		this.keepAliveMonitorHandle = setInterval(() => {
			try {
				for (let [key, value] of Object.entries(self.rooms)) {
					if (Date.now() > value.lastUpdatedTime + THREAD_KEEP_ALIVE_PERIOD) {
						self.leave(self._getSpaceFromRoomName(key), self._getThreadFromRoomName(key))
					}
				}
			} catch (e) {
				// do nothing
			}
		}, 10000)
	}

	/**
	 * Call on server stop
	 * @private
	 */
	async _stopThreadKeepAliveMonitor() {
		clearInterval(this.keepAliveMonitorHandle);
		this.keepAliveMonitorHandle = 0
	}

	/**
	 * List attached rooms
	 */
	listRooms() {
		const result = []
		for (let [key] of Object.entries(this.rooms)) {
			result.push({
				space: this._getSpaceFromRoomName(key),
				thread: this._getThreadFromRoomName(key),
			})
		}
		return result
	}

	/**
	 * Joins peer to a specific thread and space
	 */
	async join(spaceName, threadName) {
		try {
			const room = this._createRoomName(spaceName, threadName)

			if (this.rooms[room] != null) {
				this.rooms[room].lastUpdatedTime = Date.now() // it's already attached, just update time
				return;
			}

			const space = await this.box.openSpace(spaceName, {
				consentCallback: () => true
			})

			await space.syncDone

			const thread = await space.joinThread(threadName, {
				ghost: true,
			})

			thread.onUpdate(async (msg) => {
				logger.debug(JSON.stringify(msg))
			})

			thread.onNewCapabilities((event, did, peerId) => logger.info(`Peer ${peerId} has ${event} the chat`))

			this.rooms[room] = {
				thread,
				lastUpdatedTime: Date.now()
			}

			logger.info(`Peer ${this.box._ipfs._peerInfo.id._idB58String} joined chat ${threadName}`)
		} catch (e) {
			logger.error(e)
		}
	}

	/**
	 * Leave thread
	 */
	async leave(spaceName, threadName) {
		try {
			const roomName = this._createRoomName(spaceName, threadName)

			const room = this.rooms[roomName]
			if (room != null) {
				await room.thread.close()
				delete this.rooms[roomName]
				logger.info(`Peer ${this.box._ipfs._peerInfo.id._idB58String} left chat ${threadName}`)
			}
		} catch (e) {
			logger.error(e)
		}
	}

	/**
	 * Creates Room name needed for cache
	 */
	_createRoomName(spaceName, threadName) {
		return `${spaceName}.${threadName}`
	}

	/**
	 * Gets Space name from Room name
	 */
	_getSpaceFromRoomName(roomName) {
		return roomName.split('.')[0]
	}

	/**
	 * Gets Thread name from Room name
	 */
	_getThreadFromRoomName(roomName) {
		return roomName.split('.')[1]
	}

}

module.exports = Peer