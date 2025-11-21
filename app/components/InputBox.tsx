"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InputBox({ prompt, setPrompt, onSend, loading }: any) {
  return (
    <div className="space-y-3">
      <textarea
        className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition"
        rows={3}
        placeholder="Tulis permintaan anime (contoh: rekomendasi anime action 2018)..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={onSend}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 py-2 px-4 rounded-lg font-medium w-full"
      >
        {loading ? "Loading..." : "Kirim"}
      </button>
    </div>
  );
}
