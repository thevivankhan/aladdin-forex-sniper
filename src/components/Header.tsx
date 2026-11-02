import React from 'react';
import { Mode, AppLayoutMode } from '../types';
import { Menu, Pause, Play, Minus, Monitor, Smartphone, Layers, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  mode: Mode;
  onToggleMode: () => void;
  layoutMode: AppLayoutMode;
  onChangeLayoutMode: (m: AppLayoutMode) => void;
  onOpenDrawer: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onToggleMinimize?: () => void;
  isMinimized?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  layoutMode,
  onChangeLayoutMode,
  onOpenDrawer,
  isPaused,
  onTogglePause,
  onToggleMinimize,
  isMinimized = false,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-[#10141b] border-b border-[#1b222e] select-none">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenDrawer}
          className="p-1 -ml-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800/60 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Aladdin Forex Sniper Official Logo Mark */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="w-6 h-6 bg-gradient-to-br from-[#f5a623] to-[#e65100] rounded flex items-center justify-center font-black text-black text-xs leading-none shadow-[0_0_12px_rgba(245,166,35,0.5)]">
            <span className="translate-y-[-0.5px] font-mono tracking-tighter">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-xs sm:text-sm text-white font-['Chakra_Petch',sans-serif] leading-tight">
              ALADDIN FOREX
            </span>
            <span className="text-[8px] font-mono text-[#00e676] font-bold tracking-widest uppercase flex items-center space-x-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
              <span>LIVE SNIPER SCANNER</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Real / Demo Toggle Button */}
        <button
          onClick={onToggleMode}
          className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer ${
            mode === 'REAL'
              ? 'bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/60 shadow-[0_0_10px_rgba(0,230,118,0.25)] hover:bg-[#00e676]/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/60 shadow-[0_0_10px_rgba(245,166,35,0.25)] hover:bg-amber-500/20'
          }`}
          title="Click to toggle Real / Demo mode"
        >
          {mode}
        </button>

        {/* Layout Switcher (Overlay vs Standalone vs Web Portal) */}
        <div className="hidden sm:flex items-center bg-[#171d27] rounded p-0.5 border border-[#232d3d]">
          <button
            onClick={() => onChangeLayoutMode('floating_overlay')}
            className={`p-1 rounded text-xs transition-colors ${
              layoutMode === 'floating_overlay'
                ? 'bg-[#f5a623] text-black shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Pocket Option Chart + Floating Widget"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeLayoutMode('widget_focused')}
            className={`p-1 rounded text-xs transition-colors ${
              layoutMode === 'widget_focused'
                ? 'bg-[#f5a623] text-black shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Compact Widget View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeLayoutMode('web_portal')}
            className={`p-1 rounded text-xs transition-colors ${
              layoutMode === 'web_portal'
                ? 'bg-[#f5a623] text-black shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Full Web Portal View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pause session button */}
        <button
          onClick={onTogglePause}
          className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
            isPaused ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
          }`}
          title={isPaused ? 'Resume Session' : 'Pause Session'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

        {/* Minimize widget button */}
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 8-bit Invader Avatar */}
        <div className="w-6 h-6 rounded-full bg-[#1b3d2f] border border-[#00e676]/40 flex items-center justify-center cursor-pointer hover:border-[#00e676] transition-colors" title="Trader Profile">
          <svg className="w-3.5 h-3.5 fill-[#00e676]" viewBox="0 0 16 16">
            <path d="M4 2h8v2H4V2zm-2 3h12v2H2V5zm1 3h10v2H3V8zm2 3h6v2H5v-2zm-3 2h2v2H2v-2zm10 0h2v2h-2v-2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
