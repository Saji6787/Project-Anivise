/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import InputBox from "./components/InputBox";
import Loader from "./components/Loader";
import IntentRender from "./components/IntentRender";

import PointerGlow from "./components/PointerGlow";
import BackgroundShapes from "./components/BackgroundShapes";
import FullScreenLoader from "./components/FullScreenLoader";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
    // Keep previous result until new one is ready to avoid flicker, or clear if desired.
    // setResult({ intent: undefined, data: [] }); 

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
      
      // Switch to results view on success
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setError("Request failed. Check console.");
    }

    setLoading(false);
  };

  const handleLogoClick = () => {
    setHasSearched(false);
    setPrompt("");
    setResult({ intent: undefined, data: [] });
  };

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden">
      <BackgroundShapes />
      <PointerGlow />
      <FullScreenLoader loading={loading} />

      {/* =========================================
          VIEW 1: HOME (Initial State)
         ========================================= */}
      {!hasSearched && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="w-full py-4 flex justify-center items-center bg-gradient-to-b from-white to-transparent z-10">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Anivise
            </h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 z-10">
            <div className="max-w-2xl w-full text-center space-y-8">
              {/* Slogan */}
              <div className="space-y-2">
                <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 pb-2">
                  Your Intelligent Anime Companion
                </h2>
                <p className="text-lg md:text-xl text-gray-300">
                  Discover, explore, and find your next favorite series with AI.
                </p>
              </div>

              {/* Input Box */}
              <div className="w-full transform transition-all duration-300 hover:scale-[1.01]">
                <InputBox
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSend={sendPrompt}
                  loading={loading}
                  placeholder="Ask anything about anime"
                />
              </div>
              
              {/* Error message (Home) */}
              {error && <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded-lg inline-block">{error}</div>}
            </div>
          </main>
        </div>
      )}

      {/* =========================================
          VIEW 2: RESULTS (After Search)
         ========================================= */}
      {hasSearched && (
        <div className="flex-1 flex flex-col z-10 animate-in fade-in duration-500">
          {/* Top Bar */}
          <header className="w-full py-4 px-6 flex flex-col md:flex-row items-center gap-4 bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
            <h1 
              onClick={handleLogoClick}
              className="text-xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 cursor-pointer hover:opacity-80 transition"
            >
              Anivise
            </h1>
            
            <div className="flex-1 w-full md:max-w-xl">
               <InputBox
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSend={sendPrompt}
                  loading={loading}
                  placeholder="Ask another question..."
                />
            </div>
          </header>

          {/* Results Content */}
          <main className="flex-1 p-6 overflow-y-auto">
             <div className="max-w-7xl mx-auto">
                {error && <div className="text-red-400 mb-4">{error}</div>}
                <IntentRender intent={result.intent} data={result.data} />
             </div>
          </main>
        </div>
      )}
    </div>
  );
}
