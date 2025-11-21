/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import InputBox from "./components/InputBox";
import Loader from "./components/Loader";
import AnimeCard from "./components/AnimeCard";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResults([]);

    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    // Extract JSON text from Gemini response
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    console.log("RAW RESPONSE FROM GEMINI:", raw);

    let jsonData = [];

    try {
      // Clean extra formatting Gemini sometimes adds
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/^[^{\[]+/, "") // remove everything before first { or [
        .trim();

      jsonData = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON Parse Failed:", err);
      console.error("RAW TEXT:", raw);
    }

    if (Array.isArray(jsonData)) {
      setResults(jsonData);
    } else if (typeof jsonData === "object" && jsonData !== null) {
      // Convert object → array
      const arr = Object.values(jsonData).filter((v) => v && typeof v === "object");
      setResults(arr);
    } else {
      setResults([]);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Anivise</h1>

      <InputBox
        prompt={prompt}
        setPrompt={setPrompt}
        onSend={sendPrompt}
        loading={loading}
      />

      {loading && <Loader />}

      <div className="space-y-4">
        {results.map((anime: any, i: number) => (
          <AnimeCard key={i} anime={anime} />
        ))}
      </div>
    </div>
  );
}
