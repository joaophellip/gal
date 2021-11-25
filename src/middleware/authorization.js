import { Logger } from '../logger.js'
import * as common from '../common.js'

export class Authorization {

  static tokenValidation (socket, next) {
    Logger.debug(`tokenValidation: ${socket.handshake.query.auth_token} ${common.authorizationToken}`)
    if (socket.handshake.query.auth_token == common.authorizationToken) {
      return next()
    }
    Logger.error('Unauthorized manager.')
    next(new Error('Authentication error'))
  }

}
