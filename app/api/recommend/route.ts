import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
  Kamu adalah sistem rekomendasi anime ...
  Struktur JSON wajib seperti:

  [
    {
      "title": "",
      "genre": [],
      "synopsis": "",
      "reason": ""
    }
  ]

  Permintaan user: ${prompt}
  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
