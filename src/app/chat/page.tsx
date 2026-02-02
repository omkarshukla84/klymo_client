"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { io, Socket } from 'socket.io-client';
import { DeviceIdentity } from '@/lib/device';

// Removed global socket declaration for better React state management

interface Message {
  senderId: string;
  text: string;
  timestamp: number;
}

import SubHeader from '@/components/SubHeader';

export default function ChatPage() {
  const router = useRouter();
  const { deviceId } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [ownId, setOwnId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedRoom = sessionStorage.getItem('current_room');
    const storedPartner = sessionStorage.getItem('partner_info');

    if (!storedRoom || !storedPartner) {
      router.push('/profile');
      return;
    }

    setRoomId(storedRoom);
    setPartner(JSON.parse(storedPartner));

    const socket = io('http://127.0.0.1:3002', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setOwnId(socket.id || null);
      socket.emit('join_room', storedRoom);
    });

    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('partner_typing', ({ isTyping }) => {
      setIsPartnerTyping(isTyping);
    });

    socket.on('partner_left', () => {
      handleEndSession();
    });

    socket.on('room_expired', () => {
      alert("Session Time Limit Reached. Match vanished.");
      handleEndSession();
    });

    socket.on('error', ({ message }) => {
      alert(message);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [router]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleEndSession();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !roomId || !socketRef.current) return;

    const newMessage: Message = {
      senderId: ownId || 'me',
      text: inputText,
      timestamp: Date.now()
    };

    socketRef.current.emit('send_message', { roomId, message: inputText });
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    socketRef.current.emit('typing', { roomId, isTyping: false });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (roomId && socketRef.current) {
      socketRef.current.emit('typing', { roomId, isTyping: e.target.value.length > 0 });
    }
  };

  const handleEndSession = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('leave_chat', roomId);
    }
    // Phase 7: Proper Cache Clearing
    sessionStorage.removeItem('current_room');
    sessionStorage.removeItem('partner_info');
    sessionStorage.removeItem('report_target'); 
    
    DeviceIdentity.incrementMatchCount();
    router.push('/end');
  };

  return (
    <div className="min-h-screen bg-black bg-mesh flex flex-col">
      <SubHeader />
      
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 pb-6 flex flex-col min-h-0">
        <div className="glass rounded-[2rem] border border-white/10 flex-1 flex flex-col overflow-hidden mb-6 shadow-2xl">
          {/* Chat Header */}
          <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">
                  {partner?.nickname?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#0b0b0b] rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">@{partner?.nickname || 'Anonymous'}</h3>
                <div className="h-4 flex items-center">
                  {isPartnerTyping ? (
                    <div className="flex gap-1 items-center">
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Session</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Session Timer</span>
              <div className="font-mono text-blue-400 font-black text-lg">{formatTime(timeLeft)}</div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                 <div className="text-4xl mb-4">💬</div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">Start the conversation</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.senderId === ownId ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] px-6 py-4 rounded-[1.5rem] shadow-sm ${
                  msg.senderId === ownId 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                }`}>
                  <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                  <p className={`text-[8px] mt-2 font-black uppercase tracking-tighter ${msg.senderId === ownId ? 'text-white/50 text-right' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/[0.01] border-t border-white/5">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="relative group">
                <input 
                  type="text"
                  value={inputText}
                  onChange={handleTyping}
                  placeholder="Type a secure message..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex gap-3 h-12">
                <button 
                  type="button" 
                  onClick={() => {
                    if (socketRef.current && partner) {
                      socketRef.current.emit('report_user', { 
                        reporterDeviceId: deviceId, // Hardened Reporting
                        targetDeviceId: partner.deviceId, 
                        reason: 'User reported via chat button' 
                      });
                    }
                    sessionStorage.setItem('report_target', partner?.deviceId || '');
                    router.push('/end?report=true');
                  }}
                  className="flex-1 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  Report
                </button>
                <button 
                  type="button"
                  onClick={handleEndSession}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                >
                  Leave
                </button>
                <button 
                  type="button" 
                  onClick={handleEndSession}
                  className="flex-[2] rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all glow-blue active:scale-95"
                >
                  Next Match
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
