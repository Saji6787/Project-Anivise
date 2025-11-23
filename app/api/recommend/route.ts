import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt" }, { status: 400 });
    }

    // 1. ASK GEMINI FOR INTENT
    const intentRes = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an anime intent parser. OUTPUT STRICT JSON ONLY.

Your job:
- Detect user intent
- Extract parameters
- Determine quantity (top_n)

Output Format:
{
  "intent": "anime_by_year" | "anime_search" | "anime_rating" | "character_search",
  "year": number | null,
  "query": string | null,
  "character": string | null,
  "top_n": number
}

QUANTITY RULES (IMPORTANT):
- If user says "nomor 1", "no 1", "salah satu", "satu", "one", 
  "paling bagus", "yang terbaik", "top 1" → top_n = 1
- If user explicitly says a number (ex: "anime terbaik 3", "tiga anime") → top_n = that number
- If user says "beberapa", "some", "a few" → top_n = 3
- If quantity not specified → default top_n = 10

Now parse this user message: ${prompt}
`
                },
              ],
            },
          ],
        }),
      }
    );

    const intentJSON = await intentRes.json();

    const rawIntent =
      intentJSON?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let intent;
    try {
      intent = JSON.parse(rawIntent);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse intent", raw: rawIntent },
        { status: 500 }
      );
    }

    // Debug
    console.log("INTENT PARSED:", intent);

    const { intent: type, year, query, character, top_n } = intent;

    // 2. BUILD JIKAN URL
    let apiUrl = "";

    if (type === "anime_by_year") {
      apiUrl = `https://api.jikan.moe/v4/anime?start_date=${year}-01-01&end_date=${year}-12-31&order_by=score&sort=desc`;
    }

    if (type === "anime_search") {
      apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
        query
      )}&order_by=score&sort=desc`;
    }

    if (type === "anime_rating") {
      apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`;
    }

    if (type === "character_search") {
      apiUrl = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(
        character
      )}`;
    }

    if (!apiUrl) {
      return NextResponse.json({ error: "Unknown intent", intent }, { status: 400 });
    }

    // 3. CALL JIKAN API
    const jikanRes = await fetch(apiUrl);
    const jikanJson = await jikanRes.json();
    const list = jikanJson.data || [];

    // 4. ENFORCE top_n
    const limited = list.slice(0, top_n || 10);

    return NextResponse.json({
      intent: type,
      request: prompt,
      top_n,
      data: limited,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
