import * as SocketClient from 'socket.io-client'
import { createInterface } from 'readline'

const commands = [
  {
    name: 'exit',
    description: 'disconects client'
  },
  {
    name: 'connect',
    description: 'ex: connects to server; ex: connect :user '
  },
  {
    name: 'start_chat',
    description: 'ex: starts a chat; ex: start_chat {"counterpartyID": "user002"} '
  },
  {
    name: 'new_message',
    description: 'ex: sends a message; new_message {"chatID": "abc", "content": "Hi there"} '
  },
  {
    name: 'message_read',
    description: 'ex: signals message was read; message_read {"chatID": "abc", "messageID": "abc"} '
  }
]

const session = {
  'clientID': null
}

const cmd = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'CLI>'
})

function connectToService (host, port, _) {
  const token = 'TESTE'
  const client = SocketClient.connect(`${host}:${port}`, {
    transportOptions: {
      polling: {
        extraHeaders: {
          authorization: `Bearer ${token}`,
        }
      }
    }
  })
  return client
}

function disconnectFromService () {
  client.disconnect()
  cmd.prompt()
}

function handleEmitEvent (client, eventName, payload) {
  client.emit(eventName, payload, (processed) => {
    if (processed) {
      console.log(`event ${eventName} processed successfully.`)
    } else {
      console.log(`server failed to process event ${eventName}.`)
    }
  })
}

function setupClient (client) {
  client.on('error', (e) => {
    console.log('Oops something went wrong', e)
  })
  client.on('disconnect', () => {
    console.log('Server has died :(')
    process.exit(1)
  })
  client.on('message_update', (...data) => {
    console.log(data[0], data[1])
    cmd.prompt()
  })
}

let client = null
cmd.prompt()

cmd.on('line', async (line) => {
  console.log(line)
  const params = line.trim().split(' ')
  const eventName = params[0]
  if (eventName === 'exit') {
    process.exit(0)
  }
  if (eventName === 'connect') {
    const clientID = params[1]
    session.clientID = clientID;
    console.log(`clientID: ${clientID}`)
    client = await connectToService(
      'http://localhost',
      '8080',
      clientID,
    )
    setupClient(client)
    cmd.prompt()
  } else if (eventName === 'start_chat' || eventName === 'new_message' || eventName === 'message_read') {
    if (client == null) {
      console.log('It looks like you are not connected. Have you tried "connect :id"?')
      cmd.prompt()
      return
    }
    let args = [0]
    if (params.length > 1) {
      args = params.slice(1).join('')
    }
    console.log(`event ${eventName}; payload ${args}`)
    handleEmitEvent(client, args)
  } else if (eventName === 'disconnect') {
    if (client == null) {
      console.log('It looks like you are not connected. Have you tried "connect :id"?')
      cmd.prompt()
      return
    }
    disconnectFromService()
  } else if (eventName === 'help') {
    commands.forEach(cm => {
      console.log(`${cm.name} \t ${cm.description}`);
    })
    cmd.prompt()
  } else if (eventName === '') {
    cmd.prompt()
  }
})
