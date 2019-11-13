#!/usr/bin/env node

const name = process.argv.pop();
const spaceName = name.split('.')[2];
const roomName = name.split('.')[3];

console.log('3BOX:', process.env.NAME);

const Box = require('3box')
const IdentityWallet = require('identity-wallet')
const crypto = require('crypto');

(async () => {
  // creating seed
  const seed = crypto.randomBytes(32).toString('hex')

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
