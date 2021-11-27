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
    description: 'ex: sends a message; new_message {"chatID": "abc", "content": "Hello"} '
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

function connectToService (host, port, clientID) {
  const token = 'M2IBCgKCAQEAsxIBOOvbXuCyPelkG1FZQblPFzgxaqZSZXXcOW7bji4tDl00yrlmLL6+3sBRwexEauQZtBuuvEwLRr9LD8dp6DgLkgxF4mVWSLF9/RHwCy67m6yovU4UzhNQKYTgAjmn+dsFrp+WDzq6tfz6x83PlsTdzjGb9ugRe+3FcL8JnRI5LRoDUoPTd441osddiI8n+laWVncYmrVEyD/M/d9+90vlSGilDJeyKHnRtMEqBxK9fCMKrpIN39MJKxSW9PUEgb2nz0LvA20vud/7YN+pIC200Q2P2ZeVH2DZfHFrgnkYIR/JcdjqJPPooj/d/ai/Yy4wd5PeyJDnjBhoA8uMWQIDAQC1'
  const client = SocketClient.connect(`${host}:${port}`, {
    transportOptions: {
      polling: {
        extraHeaders: {
          authorization: `Bearer ${token}`,
          clientid: clientID
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
  client.emit(eventName, JSON.parse(payload), (...data) => {
    const processed = data[0]
    if (processed) {
      console.log(`event ${eventName} processed successfully.`)
    } else {
      console.log(`server failed to process event ${eventName}.`)
    }
    if (data[1]) console.log(data[1])
    cmd.prompt()
  })
}

function setupClient (client) {
  client.on('connect_error', (e) => {
    console.log('Oups... a connection error', e)    
  })
  client.on('error', (e) => {
    console.log('Oups something went wrong', e)
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
      '3009',
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
    handleEmitEvent(client, eventName, args)
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
