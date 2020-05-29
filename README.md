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

There are various ways of how to start Ghost Pinbot server. There is a `Dockerfile` which can be used to build the image and deploy it on your infrastructure.

The `docker-compose.yml` can be a good start to bootstrap Ghost Pinbot server:

```
$ docker-compose up
```

If you plan to deploy the Ghost Pinbot server on AWS there are Terraform scripts located in `deploy/aws-terraform-example`. 

In order to setup secure WebSocket for `swarm` direct connect over `https` that's automatically implemented in the Terraform scripts provided. The only
input that needs to be provided is the certificate arn from AWS.

If you want to setup secure WebSocket for `swarm` without using AWS and the scripts provided, feel free to set it up using `nginx` or 
other software to create a reverse proxy.

## Swarm

Upon successful start and deployment, the MultiAddress of a Ghost Pinbot node can be passed as an option `ghostPinbot` to `3Box` on create.

The options example:

```json
{
 "ghostPinbot": "/dns4/_domain.com/tcp/443/wss/ipfs/QmUrpWDrQd4CyYyiRit8A7ydeqm7SmDQKA9HANTpsrunmP"
}
```

Using it with the 3Box:

```javascript
Box.create(provider, {
  ghostPinbot: "/dns4/_domain.com/tcp/443/wss/ipfs/QmUrpWDrQd4CyYyiRit8A7ydeqm7SmDQKA9HANTpsrunmP"
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
             "thread": "hello-world-thread"
         }
     ]
     ```

----
  #### Get IPFS peer information
    
  Gets IPFS peer information.

* **URL**

  `/info`

* **Method:**

  `GET`
  
* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
     ```json
     {
         "id": "QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
         "multiaddrs": {
             "_multiaddrs": [
                 "/ip4/127.0.0.1/tcp/4001/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
                 "/ip4/192.168.1.4/tcp/4001/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
                 "/ip4/127.0.0.1/tcp/4002/ws/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
                 "/ip4/192.168.1.4/tcp/4002/ws/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
                 "/p2p-circuit/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
                 "/p2p-circuit/ip4/127.0.0.1/tcp/4001/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
                 "/p2p-circuit/ip4/192.168.1.4/tcp/4001/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
                 "/p2p-circuit/ip4/127.0.0.1/tcp/4002/ws/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu",
                 "/p2p-circuit/ip4/192.168.1.4/tcp/4002/ws/ipfs/QmYJ1UDiztFSkMVfuny8uWrkhVArZUNAdtocxRqWqfWZUu"
             ],
             "_observedMultiaddrs": []
         },
         "protocols": {}
     }
     ```

## Maintainers
[@simonovic86](https://github.com/simonovic86)

## Contributing
If you want to add new features to the pinbot or submit bug reports please submit a PR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
