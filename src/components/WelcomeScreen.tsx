import React, { useEffect, useState } from 'react';

export const WelcomeScreen: React.FC = () => {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'hidden'>(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('sbt_has_seen_welcome')) {
        return 'hidden';
      }
    } catch {
      // fallback
    }
    return 'visible';
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase === 'hidden') return;

    try {
      sessionStorage.setItem('sbt_has_seen_welcome', 'true');
    } catch {
      // ignore
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 25;
      });
    }, 45);

    const fadeTimeout = setTimeout(() => {
      setPhase('fading');
    }, 550);

    const hideTimeout = setTimeout(() => {
      setPhase('hidden');
    }, 850);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimeout);
      clearTimeout(hideTimeout);
    };
  }, [phase]);

  if (phase === 'hidden') return null;

  const handleDismiss = () => {
    setPhase('fading');
    setTimeout(() => setPhase('hidden'), 400);
  };

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080b] transition-all duration-700 ease-out select-none cursor-pointer ${
        phase === 'fading' ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle background ambient light */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        
        {/* Monogram / Brand mark */}
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-md">
          <span className="text-white font-bold text-lg tracking-[0.2em] pl-1">
            SBT
          </span>
        </div>

        {/* Clean normal typography */}
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-[0.25em] uppercase mb-2">
          SBT Studios
        </h1>
        
        <p className="text-xs text-neutral-400 font-light tracking-wider mb-8">
          Unturned Assets & Modern Furniture
        </p>

        {/* Minimal Progress Line */}
        <div className="w-44 h-[2px] bg-neutral-800 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-white transition-all duration-150 ease-out rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <span className="text-[11px] text-neutral-500 font-light mt-3 tracking-wide">
          {progress < 100 ? 'Iniciando catálogo...' : 'Bienvenido'}
        </span>

      </div>

      <div className="absolute bottom-8 text-[11px] text-neutral-600 font-light tracking-wider">
        Haz clic en cualquier lugar para omitir
      </div>
    </div>
  );
};
