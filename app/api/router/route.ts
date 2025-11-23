/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

/**
 * FINAL ROUTER VERSION
 * - Menangani seluruh intent dari intent parser
 * - Mendukung semua jenis rekomendasi (year, genre, general)
 * - Mendukung character, anime info, rating, dll
 * - Memiliki fallback cerdas jika data kosong
 */

const JIKAN_BASE = "https://api.jikan.moe/v4";

// ===============================
// Utility: Limit cleaner
// ===============================
function pickLimit(params: any) {
  return Math.max(1, Math.min(10, params?.top_n || params?.limit || 5));
}

// ===============================
// Utility: Search anime by title
// ===============================
async function searchAnimeByTitle(title: string) {
  const res = await fetch(
    `${JIKAN_BASE}/anime?q=${encodeURIComponent(title)}&limit=1`
  );
  const j = await res.json();
  return j?.data?.[0] ?? null;
}

export async function POST(req: Request) {
  try {
    const { intent, params } = await req.json();
    if (!intent) return NextResponse.json({ intent: "unknown", data: [] });

    const limit = pickLimit(params);

    // =====================================================
    // 1) ANIME BY YEAR — WITH MULTI FALLBACK
    // =====================================================
    if (intent === "anime_recommendation_by_year") {
      const year = params?.year;
      if (!year) return NextResponse.json({ intent, data: [] });

      // Main attempt — date range
      const url = `${JIKAN_BASE}/anime?start_date=${year}-01-01&end_date=${year}-12-31&order_by=score&sort=desc&limit=50`;
      const res = await fetch(url);
      const j = await res.json();

      let list = j.data ?? [];
      let data = list.slice(0, limit);

      // Fallback 1: Search by year as keyword
      if (data.length === 0) {
        const alt = await fetch(
          `${JIKAN_BASE}/anime?q=${encodeURIComponent(String(year))}&limit=20`
        );
        const altJson = await alt.json();
        const altData = altJson.data ?? [];
        if (altData.length > 0) {
          data = altData.slice(0, limit);
        }
      }

      // Fallback 2: Top Anime
      if (data.length === 0) {
        const topRes = await fetch(`${JIKAN_BASE}/top/anime`);
        const topJson = await topRes.json();
        data = (topJson.data ?? []).slice(0, limit);
      }

      return NextResponse.json({ intent, data });
    }

    // =====================================================
    // 2) RECOMMENDATION BY GENRE — FIXED VERSION
    // =====================================================
    if (intent === "anime_recommendation_by_genre") {
      const genre = params?.genre;
      if (!genre) return NextResponse.json({ intent, data: [] });

      // Step 1 — Get genre list
      const genreRes = await fetch(`${JIKAN_BASE}/genres/anime`);
      const genreJson = await genreRes.json();
      const list = genreJson?.data ?? [];

      const genreObj = list.find(
        (g: any) => g.name.toLowerCase() === genre.toLowerCase()
      );

      if (!genreObj) {
        // fallback: top anime
        const top = await fetch(`${JIKAN_BASE}/top/anime`);
        const topJson = await top.json();
        return NextResponse.json({
          intent,
          data: (topJson.data ?? []).slice(0, limit),
        });
      }

      const genreId = genreObj.mal_id;

      // Step 2 — Search anime by genre id
      const res = await fetch(
        `${JIKAN_BASE}/anime?genres=${genreId}&order_by=score&sort=desc&limit=${limit}`
      );
      const j = await res.json();

      let data = j.data ?? [];

      // fallback to top anime
      if (data.length === 0) {
        const fallback = await fetch(`${JIKAN_BASE}/top/anime`);
        const fb = await fallback.json();
        data = (fb.data ?? []).slice(0, limit);
      }

      return NextResponse.json({ intent, data });
    }

    // =====================================================
    // 3) GENERAL RECOMMENDATION
    // =====================================================
    if (intent === "anime_recommendation_general") {
      const q = params?.query || params?.genre || "";
      const res = await fetch(
        `${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=${limit}`
      );
      const j = await res.json();
      return NextResponse.json({ intent, data: j.data ?? [] });
    }

    // =====================================================
    // 4) ANIME SEARCH (simple)
    // =====================================================
    if (intent === "anime_search") {
      const q = params?.query || "";
      const res = await fetch(
        `${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=${limit}`
      );
      const j = await res.json();
      return NextResponse.json({ intent, data: j.data ?? [] });
    }

    // =====================================================
    // 5) ANIME INFO
    // =====================================================
    if (intent === "anime_info") {
      const title = params?.title;
      if (!title) return NextResponse.json({ intent, data: [] });

      const found = await searchAnimeByTitle(title);
      return NextResponse.json({ intent, data: found ? [found] : [] });
    }

    // =====================================================
    // 6) RATING LOOKUP
    // =====================================================
    if (intent === "rating_lookup") {
      const title = params?.title;
      if (!title) return NextResponse.json({ intent, data: [] });

      const found = await searchAnimeByTitle(title);
      if (!found) return NextResponse.json({ intent, data: [] });

      return NextResponse.json({
        intent,
        data: [
          {
            title: found.title,
            score: found.score,
            members: found.members,
          },
        ],
      });
    }

    // =====================================================
    // 7) CHARACTER BEST
    // =====================================================
    if (intent === "character_best") {
      const animeName = params?.anime || params?.title;
      if (!animeName) return NextResponse.json({ intent, data: [] });

      const found = await searchAnimeByTitle(animeName);
      if (!found) return NextResponse.json({ intent, data: [] });

      const animeId = found.mal_id;
      const res = await fetch(`${JIKAN_BASE}/anime/${animeId}/characters`);
      const j = await res.json();

      const chars = (j.data ?? []).map((c: any) => ({
        name: c.character?.name,
        role: c.role,
        favorites: c.favorites ?? 0,
        image:
          c.character?.images?.jpg?.image_url ??
          c.character?.image_url ??
          null,
      }));

      return NextResponse.json({ intent, data: chars });
    }

    // =====================================================
    // 8) CHARACTER INFO
    // =====================================================
    if (intent === "character_info") {
      const query = params?.character || params?.query;
      if (!query) return NextResponse.json({ intent, data: [] });

      const res = await fetch(
        `${JIKAN_BASE}/characters?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      const j = await res.json();

      const chars = (j.data ?? []).map((c: any) => ({
        name: c.name,
        about: c.about,
        favorites: c.favorites,
        image: c.images?.jpg?.image_url ?? null,
      }));

      return NextResponse.json({ intent, data: chars });
    }

    // =====================================================
    // 9) AIRING SCHEDULE
    // =====================================================
    if (intent === "airing_schedule") {
      const day = params?.day || "today";
      const url =
        day === "today"
          ? `${JIKAN_BASE}/schedules`
          : `${JIKAN_BASE}/schedules/${encodeURIComponent(day)}`;

      const res = await fetch(url);
      const j = await res.json();
      return NextResponse.json({ intent, data: j.data ?? [] });
    }

    // =====================================================
    // 10) EPISODE LIST
    // =====================================================
    if (intent === "episode_list") {
      const title = params?.title;
      if (!title) return NextResponse.json({ intent, data: [] });

      const found = await searchAnimeByTitle(title);
      if (!found) return NextResponse.json({ intent, data: [] });

      const animeId = found.mal_id;
      const res = await fetch(`${JIKAN_BASE}/anime/${animeId}/episodes`);
      const j = await res.json();

      return NextResponse.json({ intent, data: j.data ?? [] });
    }

    // =====================================================
    // 11) TOP & TRENDING
    // =====================================================
    if (intent === "trending_now" || intent === "top_all_time") {
      const res = await fetch(`${JIKAN_BASE}/top/anime`);
      const j = await res.json();
      return NextResponse.json({ intent, data: j.data ?? [] });
    }

    // =====================================================
    // DEFAULT
    // =====================================================
    return NextResponse.json({ intent: "unknown", data: [] });
  } catch (err) {
    console.error("Router error:", err);
    return NextResponse.json(
      { intent: "error", data: [] },
      { status: 500 }
    );
  }
}
