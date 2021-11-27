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

import { Logger } from './util/logger.js'
import { Authorization } from './middleware/authorization.js'
import Messenger from './modules/messenger.js'

/**
 * Base Module where the socketIO server is configured. 
 * 
 * @param {*} ioServer - socket IO server object, to which callbacks are attached. Callbacks are hooked for those events
 * to which server is expected to react.
 */
export class ServerConfig {

  static clientSockets = {}

  static handler (ioServer) {

    // validates auth token
    ioServer.use(Authorization.tokenValidation)

    // hooks callback for main event 'connection'
    ioServer.on('connection', socket => {

      const clientID = socket.handshake.headers.clientID
      Logger.info(`connecting ${clientID} through socket ${socket.id}.`)
      ServerConfig.clientSockets[clientID] = socket

      // hooks callbacks for business events
      socket.on('start_chat', Messenger.handlerStartChat)
      socket.on('new_message', Messenger.handlerNewMessage)
      socket.on('message_read', Messenger.handlerMessageRead)

      // hooks callback for event 'disconnect'
      socket.on('disconnect', reason => {
        Logger.info(`disconnection reason: ${reason}`)
      })
  
    })
  
  }

}