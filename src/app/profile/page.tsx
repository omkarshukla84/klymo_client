"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { DeviceIdentity } from '@/lib/device';
import { Filter } from 'bad-words';
import SubHeader from '@/components/SubHeader';

const profanityFilter = new Filter();

export default function ProfilePage() {
  const router = useRouter();
  const { nickname, bio, matchPreference, setUserInfo, gender } = useUser();
  const [localNickname, setLocalNickname] = useState(nickname);
  const [localBio, setLocalBio] = useState(bio);
  const [localPreference, setLocalPreference] = useState(matchPreference);
  const [error, setError] = useState('');
  const [matchesLeft, setMatchesLeft] = useState<number | null>(null);

  useEffect(() => {
    const count = DeviceIdentity.getMatchCount();
    setMatchesLeft(100 - count);
  }, []);

  const handleStartMatching = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanNickname = localNickname.trim();
    const cleanBio = localBio.trim();

    if (cleanNickname.length < 3) {
      setError('Nickname must be at least 3 characters.');
      return;
    }

    if (cleanBio.length < 10) {
      setError('Bio must be at least 10 characters.');
      return;
    }

    if (profanityFilter.isProfane(cleanNickname) || profanityFilter.isProfane(cleanBio)) {
      setError('Please avoid using profanity in your profile.');
      return;
    }

    const emojiMatch = cleanBio.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\u261D|\u263A|\u2639|\u2665|\u2708|\u2709|\u270C|\u270D|[\u2702-\u27B0]/g);
    if (emojiMatch && emojiMatch.length > 5) {
      setError('Maximum 5 emojis allowed in bio.');
      return;
    }

    if (DeviceIdentity.isLimitReached()) {
      setError('Daily match limit reached. Please come back tomorrow.');
      return;
    }

    setUserInfo({
      nickname: localNickname,
      bio: localBio,
      matchPreference: localPreference
    });

    router.push('/matching');
  };

  return (
    <div className="min-h-screen bg-black bg-mesh">
      <SubHeader />
      
      <div className="max-w-md mx-auto px-6 pb-20">
        <div className="glass p-10 rounded-[2.5rem] border border-blue-500/20 shadow-2xl relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase">Build Persona</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Step 02: Your Identity</p>
            </div>
            {gender && (
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">AI Classification</span>
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Verified {gender === 'M' ? 'Male' : 'Female'}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleStartMatching} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nickname</label>
              <input 
                type="text"
                value={localNickname}
                onChange={(e) => setLocalNickname(e.target.value)}
                placeholder="Enter Nickname..."
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Short Bio</label>
              <textarea 
                value={localBio}
                onChange={(e) => setLocalBio(e.target.value)}
                placeholder="Who are you? (Keep it interesting...)"
                required
                maxLength={140}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all h-32 resize-none text-sm font-medium leading-relaxed"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Looking for</label>
              <div className="flex gap-3">
                {['Male', 'Female', 'Any'].map((pref) => (
                  <label key={pref} className="flex-1 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="preference" 
                      value={pref[0]} 
                      checked={localPreference === (pref === 'Any' ? 'Any' : pref[0])}
                      onChange={() => setLocalPreference(pref === 'Any' ? 'Any' : pref[0] as 'M' | 'F')}
                      className="hidden"
                    />
                    <div className={`text-center py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      localPreference === (pref === 'Any' ? 'Any' : pref[0])
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'bg-white/5 border-white/10 text-gray-500 group-hover:border-white/20'
                    }`}>
                      {pref}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold text-center animate-pulse-subtle">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-blue-600 hover:text-white glow-blue active:scale-[0.98]"
            >
              Start Matching Now
            </button>
          </form>

          <footer className="mt-10 pt-6 border-t border-white/5 text-center h-10">
            {matchesLeft !== null && (
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest animate-in fade-in duration-500">
                Available Sessions: <span className="text-gray-400">{matchesLeft} remaining</span>
              </p>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
