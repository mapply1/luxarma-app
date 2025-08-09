"use client";

import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    // Remove from DOM after fade animation completes
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
      onComplete?.();
    }, 2500); // 2s delay + 0.5s fade duration

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Logo */}
      <div className="mb-8">
        <img 
          src="https://ycdyarkrxkhqkpkzvdno.supabase.co/storage/v1/object/public/assets//LOGO.png" 
          alt="Luxarma Logo" 
          className="h-8 w-auto max-w-none object-contain"
        />
      </div>
      
      {/* Lottie Animation */}
      <div className="w-24 h-24">
        <DotLottieReact
          src="https://lottie.host/67b96514-7f29-4b1f-b29e-8126e1771af3/c02CmjhHUi.lottie"
          loop
          autoplay
        />
      </div>
      
      <p className="text-white/80 text-lg font-medium mt-4">
        Chargement...
      </p>
    </div>
  );
}