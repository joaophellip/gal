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

Once we are all set with this initial setup, simple run the following on the root folder:

`docker-compose up`

You should be something like this:



## Contributing

If you want to contribute you first need to config NodeJS environment . See t