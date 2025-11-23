// app/api/intent/route.ts
import { NextResponse } from "next/server";

/**
 * Intent parser: ask Gemini (gemini-2.5-flash) to return strict JSON:
 * { intent: string, params: { top_n:number, query?, year?, genre?, character?, season?, ... } }
 *
 * Note: This endpoint is intentionally strict and defensive.
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${key}`;

/* Strong system prompt: must return JSON only.
   We include explicit quantity rules so top_n is always present.
*/
const SYSTEM_PROMPT = `
You are an intent parser for an anime website called Anivise.
Output STRICT JSON ONLY (no markdown, no commentary, no backticks).

Output schema:
{
  "intent": "<one_of_intents>",
  "params": {
    "query": string | null,
    "year": number | null,
    "season": "winter"|"spring"|"summer"|"fall" | null,
    "genre": string | null,
    "character": string | null,
    "top_n": number,
    "extras": { ... } // optional
  }
}

Valid intents:
- anime_recommendation_general
- anime_recommendation_by_year
- anime_recommendation_by_season
- anime_recommendation_by_genre
- anime_info
- rating_lookup
- character_best
- character_info
- anime_search
- character_search
- airing_schedule
- episode_list
- trending_now
- top_all_time
- unknown

QUANTITY RULES:
- If user says "salah satu", "nomor 1", "no 1", "top 1", "one", "satu", "yang terbaik", set params.top_n = 1
- If user says explicit number (e.g. "3 anime terbaik"), set params.top_n to that number
- If user says "beberapa", "a few", set params.top_n = 3
- If user gives no quantity, default params.top_n = 10

Examples:
User: "Salah satu anime terbaik di tahun 2020"
Output:
{
  "intent": "anime_recommendation_by_year",
  "params": { "year": 2020, "top_n": 1 }
}

User: "Who is the most popular character in Naruto?"
Output:
{
  "intent": "character_best",
  "params": { "query": "Naruto", "top_n": 1 }
}
`;

// small sanitizer
function sanitizeRaw(raw?: string) {
  if (!raw) return "{}";
  let s = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstObj = Math.min(
    s.indexOf("{") === -1 ? Infinity : s.indexOf("{"),
    s.indexOf("[") === -1 ? Infinity : s.indexOf("[")
  );
  if (firstObj !== Infinity) s = s.slice(firstObj);
  const lastObj = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (lastObj !== -1) s = s.slice(0, lastObj + 1);
  return s.trim();
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ intent: "unknown", params: { top_n: 10 } });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const payload = {
      contents: [
        { parts: [{ text: SYSTEM_PROMPT }] },
        { parts: [{ text: `User: ${prompt}` }] },
      ],
    };

    const res = await fetch(GEMINI_URL(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = sanitizeRaw(raw);

    try {
      const parsed = JSON.parse(cleaned);

      // Defensive normalization:
      const intent = parsed?.intent ?? "unknown";
      const params = parsed?.params ?? {};
      params.top_n = Number(params.top_n ?? params.limit ?? 10) || 10;

      // ensure numeric year if present
      if (params.year) params.year = Number(params.year);

      return NextResponse.json({ intent, params });
    } catch (err) {
      console.error("Intent parse failed:", err);
      console.log("CLEANED INTENT TEXT:", cleaned);
      // fallback: try keyword heuristics quickly (lightweight)
      const lower = prompt.toLowerCase();
      let top_n = 10;
      if (/(salah satu|nomor 1|no 1|top 1|one|satu|yang terbaik)/i.test(lower)) top_n = 1;
      if (/(beberapa|a few|some)/i.test(lower)) top_n = 3;
      const yearMatch = prompt.match(/(19|20)\d{2}/);
      const year = yearMatch ? Number(yearMatch[0]) : null;

      // quick heuristic to choose intent
      let heuristicIntent = "anime_recommendation_general";
      if (/rating|score|rate|rating lookup|berapa rating/i.test(lower)) heuristicIntent = "rating_lookup";
      if (/character|karakter|who is|siapa/i.test(lower)) heuristicIntent = "character_best";
      if (/episode|episodes|episode list/i.test(lower)) heuristicIntent = "episode_list";
      if (/airing|schedule|tayang/i.test(lower)) heuristicIntent = "airing_schedule";

      return NextResponse.json({
        intent: heuristicIntent,
        params: { query: prompt, year, top_n },
      });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ intent: "unknown", params: { top_n: 10 } }, { status: 500 });
  }
}
