"use client";

interface Props {
  prompt: string;
  setPrompt: (v: string) => void;
  onSend: () => void;
  loading: boolean;
}

export default function InputBox({ prompt, setPrompt, onSend, loading }: Props) {
  const send = () => {
    if (loading) return;
    onSend();
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        className="flex-1 bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-lg text-white
                   placeholder-zinc-500 focus:outline-none"
        placeholder="Type your anime question..."
      />

      <button
        onClick={send}
        disabled={loading}
        className="px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
