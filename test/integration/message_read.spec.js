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

async function startServer (server) {
  const Module = await import('../../src/server-config.js')
  const ioServer = new IOServer.Server(server, { cookie: false })
  Module.ServerConfig.handler(ioServer)
  server.listen(8080)
}

describe('Listener event "message_read"', function () {

    let TEST_TOKENS, server, activeChatsStub, messagesStub, messagesMapStub, sentDataStub

    before(function () {
      process.env.ENV = 'TESTING'
      process.env.AUTH_TOKEN = 'test_auth_token'
      TEST_TOKENS = {
        validToken: process.env.AUTH_TOKEN
      }
    })

    after(function () {
      delete process.env.ENV
      delete process.env.AUTH_TOKEN
    })

    beforeEach(async function () {
      [activeChatsStub, messagesStub, messagesMapStub, sentDataStub] = [{}, {}, {}, []]
      server = new HttpServer.Server(ExpressApp())
      await quibble.esm('../../src/modules/database.js', {activeChats: activeChatsStub,
        messages: messagesStub, messagesMap: messagesMapStub, sentData: sentDataStub})
    })

    afterEach(function () {
      server.close()
      quibble.reset()
    })

    describe('receives event "message_read" from a client with an expected data structure', function () {
      it('should emit false in the callback interface back to client', async function () {

        const clientID = crypto.randomBytes(20).toString('hex')
        // misses property chatID
        const inputData = {
          messageID: crypto.randomBytes(10).toString('hex')
        }

        const Module = await import('../../src/server-config.js')
        const ioServer = new IOServer.Server(server, { cookie: false })
        Module.ServerConfig.handler(ioServer)
        server.listen(8080)

        const client = createClient(clientID, TEST_TOKENS.validToken)

        return new Promise((rs, _) => {
          client.on('disconnect', () => {rs()})
          client.emit('message_read', inputData,
            (...data) => {
              const messageProcessed = data[0]
              const err = data[1]
              messageProcessed.should.equal(false)
              err.content.should.equal('Unexpected data. Please send a valid data object')
              client.disconnect()
            }
          )
        })

      })
    })

    describe('receives event "message_read" from a client an unexpectedly fails to process it', function () {
      it('should emit false in the callback interface back to client', async function () {

        const ajvStub = sinon.stub()
        ajvStub.returns({compile: () => sinon.stub().throws()})
        await quibble.esm('ajv', null, ajvStub)

        const clientID = crypto.randomBytes(20).toString('hex')
        // misses property chatID
        const inputData = {
          messageID: crypto.randomBytes(10).toString('hex')
        }

        const Module = await import('../../src/server-config.js')
        const ioServer = new IOServer.Server(server, { cookie: false })
        Module.ServerConfig.handler(ioServer)
        server.listen(8080)

        const client = createClient(clientID, TEST_TOKENS.validToken)

        return new Promise((rs, _) => {
          client.on('disconnect', () => {rs()})
          client.emit('message_read', inputData,
            (messageProcessed) => {
              messageProcessed.should.equal(false)
              client.disconnect()
            }
          )
        })

      })
    })

    describe('receives event "message_read" from a client and sucessfully processes it', function () {
      it('should emit true in the callback interface back to client', async function () {
        // generate test data
        const clientID = crypto.randomBytes(20).toString('hex')
        const testMessage = {
          chatID: null,
          content: 'Identity thief is not a joke, Jim!'
        }
        const inputData = {
          chatID: null,
          messageID: null
        }

        // start server and connect client
        await startServer(server)
        const client = createClient(clientID, TEST_TOKENS.validToken)

        // register handlers and emit events
        return new Promise((rs, _) => {
          client.on('disconnect', () => {rs()})
          let messagesProcessed = 0
          client.on('message_update', (chatID, data) => {
            chatID.should.equal(inputData.chatID)
            data.should.be.an.Array().and.have.length(1)
            if (messagesProcessed == 0) {
              data[0].readyBy.should.be.an.Array().and.have.length(0)
              // after receiving a first update, we are ready to emit a message_read event
              inputData.messageID = data[0].id
              client.emit('message_read', inputData,
                (messageProcessed) => {
                  messageProcessed.should.equal(true)
                }
              )
            } else if (messagesProcessed == 1) {
              data[0].readyBy.should.be.an.Array().and.have.length(1)
              data[0].readyBy[0].should.equal(clientID)
              client.disconnect()
            }
            messagesProcessed += 1
          })
          // first, we must start a chat and send a test message
          client.emit('start_chat', {counterpartyID: crypto.randomBytes(20).toString('hex')}, (...data) => {
            inputData.chatID = data[1]  // sync chatID created at server
            testMessage.chatID = data[1]  // sync chatID created at server
            client.emit('new_message', testMessage,
              (messageProcessed) => {
                messageProcessed.should.equal(true)
              }
            )
          })
        })
      })
    })

})