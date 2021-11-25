import 'should'
import * as SocketClient from 'socket.io-client'
import * as IOServer from 'socket.io'
import ExpressApp from 'express'
import HttpServer from 'http'
import crypto from 'crypto'
import quibble from 'quibble'
import * as sinon from "sinon"

function createClient (token) {
  return SocketClient.connect('http://localhost:8080', {
    forceNew: true,
    autoConnect: true,
    // eslint-disable-next-line camelcase
    query: { auth_token: token },
  });
}

describe('Listen for event "new message"', function () {

    let TEST_TOKENS, server, ServerConfig

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

    beforeEach(function () {
      server = new HttpServer.Server(ExpressApp())
    })

    afterEach(function () {
      server.close()
      quibble.reset()
    });

    describe('receives event "new_message" from a client and sucessfully processes it', function () {
      it('should emit true in the callback interface back to client', async function () {

        const clientID = crypto.randomBytes(20).toString('hex')
        const inputData = {
          chatID: crypto.randomBytes(10).toString('hex'),
          content: 'Hi There'
        }

        ServerConfig = await import('../../src/server-config.js')
        const ioServer = new IOServer.Server(server, { cookie: false })
        ServerConfig.handler(ioServer)
        server.listen(8080)

        const client = createClient(TEST_TOKENS.valid_token)

        return new Promise((rs, _) => {
          client.on('disconnect', () => {rs()})
          client.emit('new_message', clientID, inputData,
            (messageProcessed) => {
              messageProcessed.should.equal(true)
              client.disconnect()
            }
          )  
        })

      })
    })

    describe('receives event "new_message" from a client with an expected data structure', function () {
      it('should emit false in the callback interface back to client', async function () {

        const clientID = crypto.randomBytes(20).toString('hex')
        // misses property chatID
        const inputData = {
          content: 'Hi There'
        }

        ServerConfig = await import('../../src/server-config.js')
        const ioServer = new IOServer.Server(server, { cookie: false })
        ServerConfig.handler(ioServer)
        server.listen(8080)

        const client = createClient(TEST_TOKENS.valid_token)

        return new Promise((rs, _) => {
          client.on('disconnect', () => {rs()})
          client.emit('new_message', clientID, inputData,
            (messageProcessed) => {
              messageProcessed.should.equal(false)
              client.disconnect()
            }
          )
        })

      })
    })
    
    describe('receives event "new_message" from a client an unexpectedly fails to process it', function () {
      it('should emit false in the callback interface back to client', async function () {

        const ajvStub = sinon.stub()
        ajvStub.returns({compile: () => sinon.stub().throws()})
        await quibble.esm('ajv', null, ajvStub)

        const clientID = crypto.randomBytes(20).toString('hex')
        // misses property chatID
        const inputData = {
          messageID: crypto.randomBytes(10).toString('hex')
        }

        ServerConfig = await import('../../src/server-config.js')
        const ioServer = new IOServer.Server(server, { cookie: false })
        ServerConfig.handler(ioServer)
        server.listen(8080)

        const client = createClient(TEST_TOKENS.valid_token)

        return new Promise((rs, _) => {
          client.on('disconnect', () => {rs()})
          client.emit('new_message', clientID, inputData,
            (messageProcessed) => {
              messageProcessed.should.equal(false)
              client.disconnect()
            }
          )
        })

      })
    })
})