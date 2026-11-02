import React from 'react';
import { X, BookOpen, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#12161f] border border-[#232d3d] rounded-[3px] p-5 text-white shadow-2xl z-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2634]">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-[#f5a623]" />
            <h2 className="text-lg font-bold font-mono">Help & Support</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs leading-relaxed text-zinc-300">
          <div className="p-3.5 rounded-[3px] bg-[#171e2c] border border-[#222c3d]">
            <h3 className="font-bold text-sm text-[#f5a623] flex items-center space-x-1.5 mb-1 font-mono">
              <Zap className="w-4 h-4" />
              <span>SniperCORE Combinatorial Model</span>
            </h3>
            <p className="text-zinc-400">
              Unlike traditional Martingale which doubles stakes and blows accounts on bad streaks, PocketSniper uses a combinatorial dynamic model. You set a target number of wins (e.g. 2 wins in 14 trades). The engine calculates stakes dynamically so that achieving your goal secures net profit while never risking more than your liquidation limit.
            </p>
          </div>

          <div className="p-3.5 rounded-[3px] bg-[#171e2c] border border-[#222c3d]">
            <h3 className="font-bold text-sm text-[#00e676] flex items-center space-x-1.5 mb-1 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Broker Minimum Stake Protection</span>
            </h3>
            <p className="text-zinc-400">
              Brokers typically impose a $1.00 minimum trade stake. If a dynamic calculation calls for less than $1.00 (e.g. $0.34 or $0.71), PocketSniper warns you immediately with an alert so you can safely lock in your profit and end the session.
            </p>
          </div>

          <div className="p-3.5 rounded-[3px] bg-[#171e2c] border border-[#222c3d]">
            <h3 className="font-bold text-sm text-cyan-400 flex items-center space-x-1.5 mb-1 font-mono">
              <BookOpen className="w-4 h-4" />
              <span>Interactive Trading Simulator</span>
            </h3>
            <p className="text-zinc-400">
              You can trade directly on the live simulated candlestick chart with turbo 5s or 15s expirations. Every order syncs with PocketSniper's recommended next stake and updates session results in real time!
            </p>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full bg-[#f5a623] hover:bg-[#ffb020] text-black font-bold py-2.5 px-4 rounded-[3px] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            Got it, Back to Trading
          </button>
        </div>
      </div>
    </div>
  );
};
