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

import 'should'
import * as SocketClient from 'socket.io-client'
import * as IOServer from 'socket.io'
import ExpressApp from 'express'
import HttpServer from 'http'
import crypto from 'crypto'
import quibble from 'quibble'
import * as sinon from "sinon"

function createClient (clientID, token) {
  return SocketClient.connect('http://localhost:8080', {
    forceNew: true,
    autoConnect: true,
    transportOptions: {
      polling: {
        extraHeaders: {
          authorization: `Bearer ${token}`,
          clientid: clientID
        }
      }
    }
  })
}

describe('Listen for event "start_chat"', function () {

    let TEST_TOKENS, server, activeChatsStub, messagesStub, sentDataStub, clientSocketsStub

    before(async function () {
      process.env.ENV = 'TESTING'
      process.env.AUTH_TOKEN = 'test_auth_token'
      TEST_TOKENS = {
        // eslint-disable-next-line camelcase
        valid_token: process.env.AUTH_TOKEN
      }
    })

    after(function () {
      delete process.env.ENV
      delete process.env.AUTH_TOKEN
    })

    beforeEach(async function () {
      [activeChatsStub, messagesStub, sentDataStub, clientSocketsStub] = [{}, {}, [], {}]
      server = new HttpServer.Server(ExpressApp())
      await quibble.esm('../../src/modules/database.js', {activeChats: activeChatsStub,
        messages: messagesStub, sentData: sentDataStub, clientSockets: clientSocketsStub})
    })

    afterEach(function () {
      server.close()
      quibble.reset()
    });

    describe('receives event "start_chat" from a client and sucessfully processes it', function () {
      it('should emit true in the callback interface back to client', async function () {

        const clientID = crypto.randomBytes(20).toString('hex')
        const inputData = {
          counterpartyID: crypto.randomBytes(10).toString('hex'),
        }

        const Module = await import('../../src/server-config.js')
        const ioServer = new IOServer.Server(server, { cookie: false })
        Module.ServerConfig.handler(ioServer)
        server.listen(8080)

        return new Promise((rs, _) => {
          const client = createClient(clientID, TEST_TOKENS.valid_token)
          client.on('disconnect', () => rs())
          client.emit('start_chat', inputData,
            (messageProcessed) => {
              messageProcessed.should.equal(true)
              Object.keys(messagesStub).should.have.length(1)
              Object.keys(activeChatsStub).should.have.length(1)
              client.disconnect()
            }
          )
        })

      })
    })

    describe('receives event "start_chat" from a client with an expected data structure', function () {
      it('should emit false in the callback interface back to client', async function () {

        const clientID = crypto.randomBytes(20).toString('hex')
        // empty data
        const inputData = {}

        const Module = await import('../../src/server-config.js')
        const ioServer = new IOServer.Server(server, { cookie: false })
        Module.ServerConfig.handler(ioServer)
        server.listen(8080)

        const client = createClient(clientID, TEST_TOKENS.valid_token)

        return new Promise((rs, _) => {
          client.on('disconnect', () => {rs()})
          client.emit('start_chat', inputData,
            (messageProcessed) => {
              messageProcessed.should.equal(false)
              client.disconnect()
            }
          )
        })

      })
    })

    describe('receives event "start_chat" from a client an unexpectedly fails to process it', function () {
      it('should emit false in the callback interface back to client', async function () {

        const ajvStub = sinon.stub()
        ajvStub.returns({compile: () => sinon.stub().throws()})
        await quibble.esm('ajv', null, ajvStub)

        const clientID = crypto.randomBytes(20).toString('hex')
        // empty data
        const inputData = {}

        const Module = await import('../../src/server-config.js')
        const ioServer = new IOServer.Server(server, { cookie: false })
        Module.ServerConfig.handler(ioServer)
        server.listen(8080)

        const client = createClient(clientID, TEST_TOKENS.valid_token)

        return new Promise((rs, _) => {
          client.on('disconnect', () => {rs()})
          client.emit('start_chat', inputData,
            (messageProcessed) => {
              messageProcessed.should.equal(false)
              client.disconnect()
            }
          )
        })

      })
    })
})