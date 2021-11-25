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
import { messageReadInputData, newMessageInputData, startChatInputData } from "../model/messaging.schemas.js"
import Ajv from 'ajv'
import crypto from 'crypto'
import { Message } from '../model/Message.js'
import * as Database from './database.js'
const ajv = new Ajv({ allErrors: true, validateSchema: false })

/**
 * Class that implements the business logic for events 'start_chat', 'new_message', and 'message_read'.
 */
export default class Messenger {

    /**
     * Handles event 'start_chat'. If processing is succesfull invoke callback passing true; false otherwise.
     * @param {*} senderID - the consumer/sender ID received from downstreams.
     * @param {*} data - the data sent by consumer. It has to match an expected schema.
     * @param {*} callback - callback to be invoked.
     */
    static handlerStartChat (senderID, data, callback) {
        try {
            // validate data
            Logger.info(`processing new message from ${senderID}...`)
            const isValid = Messenger.#validateData(data, startChatInputData)
            if (!isValid) callback(false)

            // start internal structures
            const chatID = crypto.randomBytes(20).toString('hex')
            Database.activeChats[chatID] = [senderID, data.counterpartyID]
            Database.messages[chatID] = []
            Database.clientSockets[senderID] = this
            Database.clientSockets[data.counterpartyID] = this

            callback(true)

        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

    /**
     * Handles event 'new_message'. If processing is succesfull invoke callback passing true; false otherwise.
     * @param {*} senderID - the consumer/sender ID received from downstreams.
     * @param {*} data - the data sent by consumer. It has to match an expected schema.
     * @param {*} callback - callback to be invoked.
     */
    static handlerNewMessage (senderID, data, callback) {
        try {
            // validate data
            Logger.info(`processing new message from ${senderID}...`)
            const isValid = Messenger.#validateData(data, newMessageInputData)
            if (!isValid) callback(false)

            // save new message
            const message = new Message(data.chatID, senderID, 'someone', data.content)
            Database.messages[data.chatID].push(message)

            // send message obj downstream
            Database.activeChats[data.chatID].forEach( (participant) => {
                Messenger.#sendDataDownstream(participant, message, 'message_update')
            })

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
            const isValid = Messenger.#validateData(data, messageReadInputData)
            if (!isValid) callback(false)

            // TODO: mutate message; then update downstreams;
            callback(true)

        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

    static #sendDataDownstream (target, data, event) {
        const socket = Database.clientSockets[target]
        const key = `${target}_${data.id}`
        const chatID = data.chatID
        if (socket != null && !Database.sentData.includes(key)) {
            Database.sentData.push(key)
            socket.emit(event, chatID, data)
        }
    }

    static #validateData (data, schema) {
        return ajv.compile(schema)(data)
    }
}