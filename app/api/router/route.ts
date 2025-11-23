/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

/**
 * Intent Router: receives { intent, params } and calls Jikan API accordingly.
 * Returns { intent, data } where data is an array or object cleaned for frontend.
 */

const JIKAN_BASE = "https://api.jikan.moe/v4";

async function searchAnimeByTitle(title: string) {
  const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(title)}&limit=1`);
  const j = await res.json();
  return j?.data?.[0] ?? null;
}

export async function POST(req: Request) {
  try {
    const { intent, params } = await req.json();

    if (!intent) return NextResponse.json({ intent: "unknown", data: [] });

    switch (intent) {
      case "anime_recommendation_by_year": {
        const year = params?.year;
        if (!year) return NextResponse.json({ intent, data: [] });
        // Jikan supports date filtering via start_date/end_date (YYYY-MM-DD)
        const url = `${JIKAN_BASE}/anime?start_date=${year}-01-01&end_date=${year}-12-31&limit=${params.limit || 20}`;
        const res = await fetch(url);
        const j = await res.json();
            const limit = params?.top_n ?? 10;
            return NextResponse.json({
            intent,
            data: (j.data ?? []).slice(0, limit)
            });
      }

      case "anime_recommendation_general": {
        const q = params?.query || params?.genre || "";
        const url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=${params.limit || 20}`;
        const res = await fetch(url);
        const j = await res.json();
        const limit = params?.top_n ?? 10;
            return NextResponse.json({
            intent,
            data: (j.data ?? []).slice(0, limit)
            });

      }

      case "anime_search": {
        const q = params?.query || "";
        const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=${params.limit || 10}`);
        const j = await res.json();
            const limit = params?.top_n ?? 10;
            return NextResponse.json({
            intent,
            data: (j.data ?? []).slice(0, limit)
            });

      }

      case "anime_info": {
        const title = params?.title;
        if (!title) return NextResponse.json({ intent, data: [] });
        const found = await searchAnimeByTitle(title);
        return NextResponse.json({ intent, data: found ? [found] : [] });
      }

      case "rating_lookup": {
        const title = params?.title;
        if (!title) return NextResponse.json({ intent, data: [] });
        const found = await searchAnimeByTitle(title);
        if (!found) return NextResponse.json({ intent, data: [] });
        return NextResponse.json({ intent, data: [ { title: found.title, score: found.score, members: found.members } ] });
      }

      case "character_best": {
        const animeName = params?.anime || params?.title;
        if (!animeName) return NextResponse.json({ intent, data: [] });
        const found = await searchAnimeByTitle(animeName);
        if (!found) return NextResponse.json({ intent, data: [] });

        const animeId = found.mal_id;
        const res = await fetch(`${JIKAN_BASE}/anime/${animeId}/characters`);
        const j = await res.json();
        // j.data is array of { character: {...}, favorites: X, ... }
        const chars = (j.data ?? []).map((c: any) => ({
          name: c.character?.name,
          role: c.role,
          favorites: c.favorites ?? 0,
          image: c.character?.images?.jpg?.image_url ?? c.character?.image_url ?? null,
        }));
        return NextResponse.json({ intent, data: chars });
      }

      case "character_info": {
        const query = params?.character || params?.query;
        if (!query) return NextResponse.json({ intent, data: [] });
        // Jikan has character search
        const res = await fetch(`${JIKAN_BASE}/characters?q=${encodeURIComponent(query)}&limit=5`);
        const j = await res.json();
        const chars = (j.data ?? []).map((c: any) => ({
          name: c.name,
          about: c.about,
          favorites: c.favorites,
          image: c.images?.jpg?.image_url ?? null,
        }));
        return NextResponse.json({ intent, data: chars });
      }

      case "airing_schedule": {
        const day = params?.day || "today";
        const url = day === "today" ? `${JIKAN_BASE}/schedules` : `${JIKAN_BASE}/schedules/${encodeURIComponent(day)}`;
        const res = await fetch(url);
        const j = await res.json();
        // j.data is array of schedules
            const limit = params?.top_n ?? 10;
            return NextResponse.json({
            intent,
            data: (j.data ?? []).slice(0, limit)
            });

      }

      case "episode_list": {
        const title = params?.title;
        if (!title) return NextResponse.json({ intent, data: [] });
        const found = await searchAnimeByTitle(title);
        if (!found) return NextResponse.json({ intent, data: [] });
        const animeId = found.mal_id;
        const res = await fetch(`${JIKAN_BASE}/anime/${animeId}/episodes`);
        const j = await res.json();
            const limit = params?.top_n ?? 10;
            return NextResponse.json({
            intent,
            data: (j.data ?? []).slice(0, limit)
            });
      }

      case "trending_now": {
        const res = await fetch(`${JIKAN_BASE}/top/anime`);
        const j = await res.json();
        const limit = params?.top_n ?? 10;
        return NextResponse.json({
        intent,
        data: (j.data ?? []).slice(0, limit)
        });

      }

      case "top_all_time": {
        const res = await fetch(`${JIKAN_BASE}/top/anime`);
        const j = await res.json();
            const limit = params?.top_n ?? 10;
            return NextResponse.json({
            intent,
            data: (j.data ?? []).slice(0, limit)
            });
      }

      default:
        return NextResponse.json({ intent: "unknown", data: [] });
    }
  } catch (err) {
    console.error("Router error:", err);
    return NextResponse.json({ intent: "error", data: [] }, { status: 500 });
  }
}
