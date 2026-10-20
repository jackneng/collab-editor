import { WebSocketServer, WebSocket } from "ws";

let content = "";
let revision = 0;

const wss = new WebSocketServer({ port: 3001 });

function send(ws: WebSocket, message: object) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

function broadcast(message: object) {
    for (const client of wss.clients) {
        send(client, message);
    }
}

wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === "join") {
                send(socket, { type: "init", content, revision });
                return;
            }

            if (data.type === "update") {
                // reject if revision not matched
                if (data.baseRevision !== revision) {
                    send(socket, { tpye: "resync", content, revision });
                    return;
                }

                // accept otherwise
                content = data.content;
                revision++;
                console.log(data);

                broadcast({ type: "snapshot", content, revision });
            }
        } catch {
            send(socket, { type: "error", message: "Failed to sync"});
        }
    })
    
});


console.log("WebSocket server is running on ws://localhost:3001");
