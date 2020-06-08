/**
 * Remote API proxy - uses Rest API endpoints
 */
class ApiRemoteProxy {
  constructor(apiCallbackUrl) {
    this.apiCallbackUrl = process.env.API_CALLBACK_URL || apiCallbackUrl;
  }

  /**
   * List rooms from the remote API
   * @return {Promise<any|*[]>}
   */
  async listRooms() {
    const response = await fetch(`${this.apiCallbackUrl}/api/v0/rooms`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return response.json();
    }
    return [];
  }

  /**
   * Executes PEER_STARTED callback
   */
  async peerStarted(peerInfo) {
    await this._executeCallback({
      peerInfo,
      action: 'PEER_STARTED',
    });
  }

  /**
   * Executes THREAD_JOINED callback
   */
  async joined(space, thread) {
    await this._executeCallback({
      space,
      thread,
      action: 'THREAD_JOINED',
    });
  }

  /**
   * Executes THREAD_LEFT callback
   */
  async left(space, thread) {
    await this._executeCallback({
      space,
      thread,
      action: 'THREAD_LEFT',
    });
  }

  /**
   * Sends callback request to the API
   */
  async _executeCallback(data) {
    const response = await fetch(`${this.apiCallbackUrl}/api/v0/callback`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  }
}

module.exports = ApiRemoteProxy;
