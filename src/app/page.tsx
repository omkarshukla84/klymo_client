"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function LandingPage() {
  const [stats, setStats] = useState({ onlineUsers: 0, waitingInQueue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3002/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.log("Stats offline");
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative min-h-screen bg-black overflow-hidden bg-mesh selection:bg-blue-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-float-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-float-slow [animation-delay:4s]" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 overflow-visible">
        
        {/* Central Visual: The Portal */}
        <div className="relative mb-16 animate-glow group">
          <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full group-hover:bg-blue-500/30 transition-all duration-700" />
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border border-blue-500/30 p-1 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-t-blue-500/80 border-r-indigo-500/40 border-b-purple-500/20 border-l-transparent rounded-full animate-portal" />
            <div className="absolute inset-2 border border-blue-400/20 rounded-full animate-portal [animation-duration:15s] [animation-direction:reverse]" />
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,transparent_70%)]" />
               <span className="text-4xl md:text-5xl font-black text-white text-glow z-10 tracking-tighter">A</span>
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight">
            <span className="text-white opacity-90">ANONYMOUS.</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600">
              SECURE. INSTANT.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto font-medium leading-relaxed">
            A privacy-first anonymous 1-to-1 chat platform. 
            No logs. No PII. Just meaningful connections.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="mb-8 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {stats.onlineUsers} Active Souls Online • {stats.waitingInQueue} in Queue
          </span>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center scale-110">
          <Link 
            href="/verify"
            className="group relative px-10 py-4 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest transition-all hover:bg-blue-500 hover:text-white glow-blue active:scale-95"
          >
            Start Chat
          </Link>
          
          <Link 
            href="#features"
            className="px-10 py-4 bg-transparent text-white border border-white/20 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
          >
            How it works
          </Link>
        </div>

        {/* Feature Grid - Minimal & Integrated */}
        <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-1 px-4 max-w-5xl w-full border border-white/10 rounded-[3rem] overflow-hidden bg-white/5 backdrop-blur-sm">
          {[
            { title: "Zero Data", desc: "No tracking, no storage.", icon: "🛡️" },
            { title: "AI Verified", desc: "Real humans only.", icon: "🤖" },
            { title: "Stateless", desc: "Sessions vanish instantly.", icon: "⚡" }
          ].map((feature, i) => (
            <div key={i} className={`p-10 flex flex-col items-center text-center ${i < 2 ? 'md:border-r border-white/10' : ''} hover:bg-white/5 transition-colors cursor-default`}>
              <div className="text-2xl mb-4 grayscale group-hover:grayscale-0 transition-all">{feature.icon}</div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">{feature.title}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 right-0 text-center text-[10px] text-gray-700 font-black uppercase tracking-[0.2em]">
        © 2026 AnonChat • Built for total privacy
      </footer>
    </div>
  );
}
