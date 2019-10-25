const Box = require('3box')
const IdentityWallet = require('identity-wallet')

const idw = new IdentityWallet({ seed })
const box = await Box.openBox(null, idw.get3idProvider())
await box.syncDone

const space = await box.openSpace('space')
await space.syncDone

const thread = space.joinThread('thread', { ghost: true })
await thread.joined // this is to check if the thread has connect to other peers

setInterval(async () => {
	const posts = await thread.getPosts()
}, 1000)
