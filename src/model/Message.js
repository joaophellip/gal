import crypto from 'crypto'

export class Message {

    constructor (chatID, from, to, content) {
        this.chatID = chatID
        this.from = from
        this.to = to
        this.content = content
        this.id = crypto.randomBytes(10).toString('hex')
    }
}