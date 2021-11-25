import 'should'

describe('Authorization', function () {

    before(function () {
        process.env.ENV = 'TESTING'
        process.env.AUTH_TOKEN = 'test_auth_token'
      })

    after(function () {
        delete process.env.ENV
        delete process.env.AUTH_TOKEN
    })

    describe('calls tokenValidation with a valid token as argument', function () {
        it('should triggers next callback without arguments', async function () {
            // eslint-disable-next-line camelcase
            const socket = {handshake: {query: {auth_token: 'test_auth_token'}}}
            const module = await import('../../src/middleware/authorization.js')

            module.Authorization.tokenValidation(socket, (...args) => {
                args.should.be.empty()
            })
        })
    })

    describe('calls tokenValidation with an invalid token as argument', function () {
        it('should triggers next callback without passing Error as argument', async function () {
            // eslint-disable-next-line camelcase
            const socket = {handshake: {query: {auth_token: 'invalid_auth_token'}}}
            const module = await import('../../src/middleware/authorization.js')

            module.Authorization.tokenValidation(socket, (...args) => {
                args[0].should.be.an.instanceOf(Error).and.have.property('message', 'Authentication error')
            })
        })
    })

})