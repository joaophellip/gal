import { Logger } from '../logger.js';

export default class Messenger {

    static handlerNewMessage (senderID, _, callback) {
        try {
            Logger.info(`new message from ${senderID}`)
            callback(true)
        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

    static handlerMessageRead (senderID, _, callback) {
        try {
            Logger.info(`message read by ${senderID}`)
            callback(true)
        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

}