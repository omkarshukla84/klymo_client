"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

import SubHeader from '@/components/SubHeader';

export default function MatchingPage() {
  const router = useRouter();
  const { nickname, gender, matchPreference, deviceId, bio } = useUser();
  const [status, setStatus] = useState('Searching...');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    setStatus('Initializing Connection...');
    socket = io('http://127.0.0.1:3002', {
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      setStatus('Searching...');
      setErrorStatus(null);
      socket.emit('join_queue', {
        nickname,
        gender,
        matchPreference,
        deviceId,
        bio
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Connection Error:', err);
      setErrorStatus('Shield Offline: Could not connect to the matching mainframe. Ensure the server is running.');
    });

    socket.on('match_found', (data) => {
      setStatus('Target Identified!');
      sessionStorage.setItem('current_room', data.roomId);
      sessionStorage.setItem('partner_info', JSON.stringify(data.partner));
      
      setTimeout(() => {
        router.push('/chat');
      }, 1500);
    });

    socket.on('error', ({ message }) => {
      setErrorStatus(message);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [nickname, gender, matchPreference, deviceId, router]);

  return (
    <div className="min-h-screen bg-black bg-mesh">
      <SubHeader />
      
      <div className="max-w-md mx-auto px-6 pb-20 text-center">
        <div className="mb-12">
           <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase">Finding Path</h2>
           <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Step 03: Matchmaking Engine</p>
        </div>

        {/* Large Animated Portal */}
        <div className="relative mb-16 animate-glow group mx-auto w-fit">
          <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
          <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full border border-blue-500/20 p-1 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-portal" />
            <div className="absolute inset-4 border border-blue-400/10 rounded-full animate-portal [animation-duration:12s] [animation-direction:reverse]" />
            <div className="absolute inset-8 border border-white/5 rounded-full animate-portal [animation-duration:25s]" />
            
            <div className="w-full h-full bg-black/40 backdrop-blur-2xl rounded-full flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
               <div className="text-4xl mb-4 animate-float-slow">
                 {errorStatus ? '⚠️' : status === 'Target Identified!' ? '🎯' : '🔍'}
               </div>
               <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 text-center ${errorStatus ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                  {errorStatus || status}
               </div>
            </div>
          </div>
        </div>

        {errorStatus && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="max-w-xs mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-md mb-6">
              <p className="text-[10px] font-black text-red-200 uppercase tracking-widest leading-relaxed">
                {errorStatus}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all glow-red"
            >
              Force Recalibrate
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex gap-2 justify-center">
            {['Search', 'Identify', 'Connect'].map((step, i) => (
              <div key={i} className={`px-4 py-2 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${
                (status === 'Searching...' && i === 0) || (status === 'Target Identified!' && i === 1)
                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                : 'bg-white/5 border-white/10 text-gray-600'
              }`}>
                {step}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-600 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
            Scanning secure channels for a partner matching your preferences...
          </p>
        </div>
      </div>
    </div>
  );
}
