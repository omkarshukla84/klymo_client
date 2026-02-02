"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraProps {
  onCapture: (blob: Blob) => void;
  isVerifying: boolean;
  completeVerification: (gender: 'M' | 'F') => void;
}

export default function Camera({ onCapture, isVerifying, completeVerification }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  const captureFrame = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(new Blob()); // Keep the original prop call for flow

        try {
          const response = await fetch('http://127.0.0.1:3002/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
          });
          
          const data = await response.json();
          if (data.success) {
            completeVerification(data.gender);
          } else {
            setError("AI Classification failed. Please try again.");
          }
        } catch (err) {
          setError("Network error during verification. Ensure server is running.");
          console.error(err);
        }
      }
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square rounded-full overflow-hidden border-4 border-blue-600/30 shadow-2xl shadow-blue-500/20 bg-gray-900">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-red-100 bg-red-900/40 backdrop-blur-md">
          <p className="font-bold mb-4">{error}</p>
          <button 
            onClick={() => { setError(null); startCamera(); }}
            className="px-6 py-2 bg-white text-red-600 rounded-full font-black text-xs uppercase tracking-widest"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover mirror"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isVerifying ? (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
              </div>
              <h3 className="text-white font-black text-xl tracking-tighter mb-2 uppercase">AI ANALYZING</h3>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Scanning biometric data...</p>
            </div>
          ) : (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button 
                onClick={captureFrame}
                className="group relative px-10 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-blue-600 hover:text-white glow-blue active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Verify Identity</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          )}
        </>
      )}
      
      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
