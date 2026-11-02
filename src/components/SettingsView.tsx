import React, { useState } from 'react';
import { AppSettings } from '../types';
import confetti from 'canvas-confetti';
import { soundController } from '../utils/audio';
import {
  TrendingUp,
  Settings as SettingsIcon,
  Info,
  Check,
  Minus,
  Square,
  Minimize2,
  GripHorizontal,
  ExternalLink,
  Sparkles as SparklesIcon,
  Zap,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onBackToTrade: () => void;
  onMinimize?: () => void;
  onToggleExpand?: () => void;
  onCloseWidget?: () => void;
  isExpanded?: boolean;
  dragHandleProps?: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onBackToTrade,
  onMinimize,
  onToggleExpand,
  isExpanded = false,
  dragHandleProps,
}) => {
  const [editingKey, setEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState(settings.licenseKey);
  const [showKeySuccess, setShowKeySuccess] = useState(false);

  const toggleSwitch = (key: keyof AppSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSaveKey = () => {
    onUpdateSettings({
      ...settings,
      licenseKey: tempKey,
    });
    setEditingKey(false);
    setShowKeySuccess(true);
    setTimeout(() => setShowKeySuccess(false), 2000);
  };

  const handleTestTheme = (theme: 'Sparkles' | 'Retro Future') => {
    soundController.playCelebration();
    if (theme === 'Retro Future') {
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ff007f', '#00f0ff', '#f5a623', '#00e676'],
      });
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#f5a623', '#ffd700', '#ffffff', '#00e676'],
      });
    }
  };

  const handleOpenAffiliateLink = () => {
    const rawUrl = settings.whopAffiliateLink || settings.brokerLink || 'https://pocket-friends.co/r/mphdnyllo5';
    const url = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `https://${rawUrl}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d121b]/95 backdrop-blur-md text-white select-none overflow-y-auto rounded-none border border-[#1e2a3c]">
      {/* Draggable Title Header with Tabs & Controls */}
      <div
        {...dragHandleProps}
        className="flex items-center justify-between border-b border-[#1b2638] px-2.5 py-1.5 bg-[#0a0e16] cursor-grab active:cursor-grabbing select-none"
        title="Drag anywhere on screen"
      >
        {/* Left: Trade & Settings Tabs */}
        <div className="flex items-center space-x-1" onMouseDown={(e) => e.stopPropagation()}>
          <div className="text-zinc-600 mr-1 hidden sm:block">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>

          <button
            onClick={onBackToTrade}
            className="flex items-center space-x-1 py-1 px-2.5 text-xs font-bold tracking-wide transition-all border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <TrendingUp className="w-3 h-3 text-zinc-400" />
            <span>Trade</span>
          </button>

          <button
            className="flex items-center space-x-1 py-1 px-2.5 text-xs font-bold tracking-wide border-b-2 border-[#f5a623] text-[#f5a623] shadow-[0_2px_8px_rgba(245,166,35,0.3)] cursor-pointer"
          >
            <SettingsIcon className="w-3 h-3 text-[#f5a623]" />
            <span>Settings</span>
          </button>
        </div>

        {/* Right: Window Controls: Minus (-) & Square (□) only */}
        <div className="flex items-center space-x-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Minimize (-)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Restore Size (□)' : 'Maximize Window (□)'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* LICENSE KEY */}
        <div>
          <label className="block text-[11px] font-mono tracking-wider text-zinc-400 uppercase mb-1.5">
            LICENSE KEY
          </label>
          {editingKey ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="flex-1 bg-[#151a24] border border-[#f5a623] rounded-none px-3 py-2 text-xs font-mono text-white outline-none"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-2 bg-[#f5a623] text-black font-bold text-xs rounded-none cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#151a24] border border-[#232d3d] rounded-none px-3.5 py-2.5">
              <span className="font-mono text-xs font-bold tracking-widest text-zinc-200">
                {settings.licenseKey}
              </span>
              <button
                onClick={() => setEditingKey(true)}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Change
              </button>
            </div>
          )}
          {showKeySuccess && (
            <div className="text-[10px] text-[#00e676] font-mono mt-1 flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>License verified active</span>
            </div>
          )}
        </div>

        {/* CELEBRATION */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
              CELEBRATION THEME
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateSettings({ ...settings, celebrationTheme: 'Sparkles' })}
              className={`py-2 px-2.5 rounded-none text-xs font-semibold transition-all border cursor-pointer flex items-center justify-center space-x-1.5 ${
                settings.celebrationTheme === 'Sparkles'
                  ? 'bg-[#1e2738] border-[#f5a623] text-[#f5a623]'
                  : 'bg-[#151a24] border-[#222b3b] text-zinc-400 hover:text-white'
              }`}
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Sparkles</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ ...settings, celebrationTheme: 'Retro Future' })}
              className={`py-2 px-2.5 rounded-none text-xs font-semibold transition-all border cursor-pointer flex items-center justify-center space-x-1.5 ${
                settings.celebrationTheme === 'Retro Future'
                  ? 'bg-[#1e2738] border-[#f5a623] text-[#f5a623]'
                  : 'bg-[#151a24] border-[#222b3b] text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Retro Future</span>
            </button>
          </div>
        </div>

        {/* SOUNDS TOGGLE */}
        <div className="flex items-center justify-between py-2 border-b border-[#1b222e]">
          <span className="text-[11px] font-mono tracking-wider text-zinc-300 uppercase font-semibold">
            SOUNDS
          </span>
          <button
            onClick={() => toggleSwitch('sounds')}
            className={`w-14 h-7 p-1 transition-colors cursor-pointer flex items-center rounded-none border border-[#232d3d] ${
              settings.sounds ? 'bg-[#f5a623] justify-end' : 'bg-[#222b3a] justify-start'
            }`}
          >
            <span className="text-[9px] font-black text-black px-1 font-mono uppercase">
              {settings.sounds ? 'On' : 'Off'}
            </span>
            <div className="w-4 h-4 bg-white shadow-md rounded-none" />
          </button>
        </div>

        {/* HIDE ID NUMBER TOGGLE */}
        <div className="flex items-center justify-between py-2 border-b border-[#1b222e]">
          <span className="text-[11px] font-mono tracking-wider text-zinc-300 uppercase font-semibold">
            HIDE ID NUMBER
          </span>
          <button
            onClick={() => toggleSwitch('hideIdNumber')}
            className={`w-14 h-7 p-1 transition-colors cursor-pointer flex items-center rounded-none border border-[#232d3d] ${
              settings.hideIdNumber ? 'bg-[#f5a623] justify-end' : 'bg-[#222b3a] justify-start'
            }`}
          >
            <span className="text-[9px] font-black text-black px-1 font-mono uppercase">
              {settings.hideIdNumber ? 'On' : 'Off'}
            </span>
            <div className="w-4 h-4 bg-white shadow-md rounded-none" />
          </button>
        </div>

        {/* MINI LOG TOGGLE */}
        <div className="flex items-center justify-between py-2 border-b border-[#1b222e]">
          <span className="text-[11px] font-mono tracking-wider text-zinc-300 uppercase font-semibold">
            MINI LOG
          </span>
          <button
            onClick={() => toggleSwitch('miniLog')}
            className={`w-14 h-7 p-1 transition-colors cursor-pointer flex items-center rounded-none border border-[#232d3d] ${
              settings.miniLog ? 'bg-[#f5a623] justify-end' : 'bg-[#222b3a] justify-start'
            }`}
          >
            <span className="text-[9px] font-black text-black px-1 font-mono uppercase">
              {settings.miniLog ? 'On' : 'Off'}
            </span>
            <div className="w-4 h-4 bg-white shadow-md rounded-none" />
          </button>
        </div>

        {/* DYNAMIC STAKING TOGGLE */}
        <div className="flex items-center justify-between py-2 border-b border-[#1b222e]">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono tracking-wider text-zinc-300 uppercase font-semibold">
              DYNAMIC STAKING
            </span>
            <div
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              title="Automatically resizes remaining stakes dynamically if broker payout changes or loss run occurs."
            >
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>
          <button
            onClick={() => toggleSwitch('dynamicStaking')}
            className={`w-14 h-7 p-1 transition-colors cursor-pointer flex items-center rounded-none border border-[#232d3d] ${
              settings.dynamicStaking ? 'bg-[#f5a623] justify-end' : 'bg-[#222b3a] justify-start'
            }`}
          >
            <span className="text-[9px] font-black text-black px-1 font-mono uppercase">
              {settings.dynamicStaking ? 'On' : 'Off'}
            </span>
            <div className="w-4 h-4 bg-white shadow-md rounded-none" />
          </button>
        </div>

        {/* AUTO CONTINUE TOGGLE */}
        <div className="flex items-center justify-between py-2 border-b border-[#1b222e]">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono tracking-wider text-zinc-300 uppercase font-semibold">
              AUTO CONTINUE
            </span>
            <div
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              title="Automatically prepares next trading cycle upon reaching session target profit."
            >
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>
          <button
            onClick={() => toggleSwitch('autoContinue')}
            className={`w-14 h-7 p-1 transition-colors cursor-pointer flex items-center rounded-none border border-[#232d3d] ${
              settings.autoContinue ? 'bg-[#f5a623] justify-end' : 'bg-[#222b3a] justify-start'
            }`}
          >
            <span className="text-[9px] font-black text-black px-1 font-mono uppercase">
              {settings.autoContinue ? 'On' : 'Off'}
            </span>
            <div className="w-4 h-4 bg-white shadow-md rounded-none" />
          </button>
        </div>

        {/* TEST MODE TOGGLE */}
        <div className="flex items-center justify-between py-2 border-b border-[#1b222e]">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono tracking-wider text-zinc-300 uppercase font-semibold">
              TEST MODE
            </span>
            <div
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              title="Practice mode with virtual bankroll and zero real broker risk."
            >
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>
          <button
            onClick={() => toggleSwitch('testMode')}
            className={`w-14 h-7 p-1 transition-colors cursor-pointer flex items-center rounded-none border border-[#232d3d] ${
              settings.testMode ? 'bg-[#f5a623] justify-end' : 'bg-[#222b3a] justify-start'
            }`}
          >
            <span className="text-[9px] font-black text-black px-1 font-mono uppercase">
              {settings.testMode ? 'On' : 'Off'}
            </span>
            <div className="w-4 h-4 bg-white shadow-md rounded-none" />
          </button>
        </div>

        {/* POCKET OPTION BROKER LINK */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono tracking-wider text-[#00e676] font-bold uppercase flex items-center space-x-1">
              <span>POCKET OPTION BROKER LINK</span>
            </label>
            <a
              href={settings.brokerLink || 'https://pocket-friends.co/r/mphdnyllo5'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-[#f5a623] hover:underline flex items-center space-x-1"
            >
              <span>Open Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <input
            type="text"
            value={settings.brokerLink || 'https://pocket-friends.co/r/mphdnyllo5'}
            onChange={(e) => onUpdateSettings({ ...settings, brokerLink: e.target.value })}
            className="w-full bg-[#151a24] border border-[#232d3d] focus:border-[#00e676] rounded-none px-3 py-2 text-xs font-mono text-zinc-200 outline-none transition-colors"
            placeholder="https://pocket-friends.co/..."
          />
          <p className="text-[10px] text-zinc-500 font-mono mt-1">
            Connected to chart Deposit and quick launcher buttons.
          </p>
        </div>

        {/* CUSTOM AFFILIATE / PARTNER LINK (MANUAL FEED & CLICKABLE OPEN BUTTON) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono tracking-wider text-zinc-300 font-bold uppercase">
              AFFILIATE / PARTNER LINK
            </label>
            {settings.whopAffiliateLink && (
              <button
                onClick={handleOpenAffiliateLink}
                className="text-[10px] font-mono text-[#f5a623] hover:underline flex items-center space-x-1 cursor-pointer"
                title="Open your affiliate link in new tab"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={settings.whopAffiliateLink}
            onChange={(e) => onUpdateSettings({ ...settings, whopAffiliateLink: e.target.value })}
            className="w-full bg-[#151a24] border border-[#232d3d] focus:border-[#f5a623] rounded-none px-3 py-2 text-xs font-mono text-zinc-200 outline-none transition-colors"
            placeholder="https://..."
          />
          <p className="text-[10px] text-zinc-500 font-mono mt-1">
            Feed your own custom referral or partner link. Click 'Open Link ↗' to test or visit.
          </p>
        </div>
      </div>
    </div>
  );
};
