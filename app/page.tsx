/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import InputBox from "./components/InputBox";
import Loader from "./components/Loader";
import IntentRender from "./components/IntentRender";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // Final data format: { intent: string, data: any[] }
  const [result, setResult] = useState<{
    intent?: string;
    data?: any[];
  }>({ intent: undefined, data: [] });

  const [error, setError] = useState<string | null>(null);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult({ intent: undefined, data: [] });

    try {
      // ============================
      // 1) CALL INTENT PARSER API
      // ============================
      const intentRes = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const intentData = await intentRes.json();
      console.log("INTENT RESULT:", intentData);

      if (!intentData || intentData.intent === "unknown") {
        setError("I couldn't understand your request.");
        setLoading(false);
        return;
      }

      // ============================
      // 2) CALL ROUTER (JIKAN DATA FETCH)
      // ============================
      const routerRes = await fetch("/api/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intentData),
      });

      const finalResult = await routerRes.json();
      console.log("ROUTER RESULT:", finalResult);

      setResult({
        intent: finalResult.intent,
        data: finalResult.data ?? [],
      });
    } catch (err) {
      console.error(err);
      setError("Request failed. Check console.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold">Anivise</h1>

      {/* Input box */}
      <InputBox
        prompt={prompt}
        setPrompt={setPrompt}
        onSend={sendPrompt}
        loading={loading}
      />

      {/* Loading animation */}
      {loading && <Loader />}

      {/* Error message */}
      {error && <div className="text-red-400">{error}</div>}

      {/* Final Renderer for UI */}
      <IntentRender intent={result.intent} data={result.data} />
    </div>
  );
}
