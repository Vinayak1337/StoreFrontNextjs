'use client';

import { Loader2 } from 'lucide-react';

interface FullScreenLoaderProps {
  message?: string;
  children?: React.ReactNode;
}

export function FullScreenLoader({ message = 'Loading...', children }: FullScreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Translucent background with previous UI */}
      {children && (
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {children}
        </div>
      )}
      
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      
      {/* Loader */}
      <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-lg bg-white shadow-lg border">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}