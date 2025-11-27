import { useEffect, useState } from "react";

interface Props {
  prompt: string;
  setPrompt: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  placeholder?: string;
}

const PLACEHOLDERS = [
  "Ask anything about anime...",
  "Find anime like Naruto...",
  "Best romance anime of 2024...",
  "Who is the strongest character in One Piece?",
  "Upcoming anime this season...",
];

export default function InputBox({ prompt, setPrompt, onSend, loading, placeholder }: Props) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetText = placeholder || PLACEHOLDERS[placeholderIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < targetText.length) {
          setCurrentPlaceholder((prev) => prev + targetText[charIndex]);
          setCharIndex((prev) => prev + 1);
        } else {
          // Finished typing, wait before deleting
          if (!placeholder) { // Only cycle if no custom placeholder is forced
             setTimeout(() => setIsDeleting(true), 2000);
          }
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setCurrentPlaceholder((prev) => prev.slice(0, -1));
          setCharIndex((prev) => prev - 1);
        } else {
          // Finished deleting, move to next placeholder
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholder, placeholderIndex]);

  const send = () => {
    if (loading) return;
    onSend();
  };

  return (
    <div className="flex gap-2 items-center bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-lg transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-blue-500/10">
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-lg"
        placeholder={currentPlaceholder}
      />

      <button
        onClick={send}
        disabled={loading}
        className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
      </button>
    </div>
  );
}
