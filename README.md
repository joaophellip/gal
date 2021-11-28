<!--
 Copyright 2021 joaophellip
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

# gal

A small messaging service written in Javascript ES2020 and aiming NodeJS v14.

## Running locally

Gal is built to run inside a docker container. So the first thing you're gonna need is a Docker Engine installed in your environment. See the official [install guide](https://docs.docker.com/engine/install/) for instructions. You also need to have Docker-Compose installed in order to run the docker-compose.yml config file that contains the service directives. See the official [guide](https://docs.docker.com/compose/install/) for instructions as well.

In addition to the server codebase, this repo contains a CLI script that can be used to quicly interact with the server for debugging. For that, you need a proper NodeJS installation along with your preferred packaging manager. Note that server was tested using version Node v14.18.1, but it should also work up to v17.1.0.

Before running, you need to provide an env file. Add in the root folder a `.env` file containing this set of variables:

```
SERVER_PORT=8080
EXPOSED_PORT=3009
SERVER_PING=15000
ENV=DEV
AUTH_TOKEN=M2IBCgKCAQEAsxIBOOvbXuCyPelkG1FZQblPFzgxaqZSZXXcOW7bji4tDl00yrlmLL6+3sBRwexEauQZtBuuvEwLRr9LD8dp6DgLkgxF4mVWSLF9/RHwCy67m6yovU4UzhNQKYTgAjmn+dsFrp+WDzq6tfz6x83PlsTdzjGb9ugRe+3FcL8JnRI5LRoDUoPTd441osddiI8n+laWVncYmrVEyD/M/d9+90vlSGilDJeyKHnRtMEqBxK9fCMKrpIN39MJKxSW9PUEgb2nz0LvA20vud/7YN+pIC200Q2P2ZeVH2DZfHFrgnkYIR/JcdjqJPPooj/d/ai/Yy4wd5PeyJDnjBhoA8uMWQIDAQC1
```

Once we are all set with this initial setup, simple run the following command on the root folder:

`docker-compose up`

You should be these lines in your terminal, meaning your server is running as expected:

![docker-compose up](https://github.com/joaophellip/gal/blob/readme/docker-compose-up.png?raw=true)

In order to run the CLI, just do:

`npm cli.js`

Then use the command help to see the possible ways to interact with the server:

IMG
