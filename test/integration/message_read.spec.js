import 'should'
import * as SocketClient from 'socket.io-client'
import * as IOServer from 'socket.io'
import ExpressApp from 'express'
import HttpServer from 'http'
import crypto from 'crypto';

function createClient (token) {
  return SocketClient.connect('http://localhost:8080', {
    forceNew: true,
    autoConnect: true,
    // eslint-disable-next-line camelcase
    query: { auth_token: token },
  });
}

describe('Listen for event "message read"', function () {

    let TEST_TOKENS, server, ServerConfig

    before(async function () {
      process.env.ENV = "TESTING"
      process.env.AUTH_TOKEN = "test_auth_token"
      TEST_TOKENS = {
        // eslint-disable-next-line camelcase
        valid_token: process.env.AUTH_TOKEN,
        // eslint-disable-next-line camelcase
        invalid_token: "test_wrong_token",
      };
      ServerConfig = await import('../../src/server-config.js')
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
    });

    describe('receives event "message_read" from a client and sucessfully processes it', function () {
      it('should emit true in the callback interface back to client', function (done) {

        const clientID = crypto.randomBytes(20).toString('hex')
        const inputData = {
          chatID: crypto.randomBytes(10).toString('hex'),
          messageID: crypto.randomBytes(10).toString('hex')
        }

        const ioServer = new IOServer.Server(server, { cookie: false })
        ServerConfig.handler(ioServer)
        server.listen(8080)

        const client = createClient(TEST_TOKENS.valid_token)

        client.on('disconnect', () => {done()})

        client.emit('message_read', clientID, inputData,
          (messageProcessed) => {
            messageProcessed.should.equal(true)
            client.disconnect()
          }
        )

      })
    })
    
})