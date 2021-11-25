import { Logger } from '../logger.js'
import { messageReadInputData, newMessageInputData } from "../model/messaging.schemas.js"
import Ajv from 'ajv'
const ajv = new Ajv({ allErrors: true, validateSchema: false })

export default class Messenger {

    static handlerNewMessage (senderID, data, callback) {
        try {
            Logger.info(`processing new message from ${senderID}...`)
            const validate = ajv.compile(newMessageInputData)
            const isValid = validate(data)
            if (!isValid) callback(false)
            callback(true)
        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

    static handlerMessageRead (senderID, data, callback) {
        try {
            Logger.info(`processing message read from ${senderID}...`)
            const validate = ajv.compile(messageReadInputData)
            const isValid = validate(data)
            if (!isValid) callback(false)
            callback(true)
        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

}