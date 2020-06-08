# 3box-ghost-pinbot

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

This package contains information for spinning up your Ghost Pinbot server used for attaching/detaching to Ghost threads.

## Tabel of Contents
- [Start](#start)
- [Swarm](#swarm)
- [APIs](#APIs)
- [Contributing](#contributing)
- [License](#license)

## Start

There are various ways of how to start the app depending on how you want to run the Ghost Pinbot application. The application supports 
three different modes:

- `API`: service for communicating with the Ghost Pinbot API
    
- `PEER`: service for handling Ghost Thread functionalities 

- `BUNDLED`: service which bundles both the API and PEER services.

There is a `Dockerfile` which can be used to build the image and deploy it on your infrastructure.

**Note**: the same `Dockerfile` is used for all the execution modes. This needs to be separated in some of the future versions of the Ghost Pinbot.

#### Local

The `docker-compose.yml` can be a good start to bootstrap Ghost Pinbot server.

- `./docker-compose up`

#### Heroku

In order to run the Ghost Pinbot service on Heroku run the following script from the root dir.

- `./deploy/heroku/build.sh <API_APP_NAME> <PEER_APP_NAME>`

That script will create the script for deployment:

- `./deploy/heroku/build/deploy.sh`

Just run the script and your services will be deployed on Heroku. For example, if you run:

- `./deploy/heroku/build.sh ghostpinbot-api ghostpinbot-peer`

When you run the `deploy.sh` script your services will be deployed as:

- `API`: https://ghostpinbot-api.herokuapp.com
- `PEER`: https://ghostpinbot-peer.herokuapp.com

The PEER service registers on the API service upon bootstrap. You can query the API service in order to get multiaddress of the peer node:

- `GET PEER INFO`: https://ghostpinbot-api.herokuapp.com/api/v0/peer

The multiaddress will be listed in the response:

- `Multiaddress example`: /dns4/ghostpinbot-peer.herokuapp.com/wss/ipfs/Qma9vbkfBMxWPEMzYybECAXenxwYiwXztbtSsQDDYcpPna

**Note**: Make sure that the names of the applications are available on Heroku.

#### AWS

If you plan to deploy the Ghost Pinbot server on AWS there are Terraform scripts located in `deploy/aws-terraform-example`. 

In order to setup secure WebSocket for `swarm` direct connect over `https` that's automatically implemented in the Terraform scripts provided. The only input that needs to be provided is the certificate arn from AWS.

## Swarm

Upon successful start and deployment, the MultiAddress of a Ghost Pinbot node can be passed as an option `ghostPinbot` to `3Box` on create.

The options example:

```json
{
 "ghostPinbot": "/dns4/ghostpinbot-peer.herokuapp.com/wss/ipfs/Qma9vbkfBMxWPEMzYybECAXenxwYiwXztbtSsQDDYcpPna"
}
```

Using it with the 3Box:

```javascript
Box.create(provider, {
  ghostPinbot: "/dns4/ghostpinbot-peer.herokuapp.com/wss/ipfs/Qma9vbkfBMxWPEMzYybECAXenxwYiwXztbtSsQDDYcpPna"
})
```

## APIs

RESTful APIs are enabled on `http://localhost:8081/api/v0/` by default.

----
  #### Start listening to a thread
  
  Starts to listen for one thread.

* **URL**

  `/rooms`

* **Method:**

  `POST`
  
* **Data Params**<br />

  * **Content:** 
    ```json
      {
        "space": "hello-world-space",
        "thread": "hello-world-thread"
      }
    ```

* **Success Response:**

    * **Code:** 200 <br />
  
   * **Content:** 
        ```json
      {
            "status": "THREAD_JOINING"
       }
        ```

----
  #### Stop listening to a thread
    
  Stops to listen to a thread.

* **URL**

  `/rooms`

* **Method:**

  `DELETE`
  
* **Data Params**<br />

  * **Content:** 
    ```json
      {
        "space": "hello-world-space",
        "thread": "hello-world-thread"
      }
    ```

* **Success Response:**

  * **Code:** 200 <br />
  
   * **Content:** 
        ```json
       {
            "status": "THREAD_LEAVING"
       }
        ```

----
  #### Get list of attached rooms
    
  Gets list of attached rooms.

* **URL**

  `/rooms`

* **Method:**

  `GET`
  
* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
     ```json
     [
         {
             "space": "hello-world-space",
             "thread": "hello-world-thread",
             "status": "THREAD_JOINED"
         },
         {
             "space": "bye-world-space",
             "thread": "bye-world-thread",
             "status": "THREAD_LEFT"
         }
     ]
     ```

----
  #### Get IPFS peer information
    
  Gets IPFS peer information.

* **URL**

  `/peer`

* **Method:**

  `GET`
  
* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
     ```json
     {
        "id": "Qma9vbkfBMxWPEMzYybECAXenxwYiwXztbtSsQDDYcpPna",
        "multiaddrs": [
            "/dns4/ghostpinbot-peer.herokuapp.com/wss/ipfs/Qma9vbkfBMxWPEMzYybECAXenxwYiwXztbtSsQDDYcpPna"
        ]
    }
     ```

## Maintainers
[@simonovic86](https://github.com/simonovic86)

## Contributing
If you want to add new features to the pinbot or submit bug reports please submit a PR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
