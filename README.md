# 3box-pinbot

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

This package contains a CLI and a Dockerfile for spinning up your pinbot that resides in a Ghost Thread.

## Tabel of Contents
- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Install
```
$ npm install -g 3box-pinbot
```

## Usage
Use the CLI to join a room locally from the console
```shh
# join with pinbot command and supply a room name
pinbot 3box.ghost.<space-name>.<room-name>
```

Use Docker to spin up a bot
```shh
docker build
# supply a room name when running the docker image
docker run 3box.ghost.<space-name>.<room-name>
```

## Maintainers
[@ghiliweld](https://github.com/ghiliweld)

## Contributing
If you want to add new features to the pinbot or submit bug reports please submit a PR.

## Licence
MIT © Ghilia Weldesselasie
