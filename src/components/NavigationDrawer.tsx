import React from 'react';
import { ActiveView } from '../types';
import { CandlestickChart, FileText, Calendar, HelpCircle, Settings as SettingsIcon, LogOut, X } from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-72 max-w-[85vw] bg-[#12161f] border-r border-[#1e2634] text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e2634]">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#f5a623] to-[#e65100] rounded-[2px] flex items-center justify-center font-black text-black text-xs font-mono shadow-[0_0_12px_rgba(245,166,35,0.4)]">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-sm font-['Chakra_Petch',sans-serif] leading-tight">
                Aladdin Forex Sniper
              </span>
              <span className="text-[9px] font-mono text-[#00e676] font-bold">
                Live Signal Scanner
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Group */}
        <div className="flex-1 py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase font-mono">
            Navigation
          </div>

          <button
            onClick={() => {
              onSelectView('trading');
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-[3px] text-xs font-mono font-medium transition-all cursor-pointer ${
              activeView === 'trading'
                ? 'bg-[#1a212e] text-[#f5a623] font-semibold border-l-2 border-[#f5a623]'
                : 'text-zinc-300 hover:text-white hover:bg-[#161c28]'
            }`}
          >
            <CandlestickChart className="w-4 h-4 text-zinc-400" />
            <span>Live Radar & Scanner</span>
          </button>

          <button
            onClick={() => {
              onSelectView('session_log');
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-[3px] text-xs font-mono font-medium transition-all cursor-pointer ${
              activeView === 'session_log'
                ? 'bg-[#1a212e] text-[#f5a623] font-semibold border-l-2 border-[#f5a623]'
                : 'text-zinc-300 hover:text-white hover:bg-[#161c28]'
            }`}
          >
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Signals & Trades Log</span>
          </button>

          <button
            onClick={() => {
              onSelectView('pnl_calendar');
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-[3px] text-xs font-mono font-medium transition-all cursor-pointer ${
              activeView === 'pnl_calendar'
                ? 'bg-[#1a212e] text-[#f5a623] font-semibold border-l-2 border-[#f5a623]'
                : 'text-zinc-300 hover:text-white hover:bg-[#161c28]'
            }`}
          >
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Forex P&L Calendar</span>
          </button>


          <a
            href="https://pocket-friends.co/r/mphdnyllo5"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-[3px] text-xs font-mono font-medium text-[#00e676] hover:bg-[#161c28] transition-all cursor-pointer no-underline border border-[#00e676]/30 bg-[#00e676]/5 mt-2"
          >
            <span className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse"></span>
              <span className="font-bold">Pocket Option Platform</span>
            </span>
            <span className="text-zinc-400">↗</span>
          </a>
        </div>

        {/* Secondary items */}
        <div className="p-3 border-t border-[#1e2634] space-y-1">
          <button
            onClick={() => {
              onSelectView('help');
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-[3px] text-xs font-mono font-medium transition-all cursor-pointer ${
              activeView === 'help'
                ? 'bg-[#1a212e] text-[#f5a623]'
                : 'text-zinc-400 hover:text-white hover:bg-[#161c28]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & Support</span>
          </button>

          <button
            onClick={() => {
              onSelectView('settings');
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-[3px] text-xs font-mono font-medium transition-all cursor-pointer ${
              activeView === 'settings'
                ? 'bg-[#1a212e] text-[#f5a623]'
                : 'text-zinc-400 hover:text-white hover:bg-[#161c28]'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-[3px] text-xs font-mono font-medium text-zinc-400 hover:text-rose-400 hover:bg-[#161c28] transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
