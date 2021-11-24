import { Logger } from '../logger.js';

export default class Message {

    handlerNewMessage (_, callback) {
        try {
            Logger.info('new message')
            callback(true)
        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

    handlerMessageRead (_, callback) {
        try {
            Logger.info('message read')
            callback(true)
        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

}