"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");

  function handleChange(value: string) {
    setContent(value);
  }

  return (
    <main style={{
        maxWidth: 800,
        margin: "10px",
        padding: 24,
        fontFamily: "Arial, sans-serif",
    }}>
      <h1 className="text-4xl font-bold">Collab Editor</h1>
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
