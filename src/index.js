//  Copyright 2021 joaophellip
 
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
 
//      http://www.apache.org/licenses/LICENSE-2.0
 
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

import { config as dotConfig } from 'dotenv'
dotConfig()
import * as IOServer from 'socket.io'
import express from 'express'
import { Server } from 'http'
import { handler } from './server-config.js'
import { Logger } from './util/logger.js'

// setup socketIO server
const app = express()
const server = new Server(app)
const ioServer = new IOServer.Server(server, {
    pingInterval: parseInt(process.env.SERVER_PING),
})
handler(ioServer)

// adds baseline route
app.get('/', function (_, res) {
    res.status(200).send('Starting WebSocket connection...')
})

// starts listening on port SERVER_PORT
server.listen(process.env.SERVER_PORT, function () {
    Logger.debug(`listening on port ${process.env.SERVER_PORT}`)
})

export function main () {
    return 'Hello World'
}