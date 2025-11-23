/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export default function IntentRender({
  intent,
  data,
}: {
  intent?: string;
  data?: any[];
}) {
  if (!intent) return null;
  if (!data || data.length === 0)
    return <div className="text-zinc-400">No results found.</div>;

  switch (intent) {
    case "character_best":

    case "anime_recommendation_by_genre":
        return (
            <div className="space-y-4">
            <h2 className="text-xl font-bold capitalize">
                Top {data.length} Anime in Genre: {data[0]?.genres?.[0]?.name ?? ""}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.slice(0, 10).map((anime: any, i: number) => (
                <div
                    key={i}
                    className="p-4 border rounded-lg bg-neutral-900 text-white shadow"
                >
                    <img
                    src={anime.images?.jpg?.image_url}
                    alt={anime.title}
                    className="w-full h-56 object-cover rounded"
                    />

                    <h3 className="text-lg font-semibold mt-2">{anime.title}</h3>

                    <p className="text-sm text-gray-300">
                    Score: {anime.score ?? "N/A"}
                    </p>

                    <p className="text-sm text-gray-400 line-clamp-3">
                    {anime.synopsis ?? "No synopsis available."}
                    </p>
                </div>
                ))}
            </div>
            </div>
        );


    case "character_info":
      return <CharacterCarousel data={data} />;

    case "anime_recommendation_general":
    case "anime_recommendation_by_year":
    case "anime_search":
    case "trending_now":
    case "top_all_time":
      return <AnimeGrid data={data} />;

    case "rating_lookup":
      return <RatingCard data={data[0]} />;

    case "anime_info":
      return <AnimeGrid data={data} />;

    case "episode_list":
      return <EpisodeList data={data} />;

    default:
      return (
        <div className="text-zinc-400">
          No renderer available for intent: {intent}
        </div>
      );
  }
}

/* --------------------------------------------------------
   CHARACTER CAROUSEL
-------------------------------------------------------- */

function CharacterCarousel({ data }: { data: any[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto py-4">
      {data.map((c, i) => (
        <div
          key={i}
          className="min-w-[200px] bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow"
        >
          <img
            src={c.image}
            className="w-full h-40 object-cover rounded-lg mb-3"
            alt={c.name}
          />

          <div className="font-semibold">{c.name}</div>
          <div className="text-sm text-zinc-400">{c.role}</div>
          <div className="text-xs text-zinc-500 mt-1">
            Favorites: {c.favorites}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------
   ANIME GRID
-------------------------------------------------------- */

function AnimeGrid({ data }: { data: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((a, i) => (
        <div
          key={i}
          className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex gap-4 shadow"
        >
          <img
            src={a?.images?.jpg?.image_url ?? a?.image_url ?? ""}
            alt={a.title}
            className="w-28 h-40 object-cover rounded-lg"
          />

          <div>
            <div className="font-bold text-lg">{a.title}</div>
            <div className="text-sm text-zinc-400 mt-1">
              {a.synopsis
                ? a.synopsis.slice(0, 160) +
                  (a.synopsis.length > 160 ? "..." : "")
                : "No synopsis available"}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Score: {a.score ?? "—"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------
   RATING CARD
-------------------------------------------------------- */

function RatingCard({ data }: { data: any }) {
  if (!data) return <div>No rating available.</div>;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 shadow space-y-2">
      <div className="text-xl font-bold">{data.title}</div>
      <div className="text-sm text-zinc-300">Score: {data.score ?? "—"}</div>
      <div className="text-sm text-zinc-500">
        Members: {data.members?.toLocaleString() ?? "—"}
      </div>
    </div>
  );
}

/* --------------------------------------------------------
   EPISODE LIST
-------------------------------------------------------- */

function EpisodeList({ data }: { data: any[] }) {
  return (
    <div className="space-y-3">
      {data.map((ep, i) => (
        <div
          key={i}
          className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow"
        >
          <div className="font-semibold">
            Episode {ep.mal_id ?? i + 1}: {ep.title ?? "Untitled"}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Aired: {ep.aired?.from ?? "Unknown"}
          </div>
        </div>
      ))}
    </div>
  );
}
