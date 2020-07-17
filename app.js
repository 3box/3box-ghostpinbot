const program = require('commander');

const Api = require('./src/api/api');
const ApiHandler = require('./src/api/api-handler');

const Peer = require('./src/peer/peer');
const PeerListener = require('./src/peer/peer-listener');
const ApiLocalProxy = require('./src/peer/api/api-local-proxy');
const ApiRemoteProxy = require('./src/peer/api/api-remote-proxy');

/**
 * Encapsulates application
 */
class App {
  constructor(mode) {
    this.mode = mode || 'BUNDLED';
  }

  /**
   * Start application
   * @return {Promise<void>}
   */
  async start() {
    switch (this.mode) {
      case 'BUNDLED':
        await this.startBundled();
        return;
      case 'API': {
        await this.startApi();
        return;
      }
      case 'PEER': {
        await this.startPeer();
        break;
      }
      default: {
        process.exit(1);
      }
    }
  }

  /**
   * Start the API withou Peer
   * @return {Promise<void>}
   */
  async startApi() {
    const api = new Api();
    await api.start();
  }

  /**
   * Start Peer without the API
   * @return {Promise<void>}
   */
  async startPeer() {
    const apiRemoteProxy = new ApiRemoteProxy();
    const peer = new Peer(apiRemoteProxy);
    const peerListener = new PeerListener(peer, apiRemoteProxy);
    await peer.start();
    peerListener.start();
  }

  /**
   * Start the API and Peer in the same process
   * @return {Promise<void>}
   */
  async startBundled() {
    const apiHandler = new ApiHandler();
    const api = new Api(apiHandler);
    const apiLocalProxy = new ApiLocalProxy(apiHandler);

    const peer = new Peer(apiLocalProxy);
    const peerListener = new PeerListener(peer, apiLocalProxy);

    await api.start();
    await peer.start();
    peerListener.start();
  }
}

program
  .option('-a, --api-callback-url <url>', 'API callback URL when mode is PEER')
  .option('-e, --execution-mode <mode>', 'app execution mode (API|PEER|BUNDLED)');

program.parse(process.argv);

process.env.API_CALLBACK_URL = program.apiCallbackUrl || process.env.API_CALLBACK_URL;

const mode = program.executionMode || process.env.EXECUTION_MODE;
const app = new App(mode);
app.start().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
