import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SessionResult, Currency } from '../types';
import { formatCurrency } from '../utils/sniperCore';
import { soundController } from '../utils/audio';
import { RotateCcw, Sliders, FileText } from 'lucide-react';

interface CelebrationModalProps {
  session: SessionResult;
  currency: Currency;
  celebrationTheme: 'Sparkles' | 'Retro Future';
  onRepeatSession: () => void;
  onChangePlan: () => void;
  onOpenSessionLog: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  session,
  currency,
  celebrationTheme,
  onRepeatSession,
  onChangePlan,
  onOpenSessionLog,
}) => {
  const isProfit = session.profitLoss >= 0;
  const totalTrades = session.won + session.lost;
  const winRate = totalTrades > 0 ? Math.round((session.won / totalTrades) * 100) : 100;

  useEffect(() => {
    soundController.playCelebration();

    if (isProfit) {
      if (celebrationTheme === 'Retro Future') {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#ff007f', '#00f0ff', '#f5a623', '#00e676'],
        });
      } else {
        // Sparkles / Gold
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#f5a623', '#ffd700', '#ffffff', '#00e676'],
        });
      }
    }
  }, [isProfit, celebrationTheme]);

  return (
    <div className="flex flex-col items-center justify-between h-full bg-[#10141b] text-white p-5 select-none text-center relative overflow-hidden rounded-none">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/40 via-transparent to-transparent" />

      {/* Top Banner */}
      <div className="mt-3 relative z-10">
        <div className="text-sm font-semibold text-zinc-300">
          Target reached
        </div>
        <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-1">
          SESSION RESULT
        </div>

        {/* Large Result */}
        <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-[#00e676] my-2 drop-shadow-[0_0_20px_rgba(0,230,118,0.35)]">
          {formatCurrency(session.profitLoss, currency, true)}
        </div>

        {/* Win Rate Banner */}
        <div className="my-3 py-1 px-4 rounded-none bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-[#f5a623]/40 inline-block">
          <span className="text-xl font-black font-['Chakra_Petch',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 tracking-wider">
            {winRate}% W/R
          </span>
        </div>
      </div>

      {/* 3 Metric Cards: Balance | Won | Lost */}
      <div className="w-full grid grid-cols-3 gap-2 bg-[#141a24] border border-[#1e2634] rounded-none p-3 my-4 relative z-10">
        <div className="text-center">
          <div className="text-[10px] font-mono text-zinc-400">Balance</div>
          <div className="font-mono font-bold text-xs sm:text-sm text-zinc-200 mt-0.5 truncate">
            {formatCurrency(session.endingBalance, currency)}
          </div>
        </div>

        <div className="text-center border-x border-[#1e2634]">
          <div className="text-[10px] font-mono text-zinc-400">Won</div>
          <div className="font-mono font-bold text-sm text-[#00e676] mt-0.5">
            {session.won}
          </div>
        </div>

        <div className="text-center">
          <div className="text-[10px] font-mono text-zinc-400">Lost</div>
          <div className="font-mono font-bold text-sm text-[#ff3b57] mt-0.5">
            {session.lost}
          </div>
        </div>
      </div>

      {/* Target reached. Stop here tip */}
      <div className="bg-[#241c10] border border-[#f5a623]/60 rounded-none py-2 px-3 text-xs text-amber-300/90 font-medium relative z-10">
        Target reached. Stop here.
      </div>

      {/* Buttons */}
      <div className="w-full space-y-2.5 my-4 relative z-10">
        <button
          onClick={onRepeatSession}
          className="w-full bg-[#f5a623] hover:bg-[#ffb020] text-black font-bold py-3.5 px-4 rounded-none text-sm transition-all shadow-[0_4px_16px_rgba(245,166,35,0.3)] active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Repeat Session</span>
        </button>

        <button
          onClick={onChangePlan}
          className="w-full bg-[#171d27] hover:bg-[#1e2534] text-zinc-300 hover:text-white font-medium py-2.5 px-4 rounded-none text-xs transition-colors border border-[#232d3d] cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Change plan</span>
        </button>

        <button
          onClick={onOpenSessionLog}
          className="w-full bg-[#131720] hover:bg-[#191f2b] text-zinc-400 hover:text-white font-medium py-2 px-4 rounded-none text-xs transition-colors border border-[#1b2330] cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Session Log</span>
        </button>
      </div>

    </div>
  );
};
