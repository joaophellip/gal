import crypto from 'crypto'

/**
 * This class represents a Message, and holds the appropriate data
 */
export class Message {

    constructor (chatID, from, content) {
        this.chatID = chatID
        this.from = from
        this.content = content
        this.id = crypto.randomBytes(10).toString('hex')
        this.readyBy = []
    }
}