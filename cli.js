import * as SocketClient from 'socket.io-client'
import { createInterface } from 'readline'
import { KJUR, KEYUTIL } from 'jsrsasign'
const jwtCreator = KJUR.jws.JWS
import { readFile } from 'jsrsasign-util'
import { join } from 'path'
import { tmpdir } from 'os'

const commands = [
  {
    "name": "exit",
    "description": "disconect all clients"
  },
  {
    "name": "disconnect",
    "description": "disconect all clients by invoking disconnect()"
  },
  {
    "name": "sync",
    "description": "ex: ready_deliverers {\"latitude\": -26, \"longitude\": -24, \"radius\": 10000} "
  },
  {
    "name": "ready_restaurants",
    "description": "ex: ready_restaurants {\"latitude\": -26, \"longitude\": -24, \"radius\": 10000} "
  },
  {
    "name": "new_location",
    "description": "ex: new_location {\"latitude\": -26, \"longitude\": -24} "
  },
  {
    "name": "order_event",
    "description": "ex: order_event {\"orderID\": \"oioioi\", \"event\": 401} "
  },
  {
    "name": "connect",
    "description": "ex: connect :clientID :actorType"
  }
];

const session = {
  "clientID": null,
  "actorType": null
};

const cmd = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "CLI>",
});

async function readPrivateKeyFromStorage(tempFilePath) {
  try {
    const bucket = admin.storage().bucket();
    await bucket.file("key.pem").download({ destination: tempFilePath });
  } catch (err) {
    console.log(err);
  }

}

function getTempFilePath() {
  const filename =
    "cozo-" +
    Math.random()
      .toString(16)
      .slice(2);
  return join(tmpdir(), filename);
}

async function createToken(clientID, actorType) {
  const tokenPayload = {
    baseUrl: "cli.base.url",
    encryptedToken: "cli.encryptedToken",
    appId: "cli.appID",
    defaultShippingAddress: "cli.default shipping address",
    sub: clientID,
    actorType: +actorType,
    iat: new Date().toISOString(),
  };
  const tokenHead = {
    alg: "RS512",
    cty: "JWT",
  };
  const path = getTempFilePath();
  await readPrivateKeyFromStorage(path);
  const pemFile = readFile(path);
  const privateKey = KEYUTIL.getKey(pemFile, "");
  const jwtToken = jwtCreator.sign(null, tokenHead, tokenPayload, privateKey);
  return jwtToken;
}

async function connectToManager(host, port, clientID, actorType) {
  const token = await createToken(clientID, actorType);
  console.log("jwtToken: ", token);
  const client = io(`${host}:${port}`, {
    transportOptions: {
      polling: {
        extraHeaders: {
          authorization: `Bearer ${token}`,
        },
      },
    },
  });
  return client;
}

function disconnectFromManager() {
  client.disconnect();
  cmd.prompt();
}

function handleReadyRestaurants(client, payload) {
  client.on("restaurants", (restaurantsData) => {
    console.log("restaurants response: ", JSON.stringify(restaurantsData));
    cmd.prompt();
  });
  client.emit("ready_restaurants", payload);
}

function handleReadyDeliverers(client, payload) {
  client.on("deliverers", (data) => {
    console.log("deliverers in the area: ", JSON.stringify(data));
    cmd.prompt();
  });
  client.emit("ready_deliverers", payload);
}

function handleNewLocation(client, payload) {
  client.emit("new_location", payload);
  cmd.prompt();
}

function handleOrderEvent(client, payload) {
  client.emit("order_event", payload);
  cmd.prompt();
}

function setupClient(client) {
  client.on("error", (e) => {
    console.log("Oops algo deu errado", e);
  });

  client.on("disconnect", () => {
    console.log("Servidor morreu :(");
    process.exit(1);
  });
}

let client = null;
cmd.prompt();

cmd.on("line", async (line) => {
  console.log(line);
  // ready_restaurants "{\"latitude\":1, \"longitude\":1, \"radius\":1}"
  // https://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurrence
  const params = line.trim().split(" ");
  const eventName = params[0];
  if (eventName === "exit") {
    process.exit(0);
  }
  if (eventName === "connect") {
    const clientID = params[1];
    const actorType = params[2];
    session.actorType = actorType;
    session.clientID = clientID;
    console.log("clientID: ", clientID, "actorType: ", actorType);
    client = await connectToManager(
      "http://localhost",
      "20001",
      //"https://dev-mg.cozo.com.br",
      //"443",
      clientID,
      actorType
    );
    setupClient(client);
    cmd.prompt();
  } else if (eventName === "ready_deliverers") {
    if (client == null) {
      console.log("Conecta primeiro infeliz! 'connect id actorType'");
      cmd.prompt();
      return;
    }
    let args = [0];
    if (params.length > 1) {
      args = params.slice(1).join("");
    }
    console.log("event: ", eventName, "payload", args);
    handleReadyDeliverers(client, args);
  } else if (eventName === "new_location") {
    if (client == null) {
      console.log("Conecta primeiro infeliz! 'connect id actorType'");
      cmd.prompt();
      return;
    }
    let args = [0];
    if (params.length > 1) {
      args = params.slice(1).join("");
    }
    console.log("event: ", eventName, "payload", args);
    handleNewLocation(client, args);
  } else if (eventName === "order_event") {
    if (client == null) {
      console.log("Conecta primeiro infeliz! 'connect id actorType'");
      cmd.prompt();
      return;
    }
    let args = [0];
    if (params.length > 1) {
      args = params.slice(1).join("");
    }
    console.log("event: ", eventName, "payload", args);
    handleOrderEvent(client, args);
  } else if (eventName === "disconnect") {
    if (client == null) {
      console.log("Conecta primeiro infeliz! 'connect id actorType'");
      cmd.prompt();
      return;
    }
    disconnectFromManager();
  } else if (eventName === "help") {
    commands.forEach(cm => {
      console.log(`${cm.name}  \t ${cm.description}`);
    });
    cmd.prompt();
  } else if (eventName === "") {
    cmd.prompt();
  } else {
    if (client == null) {
      console.log("Conecta primeiro infeliz! 'connect id actorType'");
      cmd.prompt();
      return;
    }
    let args = [0];
    if (params.length > 1) {
      args = params.slice(1).join("");
    }
    handleReadyRestaurants(client, args);
  }
});
