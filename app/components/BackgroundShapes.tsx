"use client";

export default function BackgroundShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Shape 1 - Blue Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
      
      {/* Shape 2 - Purple Blob */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      
      {/* Shape 3 - Center Accent */}
      <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse delay-700" />
    </div>
  );
}
