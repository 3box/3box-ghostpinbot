#!/usr/bin/env node

const name = process.argv.pop()
const spaceName = name.split('.')[2]
const roomName = name.split('.')[3]

const Box = require('3box')
const IdentityWallet = require('identity-wallet')
const crypto = require('crypto');

// would having a now command in package.json.bin help?
// calling now could deploy and at the same time the args provided could be provided to bot.js
// now 3box.ghost.example.a

// now calls npm start on deploy
// set start script to call ./bot.js and pass name on somehow
// "start": "node ./bot.js 3box.ghost.example.a"

(async () => {
  // creating seed
  const seed = crypto.randomBytes(32).toString('hex')
  console.log('0x' + seed)

  // opening box
  const idw = new IdentityWallet(() => true, { seed: '0x' + seed })
  const box = await Box.openBox(null, idw.get3idProvider())
  await box.syncDone

  // opening space
  const space = await box.openSpace(spaceName)


  space.syncDone
  .then(() => {
    // for now we just need a live peer on the network
    space.joinThread(roomName, { ghost: true })
  })
  .catch(e => console.log(e))

})()
