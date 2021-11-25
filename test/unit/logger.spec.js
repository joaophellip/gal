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
import quibble from 'quibble'
import * as sinon from "sinon"

describe('Logger', function () {
    
    let bunyanStub, fatalStub, errorStub, warnStub, infoStub, debugStub, traceStub

    beforeEach(async function () {
        [bunyanStub, fatalStub, errorStub, warnStub, infoStub, debugStub, traceStub] = 
            [sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub()]
        const streams = [
            {
              level: "trace",
              type: "rotating-file",
              path: "data/app.log",
              period: "1d",
              count: 10,
            },
        ]
        bunyanStub.withArgs({
            name: "galMessagingService",
            streams: streams,
        }).returns({fatal: fatalStub, error: errorStub, warn: warnStub, info: infoStub, debug: debugStub, trace: traceStub})
        await quibble.esm('bunyan', {createLogger: bunyanStub})
      })

    afterEach(function () {
        quibble.reset()
    })

    describe('invokes fatal', function () {
        it('should call log.fatal', async function () {
            const msg = 'a fatal crash occured'
            const logger = await import('../../src/util/logger.js')
            
            return new Promise((rs, rj) => {
                fatalStub.callsFake((...args) => {
                    try {
                        args[0].should.equal(msg)
                        rs()
                    } catch (err) {
                        rj()
                    }
                })
                logger.Logger.fatal(msg)
            })
        })
    })

    describe('invokes error', function () {
        it('should call log.error', async function () {
            const msg = 'an error occured'
            const logger = await import('../../src/util/logger.js')
            
            return new Promise((rs, rj) => {
                errorStub.callsFake((...args) => {
                    try {
                        args[0].should.equal(msg)
                        rs()
                    } catch (err) {
                        rj()
                    }
                })
                logger.Logger.error(msg)
            })
        })
    })

    describe('invokes warn', function () {
        it('should call log.warn', async function () {
            const msg = 'warning: something seems odd'
            const logger = await import('../../src/util/logger.js')

            return new Promise((rs, rj) => {
                warnStub.callsFake((...args) => {
                    try {
                        args[0].should.equal(msg)
                        rs()
                    } catch (err) {
                        rj()
                    }
                })
                logger.Logger.warn(msg)
            })
        })
    })

    describe('invokes info', function () {
        it('should call log.info', async function () {
            const msg = 'something expected occured'
            const logger = await import('../../src/util/logger.js')

            return new Promise((rs, rj) => {
                infoStub.callsFake((...args) => {
                    try {
                        args[0].should.equal(msg)
                        rs()
                    } catch (err) {
                        rj()
                    }
                })
                logger.Logger.info(msg)
            })
        })
    })

    describe('invokes debug', function () {
        it('should call log.debug', async function () {
            const msg = 'debugging code'
            const logger = await import('../../src/util/logger.js')

            return new Promise((rs, rj) => {
                debugStub.callsFake((...args) => {
                    try {
                        args[0].should.equal(msg)
                        rs()
                    } catch (err) {
                        rj()
                    }
                })
                logger.Logger.debug(msg)
            })
        })
    })

    describe('invokes trace', function () {
        it('should call trace.info', async function () {
            const msg = 'tracing code'
            const logger = await import('../../src/util/logger.js')

            return new Promise((rs, rj) => {
                traceStub.callsFake((...args) => {
                    try {
                        args[0].should.equal(msg)
                        rs()
                    } catch (err) {
                        rj()
                    }
                })
                logger.Logger.trace(msg)
            })
        })
    })

})