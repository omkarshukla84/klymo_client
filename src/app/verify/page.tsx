"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import Camera from '@/components/Camera';
import SubHeader from '@/components/SubHeader';

export default function VerifyPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { setUserInfo } = useUser();

  const handleCapture = async (blob: Blob) => {
    setIsVerifying(true);
  };

  const completeVerification = (detectedGender: 'M' | 'F') => {
    setUserInfo({
      genderVerified: true,
      gender: detectedGender
    });
    setIsVerifying(false);
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-black bg-mesh">
      <SubHeader />
      <div className="max-w-xl mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black mb-4 tracking-tighter">Smile for the Camera!</h2>
          <div className="inline-flex flex-wrap justify-center text-[10px] text-gray-500 font-black uppercase tracking-widest gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="flex items-center gap-2">Verifying Gender AI</span>
            <span className="flex items-center gap-2">•</span>
            <span className="flex items-center gap-2">Live Capture Only</span>
            <span className="flex items-center gap-2">•</span>
            <span className="flex items-center gap-2">Image Auto Deleted</span>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-4 border-blue-500/20 shadow-2xl relative overflow-hidden">
          <Camera onCapture={handleCapture} isVerifying={isVerifying} completeVerification={completeVerification} />
        </div>

        <p className="mt-12 text-center text-[10px] text-gray-600 font-black uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
          Your privacy is our priority. No images are stored. Only the result is used to ensure safety.
        </p>
      </div>
    </div>
  );
}
