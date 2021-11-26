export const startChatInputData = {
  type: 'object',
  required: ['counterpartyID'],
  properties: {
    counterpartyID: {
      type: 'string'
    }
  }
}

export const newMessageInputData = {
  type: 'object',
  required: ['content', 'chatID'],
  properties: {
    content: {
      type: 'string',
      minLength: 1
    },
    chatID: {
      type: 'string'
    }
  }
}

export const messageReadInputData = {
  type: 'object',
  required: ['messageID', 'chatID'],
  properties: {
    messageID: {
      type: 'string'
    },
    chatID: {
      type: 'string'
    }    
  }
}