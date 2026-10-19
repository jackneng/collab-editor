import { WebSocketServer } from "ws";

let content = "";


const wss = new WebSocketServer({ port: 3001 });

function broadcast(message: string) {
    for (const client of wss.clients) {
        client.send(message);
    }
}

wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === "join") {
            socket.send(content);
            return;
        }

        if (data.type === "update") {
            content = data.content;
            console.log(content);
            broadcast(content);
            return;
        }
    })
    
});


console.log("WebSocket server is running on ws://localhost:3001");
