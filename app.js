const Server = require('./src/server');

const server = new Server();
server.start().catch((e) => console.error(e));