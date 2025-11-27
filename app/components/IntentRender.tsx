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
    return <div className="text-zinc-400 text-center mt-8">No results found.</div>;

  switch (intent) {
    case "character_best":
    case "character_info":
    case "character_search":
      return <CharacterGrid data={data} />;

    case "anime_recommendation_by_genre":
    case "anime_recommendation_general":
    case "anime_recommendation_by_year":
    case "anime_search":
    case "trending_now":
    case "top_all_time":
    case "anime_info":
      return <AnimeGrid data={data} />;

    case "rating_lookup":
      return <RatingCard data={data[0]} />;

    case "episode_list":
      return <EpisodeList data={data} />;

    default:
      return (
        <div className="text-zinc-400 text-center mt-8">
          No renderer available for intent: {intent}
        </div>
      );
  }
}

/* --------------------------------------------------------
   CHARACTER GRID (Replaces Carousel for better view)
-------------------------------------------------------- */

function CharacterGrid({ data }: { data: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {data.map((c, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg hover:bg-white/10 transition-all duration-300 group"
        >
          <div className="overflow-hidden rounded-lg mb-4">
            <img
              src={c.image}
              className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
              alt={c.name}
            />
          </div>

          <div className="font-bold text-lg text-white">{c.name}</div>
          <div className="text-sm text-zinc-300">{c.role}</div>
          {c.about && (
             <div className="text-xs text-zinc-400 mt-2 line-clamp-3">{c.about}</div>
          )}
          <div className="text-xs text-zinc-500 mt-3 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400">
              <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
            </svg>
            {c.favorites?.toLocaleString() ?? 0}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {data.map((a, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg hover:bg-white/10 transition-all duration-300 flex flex-col group"
        >
          <div className="overflow-hidden rounded-lg mb-4 relative">
             <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-yellow-400 flex items-center gap-1 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                </svg>
                {a.score ?? "N/A"}
             </div>
            <img
              src={a?.images?.jpg?.image_url ?? a?.image_url ?? ""}
              alt={a.title}
              className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          <div className="flex-1">
            <div className="font-bold text-lg text-white line-clamp-1" title={a.title}>{a.title}</div>
            <div className="text-xs text-zinc-400 mt-1 mb-2">
               {a.aired?.string ?? "Unknown Release Date"}
            </div>
            <div className="text-sm text-zinc-300 line-clamp-3 leading-relaxed">
              {a.synopsis ?? "No synopsis available."}
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
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-lg max-w-md mx-auto text-center">
      <div className="text-2xl font-bold text-white mb-2">{data.title}</div>
      <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 my-4">
        {data.score ?? "N/A"}
      </div>
      <div className="text-sm text-zinc-400">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((ep, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow hover:bg-white/10 transition"
        >
          <div className="font-semibold text-white">
            Episode {ep.mal_id ?? i + 1}: {ep.title ?? "Untitled"}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Aired: {ep.aired?.from ? new Date(ep.aired.from).toLocaleDateString() : "Unknown"}
          </div>
        </div>
      ))}
    </div>
  );
}
