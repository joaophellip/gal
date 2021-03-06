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
import { ServerConfig } from '../server-config.js'
const ajv = new Ajv({ allErrors: true, validateSchema: false })

/**
 * Class that implements the business logic for events 'start_chat', 'new_message', and 'message_read'.
 */
export default class Messenger {

    /**
     * Handles event 'start_chat'. If processing is succesfull invoke callback passing true; false otherwise.
     * @param {*} data - the data sent by consumer. It has to match an expected schema.
     * @param {*} callback - callback to be invoked.
     */
    static handlerStartChat (data, callback) {
        try {
            const senderID = this.handshake.headers.clientid

            // validate data
            Logger.info(`processing new message from ${senderID}...`)
            const isValid = Messenger.#validateData(data, startChatInputData)
            if (!isValid) callback(false, {content: 'Unexpected data. Please send a valid data object'})

            // init internal structures and live bindings
            const chatID = crypto.randomBytes(20).toString('hex')
            Database.activeChats[chatID] = [senderID, data.counterpartyID]
            Database.messages[chatID] = []

            callback(true, chatID)

        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

    /**
     * Handles event 'new_message'. If processing is succesfull invoke callback passing true; false otherwise.
     * @param {*} data - the data sent by consumer. It has to match an expected schema.
     * @param {*} callback - callback to be invoked.
     */
    static handlerNewMessage (data, callback) {
        try {
            const senderID = this.handshake.headers.clientid

            // validate data
            Logger.info(`processing new message from ${senderID}...`)
            const isValid = Messenger.#validateData(data, newMessageInputData)
            if (!isValid) callback(false, {content: 'Unexpected data. Please send a valid data object'})

            // save new message
            const message = new Message(data.chatID, senderID, data.content)
            Database.messages[data.chatID].push(message)
            Database.messagesMap[message.id] = message

            // update chat participants with up-to-date messages
            Database.activeChats[data.chatID].forEach( (participant) => {
                Messenger.#sendDataDownstream(participant, Database.messages[data.chatID])
            })

            callback(true)

        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

    /**
     * Handles event 'message_read'. If processing is succesfull invoke callback passing true; false otherwise.
     * @param {*} data - the data sent by consumer. It has to match an expected schema.
     * @param {*} callback - callback to be invoked.
     */
    static handlerMessageRead (data, callback) {
        try {
            const senderID = this.handshake.headers.clientid

            // validate data
            Logger.info(`processing message read from ${senderID}...`)
            const isValid = Messenger.#validateData(data, messageReadInputData)
            if (!isValid) callback(false, {content: 'Unexpected data. Please send a valid data object'})

            // add senderID to readBy list
            Database.messages[data.chatID]
            Database.messagesMap[data.messageID].readyBy.push(senderID)

            // update chat participants with up-to-date messages
            Database.activeChats[data.chatID].forEach( (participant) => {
                Messenger.#sendDataDownstream(participant, Database.messages[data.chatID])
            })

            callback(true)

        } catch (err) {
            Logger.error(err)
            callback(false)
        }
    }

    /**
     * Sends a list of messages downstream via an open socketIO channel.
     * @param {*} target - the consumer/sender ID in the receiving end.
     * @param {*} data - the data to be sent to the consumer. Usually a list of messages associated to that consumer.
     */
    static #sendDataDownstream (target, data) {
        const socket = ServerConfig.clientSockets[target]
        const chatID = data[0].chatID
        if (socket != null) socket.emit('message_update', chatID, data)
    }

    /**
     * Validates data object structure using with AJV.
     * @param {*} data - data.
     * @param {*} schema - an object representing an expected structure in AJV format.
     */
    static #validateData (data, schema) {
        return ajv.compile(schema)(data)
    }
}