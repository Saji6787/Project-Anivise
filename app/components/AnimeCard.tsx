/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AnimeCard({ anime }: { anime: any }) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-3">
      <h2 className="text-xl font-bold text-white">{anime.title}</h2>

      {/* Genre Pills */}
      <div className="flex flex-wrap gap-2">
        {anime.genre?.map((g: string, i: number) => (
          <span
            key={i}
            className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs"
          >
            {g}
          </span>
        ))}
      </div>

      {/* Synopsis */}
      <p className="text-sm text-zinc-300 leading-relaxed">
        {anime.synopsis}
      </p>

      {/* Reason */}
      <p className="text-sm italic text-zinc-400">
        {anime.reason}
      </p>
    </div>
  );
}
