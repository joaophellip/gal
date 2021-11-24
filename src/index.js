import { config as dotConfig } from 'dotenv'
dotConfig()
import * as IOServer from 'socket.io'
import express from 'express'
import { Server } from 'http'
import { handler } from './server-config.js'
import { Logger } from './logger.js'

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