"use client";

import Link from 'next/link';

export default function SubHeader() {
  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center mb-10">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold transition-transform group-hover:scale-110">A</div>
        <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">AnonChat</span>
      </Link>
      <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
        Secure Session
      </div>
    </header>
  );
}
