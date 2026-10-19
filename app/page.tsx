"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Connecting");

  const socketRef = useRef<WebSocket | null>(null);

  function handleChange(value: string) {
    setContent(value);

    const socket = socketRef.current;
    if (socket) {
      socket.send(
        JSON.stringify(value)
      );
    }
  }

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("Connected");
    };

    socket.onclose = () => setStatus("Disconnected");
    socket.onerror = () => setStatus("Connection error");

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  return (
    <main style={{
        maxWidth: 800,
        margin: "10px",
        padding: 24,
        fontFamily: "Arial, sans-serif",
    }}>
      <h1 className="text-4xl font-bold">Collab Editor</h1>
      <p>Status: {status}</p>
      <textarea
        value={content}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Let's collab"
        style={{
          boxSizing: "border-box",
          width: "100%",
          minHeight: 350,
          padding: 16,
          fontSize: 16,
          lineHeight: 1.6,
        }}
      />
    </main>
  );
}
