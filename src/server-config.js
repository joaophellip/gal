import { Logger } from './logger.js'
import { Authorization } from './middleware/authorization.js'
import Messenger from './modules/messenger.js'

export function handler (ioServer) {

  // validates auth token
  ioServer.use(Authorization.tokenValidation)

  // hooks entrypoint callback for event 'connection'
  ioServer.on('connection', socket => {

    Logger.info(`connecting client through socket ${socket.id}.`)

    // hooks callbacks for events 'new_message' and 'message_read'
    socket.on('new_message', Messenger.handlerNewMessage)
    socket.on('message_read', Messenger.handlerMessageRead)

    // hooks callback for event 'disconnect'
    socket.on('disconnect', reason => {
      Logger.info(`disconnection reason: ${reason}`)
    })

  })

}