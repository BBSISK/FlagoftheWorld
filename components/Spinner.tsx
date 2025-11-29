import React from 'react';

interface SpinnerProps {
  fact?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ fact }) => (
  <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-md px-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-geo-accent border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-geo-accent rounded-full animate-pulse"></div>
      </div>
    </div>
    
    <div className="space-y-2">
      <p className="text-geo-accent font-medium animate-pulse tracking-widest text-sm uppercase">
        Triangulating Coordinates...
      </p>
      
      {fact && (
        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/5 backdrop-blur-sm animate-fade-in">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-bold">Geography Fact</p>
          <p className="text-slate-200 text-sm leading-relaxed italic">
            "{fact}"
          </p>
        </div>
      )}
    </div>
  </div>
);