import { WebSocketServer } from "ws";

let content = "";


const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (socket) => {
    socket.on("message", (data) => {
        const message = JSON.parse(data.toString());
        content = message;
        // console.log(content);
    })
    
});


console.log("WebSocket server is running on ws://localhost:3001");
