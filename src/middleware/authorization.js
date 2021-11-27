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

import { Logger } from '../util/logger.js'
import * as common from '../util/common.js'

/**
 * Authentication middleware which will either accept or reject a connection based on the consumer's authentication token.
 */
export class Authorization {

  /**
   * Validates a bearer token passed along a socket.
   * 
   * Note that the authentication token is expected to be sent as an additional handshake header.
   * 
   * @param {*} socket - socket object containing an authentication token.
   * @param {*} next - callback to either break logic for this route or continue to the next middleware.
   */
  static tokenValidation (socket, next) {
    const jwtToken = socket.handshake.headers.authorization.split(' ')[1]
    if (jwtToken == common.authorizationToken) return next()

    Logger.error('Unauthorized manager.')
    const err = new Error('Authentication error.')
    err.data = { content: 'Please send a valid credential' } 
    next(err)
  }

}
