"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { useUser } from '@/context/UserContext';

import SubHeader from '@/components/SubHeader';

export default function EndPage() {
  const router = useRouter();
  const { deviceId } = useUser();
  const searchParams = useSearchParams();
  const isReport = searchParams.get('report') === 'true';
  const [blockUser, setBlockUser] = useState(false);

  const handleBlockToggle = () => {
    const newState = !blockUser;
    setBlockUser(newState);
    
    if (newState && deviceId) {
      const targetDeviceId = sessionStorage.getItem('report_target');
      if (targetDeviceId && targetDeviceId !== deviceId) {
        const socket = io('http://127.0.0.1:3002', { transports: ['websocket'] });
        socket.emit('block_user', { 
          myDeviceId: deviceId, 
          targetDeviceId: targetDeviceId 
        });
        setTimeout(() => socket.disconnect(), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black bg-mesh">
      <SubHeader />
      
      <div className="max-w-md mx-auto px-6 pb-20 text-center">
        <div className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="w-24 h-24 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-10 group animate-glow">
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">
              {isReport ? 'Protocol Noted' : 'Session Closed'}
            </h2>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] px-4">
              {isReport 
                ? 'Your report has been logged. We prioritize community safety above all.'
                : 'All ephemeral data associated with this session has been destroyed.'}
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <button 
              onClick={handleBlockToggle}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border flex items-center justify-center gap-3 active:scale-95 ${
                blockUser 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                  : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              {blockUser ? 'Channel Blocked' : 'Block User Permanently'}
            </button>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => router.push('/matching')}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-blue-700 glow-blue active:scale-95"
            >
              Find New Match
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-5 bg-white/5 border border-white/10 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-white/10 active:scale-95"
            >
              Return to Core
            </button>
          </div>
        </div>

        <p className="mt-12 text-[10px] text-gray-700 font-black uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
          Zero logs kept. No tracking traces left. This session is now a ghost of the past.
        </p>
      </div>
    </div>
  );
}
