import { NextResponse } from "next/server";

/**
 * Intent parser: calls Gemini to convert a free-text user prompt
 * into { intent, params } JSON. Returns { intent, params }.
 *
 * Notes:
 * - Use model gemini-2.5-flash (available in your key). See /mnt/data/models.json.
 * - Make the system instruction strict: only JSON output.
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${key}`;

const SYSTEM_PROMPT = `
You are the intent classifier for the Anivise Anime System.
Output ONLY a valid JSON object, nothing else (no Markdown, no backticks, no explanation).

Choose one intent from the list:
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

Return JSON with shape:
{
  "intent": "<one_of_above>",
  "params": { ... }
}

If uncertain, return intent = "unknown" and params = {}.
`;

function cleanGeneratedText(raw: string | undefined) {
  if (!raw) return "";
  let s = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  // cut everything before first { or [
  const iObj = s.indexOf("{");
  const iArr = s.indexOf("[");
  const first = Math.min(iObj === -1 ? Infinity : iObj, iArr === -1 ? Infinity : iArr);
  if (first !== Infinity) s = s.slice(first);
  // remove trailing extraneous text after JSON (best-effort): keep until last } or ]
  const lastObj = s.lastIndexOf("}");
  const lastArr = s.lastIndexOf("]");
  const last = Math.max(lastObj, lastArr);
  if (last !== -1) s = s.slice(0, last + 1);
  return s.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt: string = body.prompt?.toString() ?? "";
    if (!prompt) return NextResponse.json({ intent: "unknown", params: {} });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    // Build request for Gemini: system instruction + user prompt
    const payload = {
      contents: [
        { parts: [{ text: SYSTEM_PROMPT }] },
        { parts: [{ text: `User: ${prompt}` }] },
      ],
    };

    const resp = await fetch(GEMINI_URL(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await resp.json();

    const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = cleanGeneratedText(raw);

    try {
      const parsed = JSON.parse(cleaned);
      // Basic validation
      if (!parsed || typeof parsed.intent !== "string" || typeof parsed.params !== "object") {
        return NextResponse.json({ intent: "unknown", params: {} });
      }
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("Intent parse failed:", err);
      console.log("CLEANED:", cleaned);
      return NextResponse.json({ intent: "unknown", params: {} });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ intent: "unknown", params: {} }, { status: 500 });
  }
}
