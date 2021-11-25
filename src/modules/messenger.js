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
import { messageReadInputData, newMessageInputData } from "../model/messaging.schemas.js"
import Ajv from 'ajv'
const ajv = new Ajv({ allErrors: true, validateSchema: false })

/**
 * Class that implements the business logic for events 'new_message' and 'message_read'.
 */
export default class Messenger {
    
    /**
     * Handles event 'new_message'. If processing is succesfull invoke callback passing true; false otherwise.
     * @param {*} senderID - the consumer/sender ID received from downstreams.
     * @param {*} data - the data sent by consumer. It has to match an expected schema.
     * @param {*} callback - callback to be invoked.
     */
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

    /**
     * Handles event 'message_read'. If processing is succesfull invoke callback passing true; false otherwise.
     * @param {*} senderID - the consumer/sender ID received from downstreams.
     * @param {*} data - the data sent by consumer. It has to match an expected schema.
     * @param {*} callback - callback to be invoked.
     */
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