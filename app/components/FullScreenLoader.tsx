"use client";

import { useEffect, useState } from "react";

interface Props {
  loading: boolean;
}

export default function FullScreenLoader({ loading }: Props) {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setTimeout(() => setShow(true), 10); // Trigger fade in
    } else {
      setShow(false); // Trigger fade out
      const timeout = setTimeout(() => setVisible(false), 500); // Wait for transition
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-500 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="mt-8 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">
        Analyzing Request...
      </h2>
    </div>
  );
}
