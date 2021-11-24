import { Logger } from './logger.js'
import { tokenValidation } from './middleware/authorization.js'
import Messenger from './modules/messenger.js'

let managerSocket

export { managerSocket }

export function handler (ioServer) {

  // validates auth token
  ioServer.use(tokenValidation)

  // hooks callback for connections
  ioServer.on('connection', socket => {

    Logger.info(`connecting client through socket ${socket.id}.`)

    managerSocket = socket

    socket.on('new_message', Messenger.handlerNewMessage)
    socket.on('message_read', Messenger.handlerMessageRead)

    socket.on('disconnect', reason => {
      Logger.info(`disconnection reason: ${reason}`)
      Messenger.handlerDisconnect()
      managerSocket = undefined
    })

  })

}