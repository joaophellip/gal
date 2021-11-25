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