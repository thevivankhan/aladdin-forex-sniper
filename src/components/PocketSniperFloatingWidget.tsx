import React, { useState, useRef, useEffect } from 'react';
import {
  PlanConfig,
  TradeStep,
  SessionResult,
  AppSettings,
  Mode,
} from '../types';
import { PlanSetup } from './PlanSetup';
import { ActiveTrading } from './ActiveTrading';
import { CelebrationModal } from './CelebrationModal';
import { SettingsView } from './SettingsView';
import { formatCurrency } from '../utils/sniperCore';
import { Minus, Maximize2, Move, TrendingUp, Settings as SettingsIcon, Menu } from 'lucide-react';

interface PocketSniperFloatingWidgetProps {
  mode: Mode;
  onToggleMode: () => void;
  config: PlanConfig;
  onChangeConfig: (config: PlanConfig) => void;
  sessionPhase: 'SETUP' | 'TRADING' | 'CELEBRATION';
  onStartSession: () => void;
  onRecordTrade: (result: 'WIN' | 'LOSS', stake: number, payoutPercent: number) => void;
  onEndSessionEarly: () => void;
  onRepeatSession: () => void;
  onChangePlan: () => void;
  onOpenSessionLog: () => void;
  onOpenDrawer: () => void;
  currentBalance: number;
  initialBalance: number;
  targetBalance: number;
  steps: TradeStep[];
  lastFinishedSession: SessionResult | null;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  activeSubTab: 'trade' | 'settings';
  onChangeSubTab: (tab: 'trade' | 'settings') => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const PocketSniperFloatingWidget: React.FC<PocketSniperFloatingWidgetProps> = ({
  mode,
  onToggleMode,
  config,
  onChangeConfig,
  sessionPhase,
  onStartSession,
  onRecordTrade,
  onEndSessionEarly,
  onRepeatSession,
  onChangePlan,
  onOpenSessionLog,
  onOpenDrawer,
  currentBalance,
  initialBalance,
  targetBalance,
  steps,
  lastFinishedSession,
  settings,
  onUpdateSettings,
  activeSubTab,
  onChangeSubTab,
  isPaused,
  onTogglePause,
}) => {
  // Minimize state
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Position coordinates for draggable window (defaults to top-left overlay)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 55 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
  });

  // Calculate current stake and P/L for minimized HUD display
  const currentPL = currentBalance - initialBalance;
  const currentStake =
    steps.length === 0
      ? config.balance <= 2500
        ? 1.10
        : 10.05
      : 2.12;

  // Pointer Down (Mouse or Touch) on the drag handle
  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent dragging when clicking buttons inside the header
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    // Bounds check to keep within screen
    const newX = Math.max(0, Math.min(window.innerWidth - 80, dragStartRef.current.initialPosX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.initialPosY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed z-40 transition-shadow select-none ${
        isDragging ? 'cursor-grabbing opacity-95' : ''
      }`}
    >
      {/* MINIMIZED HUD STATE (1-click minimize) */}
      {isMinimized ? (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex items-center space-x-2.5 bg-[#0e1219]/95 border border-[#1e2636] hover:border-[#f5a623] px-3 py-2 rounded-[3px] shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-grab active:cursor-grabbing text-white"
        >
          {/* Logo badge */}
          <div className="w-5 h-5 bg-[#f5a623] rounded-[2px] flex items-center justify-center font-black text-black text-xs font-mono">
            P
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="font-extrabold text-[#f5a623] font-['Chakra_Petch',sans-serif]">
              PocketSniper
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">STAKE:</span>
            <span className="text-white font-bold">${currentStake.toFixed(2)}</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">P/L:</span>
            <span
              className={`font-bold ${
                currentPL >= 0 ? 'text-[#00e676]' : 'text-[#ff3b57]'
              }`}
            >
              {formatCurrency(currentPL, config.currency, true)}
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">{steps.length}/{config.trades}</span>
          </div>

          {/* 1-Click Expand Button */}
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-[2px] bg-[#1a2230] hover:bg-[#253145] text-[#f5a623] transition-colors cursor-pointer ml-1"
            title="Expand PocketSniper Window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* EXPANDED FULL FLOATING WINDOW (Square style with micro-curves: rounded-[3px]) */
        <div className="w-[330px] sm:w-[370px] bg-[#10141b] border border-[#1e2636] rounded-[3px] shadow-[0_16px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[88vh]">
          {/* Draggable Title Bar Handle */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="flex items-center justify-between px-3 py-2 bg-[#0c1017] border-b border-[#18202d] cursor-grab active:cursor-grabbing text-white"
          >
            {/* Brand Logo & Drag Hint */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenDrawer}
                className="p-1 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="w-5 h-5 bg-[#f5a623] rounded-[2px] flex items-center justify-center font-black text-black text-xs font-mono shadow-[0_0_10px_rgba(245,166,35,0.4)]">
                P
              </div>

              <span className="font-extrabold tracking-wider text-xs text-white font-['Chakra_Petch',sans-serif]">
                POCKETSNIPER
              </span>

              <Move className="w-3 h-3 text-zinc-500 opacity-60 ml-0.5" />
            </div>

            {/* Window Controls: Real/Demo toggle + 1-Click Minimize button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleMode}
                className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-wider transition-colors cursor-pointer ${
                  mode === 'REAL'
                    ? 'bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/50 shadow-[0_0_8px_rgba(0,230,118,0.2)]'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/50'
                }`}
                title="Toggle Real / Demo"
              >
                {mode}
              </button>

              {/* 1-Click Minimize Button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Minimize PocketSniper"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Window Body Container */}
          <div className="flex-1 overflow-y-auto">
            {activeSubTab === 'settings' ? (
              <SettingsView
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                onBackToTrade={() => onChangeSubTab('trade')}
              />
            ) : sessionPhase === 'SETUP' ? (
              <PlanSetup
                config={config}
                onChangeConfig={onChangeConfig}
                onStartSession={onStartSession}
                onOpenSessionLog={onOpenSessionLog}
              />
            ) : sessionPhase === 'TRADING' ? (
              <ActiveTrading
                config={config}
                currentBalance={currentBalance}
                onOpenSettings={() => onChangeSubTab('settings')}
                activeTab={activeSubTab}
                onChangeTab={onChangeSubTab}
              />

            ) : (
              /* Celebration Phase */
              lastFinishedSession && (
                <CelebrationModal
                  session={lastFinishedSession}
                  currency={config.currency}
                  celebrationTheme={settings.celebrationTheme}
                  onRepeatSession={onRepeatSession}
                  onChangePlan={onChangePlan}
                  onOpenSessionLog={onOpenSessionLog}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
