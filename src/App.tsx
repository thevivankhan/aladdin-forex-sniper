import React, { useState, useEffect, useRef } from 'react';
import {
  Mode,
  AppLayoutMode,
  ActiveView,
  PlanConfig,
  TradeStep,
  SessionResult,
  AppSettings,
} from './types';
import {
  getSavedSessions,
  saveSessions,
  getSavedSettings,
  saveSettings,
  getSavedPlanConfig,
  savePlanConfig,
  getSavedMode,
  saveMode,
} from './utils/storage';
import { calculatePlanPreview, calculateNextStake, formatCurrency } from './utils/sniperCore';
import { soundController } from './utils/audio';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { PlanSetup } from './components/PlanSetup';
import { ActiveTrading } from './components/ActiveTrading';
import { CelebrationModal } from './components/CelebrationModal';
import { SessionLogView } from './components/SessionLogView';
import { CalendarView } from './components/CalendarView';
import { ShareModal } from './components/ShareModal';
import { SettingsView } from './components/SettingsView';
import { HelpSupportModal } from './components/HelpSupportModal';
import { PocketOptionChart, ASSET_LIST } from './components/PocketOptionChart';
import { TradingViewChart } from './components/TradingViewChart';
import { SignalCardModal } from './components/SignalCardModal';
import { RadarHUD } from './components/RadarHudOverlay';

import {
  ForexSignal,
  FOREX_PAIRS,
  ForexPairConfig,
  MarketTimeframe,
  generateConfluenceSignal,
  generateLiveAiSignal,
} from './utils/forexScanner';
import { Maximize2, X, Plus } from 'lucide-react';

export default function App() {
  // App States
  const [mode, setMode] = useState<Mode>(getSavedMode);
  const [layoutMode, setLayoutMode] = useState<AppLayoutMode>('floating_overlay');
  const [activeView, setActiveView] = useState<ActiveView>('trading');
  const [chartSource, setChartSource] = useState<'tradingview' | 'pocketoption'>('tradingview');
  const [tvSymbol, setTvSymbol] = useState<string>('FX:EURUSD');
  const [currentTimeframe, setCurrentTimeframe] = useState<MarketTimeframe>('5m');
  const [activeForexSignal, setActiveForexSignal] = useState<ForexSignal | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSignalModalOpen, setIsSignalModalOpen] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'trade' | 'settings'>('trade');
  const [isPaused, setIsPaused] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Floating Widget Drag & Drop Position (mobile-friendly initial coords)
  const [widgetPos, setWidgetPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return { x: 8, y: 10 };
    }
    return { x: 20, y: 15 };
  });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 20,
    initY: 15,
  });

  // Floating Trade Manager Widget Controls
  const [isWidgetMinimized, setIsWidgetMinimized] = useState<boolean>(false);
  const [isWidgetClosed, setIsWidgetClosed] = useState<boolean>(false);
  const [isWidgetExpanded, setIsWidgetExpanded] = useState<boolean>(false);

  // Settings & Storage
  const [settings, setSettings] = useState<AppSettings>(getSavedSettings);
  const [sessions, setSessions] = useState<SessionResult[]>(getSavedSessions);
  const [planConfig, setPlanConfig] = useState<PlanConfig>(getSavedPlanConfig);

  // Active Session State - Default directly into Live Forex Real Signal Scanner
  const [sessionPhase, setSessionPhase] = useState<'SETUP' | 'TRADING' | 'CELEBRATION'>('TRADING');
  const [currentBalance, setCurrentBalance] = useState<number>(planConfig.balance || 10000);
  const [initialBalance, setInitialBalance] = useState<number>(planConfig.balance || 10000);
  const [targetBalance, setTargetBalance] = useState<number>(planConfig.balance || 10000);
  const [steps, setSteps] = useState<TradeStep[]>([]);
  const [lastFinishedSession, setLastFinishedSession] = useState<SessionResult | null>(null);


  // Live Chart Asset
  const [currentAsset, setCurrentAsset] = useState<string>(planConfig.asset || 'BTC/USD OTC');

  // Sync sound setting
  useEffect(() => {
    soundController.enabled = settings.sounds;
  }, [settings.sounds]);

  // Play crisp, satisfying sound on every button click throughout the app
  useEffect(() => {
    const handleGlobalButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('[role="button"]')) {
        soundController.playTradeClick();
      }
    };
    window.addEventListener('click', handleGlobalButtonClick, true);
    return () => window.removeEventListener('click', handleGlobalButtonClick, true);
  }, []);

  // Global Drag listeners (Mouse & Touch with smooth touch-none support)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      const widgetWidth = window.innerWidth < 640 ? 300 : 340;
      const maxX = Math.max(0, window.innerWidth - widgetWidth);
      const maxY = Math.max(0, window.innerHeight - 80);
      const newX = Math.max(0, Math.min(maxX, dragStartRef.current.initX + dx));
      const newY = Math.max(0, Math.min(maxY, dragStartRef.current.initY + dy));
      setWidgetPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      if (e.cancelable) {
        e.preventDefault(); // Prevent viewport bounce while dragging widget on mobile
      }
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;
      const widgetWidth = window.innerWidth < 640 ? 280 : 340;
      const maxX = Math.max(0, window.innerWidth - widgetWidth);
      const maxY = Math.max(0, window.innerHeight - 80);
      const newX = Math.max(0, Math.min(maxX, dragStartRef.current.initX + dx));
      const newY = Math.max(0, Math.min(maxY, dragStartRef.current.initY + dy));
      setWidgetPos({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleStartDrag = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: widgetPos.x,
      initY: widgetPos.y,
    };
  };

  const handleStartTouchDrag = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      initX: widgetPos.x,
      initY: widgetPos.y,
    };
  };

  const dragHandleProps = {
    onMouseDown: handleStartDrag,
    onTouchStart: handleStartTouchDrag,
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUpdateConfig = (newConfig: PlanConfig) => {
    setPlanConfig(newConfig);
    savePlanConfig(newConfig);
  };

  const handleToggleMode = () => {
    const nextMode = mode === 'REAL' ? 'DEMO' : 'REAL';
    setMode(nextMode);
    saveMode(nextMode);
  };

  const handleStartSession = () => {
    const preview = calculatePlanPreview(planConfig);
    setInitialBalance(planConfig.balance);
    setCurrentBalance(planConfig.balance);
    setTargetBalance(preview.finalCapital);
    setSteps([]);
    setSessionPhase('TRADING');
    setActiveSubTab('trade');
    setIsWidgetClosed(false);
    setIsWidgetMinimized(false);
  };

  const handleRecordTrade = (result: 'WIN' | 'LOSS', stake: number, payoutPercent: number) => {
    let newBalance = currentBalance;
    const p = payoutPercent / 100;

    if (result === 'WIN') {
      const profit = Math.round(stake * p * 100) / 100;
      newBalance = Math.round((currentBalance + profit) * 100) / 100;
    } else {
      newBalance = Math.round((currentBalance - stake) * 100) / 100;
    }

    const currentStepNum = steps.length + 1;
    const newStep: TradeStep = {
      step: currentStepNum,
      stake,
      result,
      balanceAfter: newBalance,
      payoutUsed: payoutPercent,
      timestamp: Date.now(),
    };

    const nextSteps = [...steps, newStep];
    setSteps(nextSteps);
    setCurrentBalance(newBalance);

    const wonCount = nextSteps.filter((s) => s.result === 'WIN').length;
    const lostCount = nextSteps.filter((s) => s.result === 'LOSS').length;

    if (wonCount >= planConfig.winsNeeded || newBalance >= targetBalance) {
      completeSession('WIN', newBalance, wonCount, lostCount, nextSteps);
    } else if (nextSteps.length >= planConfig.trades) {
      completeSession('LOSS', newBalance, wonCount, lostCount, nextSteps);
    }
  };

  const handleEndSessionEarly = () => {
    const wonCount = steps.filter((s) => s.result === 'WIN').length;
    const lostCount = steps.filter((s) => s.result === 'LOSS').length;
    completeSession('MANUAL_EXIT', currentBalance, wonCount, lostCount, steps);
  };

  // Handle Real-Time Live Radar Scan across the TradingView Chart using Gemini AI & Live Market Quotes
  const handleTriggerRadarScan = async (pairConfig?: ForexPairConfig, tf?: MarketTimeframe) => {
    setIsScanning(true);
    soundController.playRadarScan();
    const targetPair =
      pairConfig || FOREX_PAIRS.find((p) => p.tvSymbol === tvSymbol) || FOREX_PAIRS[0];
    const targetTf = tf || currentTimeframe;
    if (tf && tf !== currentTimeframe) {
      setCurrentTimeframe(tf);
    }

    // Realistic institutional scan cycle: ensure full 3.8s radar sweep traverses chart
    // so user clearly witnesses real-time S/R breakout analysis and sonar pings
    const scanDelayPromise = new Promise((resolve) => setTimeout(resolve, 3800));

    try {
      const [newSignal] = await Promise.all([
        generateLiveAiSignal(targetPair, targetTf),
        scanDelayPromise,
      ]);
      setActiveForexSignal(newSignal);
      setIsScanning(false);
      soundController.playForexSignal(newSignal.symbol, newSignal.direction, newSignal.entryPrice);
      setIsSignalModalOpen(true);
    } catch {
      const fallbackSignal = generateConfluenceSignal(targetPair, undefined, targetTf);
      await scanDelayPromise;
      setActiveForexSignal(fallbackSignal);
      setIsScanning(false);
      soundController.playForexSignal(fallbackSignal.symbol, fallbackSignal.direction, fallbackSignal.entryPrice);
      setIsSignalModalOpen(true);
    }
  };


  const completeSession = (
    status: 'WIN' | 'LOSS' | 'MANUAL_EXIT',
    endingBal: number,
    won: number,
    lost: number,
    allSteps: TradeStep[]
  ) => {
    const profitLoss = Math.round((endingBal - initialBalance) * 100) / 100;
    const now = new Date();
    const dateFormatted =
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateKey = now.toISOString().split('T')[0];

    const newRecord: SessionResult = {
      id: `session-${Date.now()}`,
      sessionNumber: sessions.length + 1,
      date: dateFormatted,
      dateKey,
      accountBal: initialBalance,
      trades: planConfig.trades,
      winsNeeded: planConfig.winsNeeded,
      payout: planConfig.payout,
      capitalGoal: targetBalance,
      gainTargetPercent: calculatePlanPreview(planConfig).accountGainPercent,
      winProfit: calculatePlanPreview(planConfig).winProfit,
      endingBalance: endingBal,
      won,
      lost,
      profitLoss,
      status,
      steps: allSteps,
    };

    const updatedSessions = [...sessions, newRecord];
    setSessions(updatedSessions);
    saveSessions(updatedSessions);

    const updatedConfig = { ...planConfig, balance: endingBal };
    handleUpdateConfig(updatedConfig);

    setLastFinishedSession(newRecord);
    setSessionPhase('CELEBRATION');
  };

  const handleRepeatSession = () => {
    handleStartSession();
  };

  const handleClearLastSession = () => {
    if (sessions.length === 0) return;
    const next = sessions.slice(0, -1);
    setSessions(next);
    saveSessions(next);
  };

  const handleClearAllSessions = () => {
    setSessions([]);
    saveSessions([]);
  };

  const completedCount = steps.length;
  const wonCount = steps.filter((s) => s.result === 'WIN').length;
  const winsLeft = Math.max(0, planConfig.winsNeeded - wonCount);
  const tradesLeft = Math.max(0, planConfig.trades - completedCount);
  const { stake: currentDockStake } = calculateNextStake(
    currentBalance,
    initialBalance,
    targetBalance,
    tradesLeft,
    winsLeft,
    planConfig.payout,
    planConfig.balance <= 2500 ? 1.10 : planConfig.balance <= 6000 ? 10.05 : 2.12,
    completedCount === 0
  );
  const currentPL = currentBalance - initialBalance;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b12] text-white font-sans antialiased overflow-hidden">
      {/* Top Main Page Header */}
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
      />

      {/* Main Body Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Navigation Drawer */}
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeView={activeView}
          onSelectView={(v) => {
            if (v === 'help') {
              setIsHelpModalOpen(true);
            } else {
              setActiveView(v);
            }
          }}
        />

        {/* Persistent Trading View with Real Live TradingView & Floating Cockpit (Kept mounted to eliminate white flash & reloading) */}
        <div
          className={`flex-1 h-full w-full overflow-hidden relative bg-[#070b12] ${
            activeView === 'trading' ? 'flex' : 'hidden'
          }`}
        >
          {/* 100% Full-Screen Real Live TradingView Chart */}
          {(layoutMode === 'floating_overlay' || layoutMode === 'web_portal') && (
            <div className="absolute inset-0 z-0 bg-[#070b12]">
              <TradingViewChart
                currentSymbol={tvSymbol}
                activeSignal={activeForexSignal}
                isScanning={isScanning}
                onOpenSignalModal={() => setIsSignalModalOpen(true)}
                currentTimeframe={currentTimeframe}
              />

              {/* High-Precision D3 RadarHUD Overlay - Only activates when isScanning is true */}
              {isScanning && (
                <RadarHUD
                  currentSymbol={tvSymbol}
                  activeSignal={activeForexSignal}
                  isScanning={isScanning}
                />
              )}
            </div>
          )}


            {/* When Floating Trade Manager is Closed (✕): Show Quick Reopen Floating Chip */}
            {isWidgetClosed && layoutMode === 'floating_overlay' && (
              <button
                onClick={() => {
                  setIsWidgetClosed(false);
                  setIsWidgetMinimized(false);
                }}
                className="absolute top-4 left-4 z-20 flex items-center space-x-2.5 bg-[#0e1420] hover:bg-[#151f30] border-2 border-[#f5a623] shadow-[0_0_24px_rgba(245,166,35,0.45)] px-4 py-2.5 text-xs font-black text-white transition-all cursor-pointer rounded-none animate-in fade-in"
                title="Open Aladdin Forex Sniper"
              >
                <div className="w-5 h-5 bg-[#f5a623] flex items-center justify-center font-black text-black text-xs font-mono shadow-[0_0_8px_#f5a623]">
                  A
                </div>
                <span className="font-['Chakra_Petch',sans-serif] tracking-wider text-[#f5a623]">
                  OPEN ALADDIN SNIPER
                </span>
                <Plus className="w-3.5 h-3.5 text-[#f5a623]" />
              </button>
            )}

            {/* When Floating Trade Manager is Minimized (-): Show Draggable Compact Dock Bar */}
            {!isWidgetClosed && isWidgetMinimized && layoutMode === 'floating_overlay' && (
              <div
                style={{ transform: `translate3d(${widgetPos.x}px, ${widgetPos.y}px, 0)` }}
                className="absolute z-20 flex items-center bg-[#0d121b]/95 border-2 border-[#00e676]/60 shadow-[0_8px_32px_rgba(0,0,0,0.9),_0_0_16px_rgba(0,230,118,0.25)] px-3 py-2 space-x-2 sm:space-x-3 select-none rounded-none cursor-grab active:cursor-grabbing max-w-[calc(100vw-16px)]"
                {...dragHandleProps}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#f5a623] flex items-center justify-center font-black text-black text-xs font-mono shadow-[0_0_10px_#f5a623]">
                  A
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-mono">
                  <span className="text-[#f5a623] font-bold">ALADDIN FOREX:</span>
                  <span className="text-white font-black">{tvSymbol.split(':')[1] || tvSymbol}</span>
                  <span className="text-zinc-600 hidden xs:inline">|</span>
                  <span className="text-[#00e676] font-bold">{currentTimeframe} SCANNER</span>
                </div>

                <button
                  onClick={() => setIsWidgetMinimized(false)}
                  className="px-2 py-1 bg-[#162234] hover:bg-[#20314b] text-[#00e676] border border-[#00e676]/60 text-xs font-bold cursor-pointer rounded-none flex items-center space-x-1 shadow-[0_0_8px_rgba(0,230,118,0.3)]"
                  title="Expand Window"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Open</span>
                </button>
              </div>
            )}

            {/* Draggable Compact PocketSniper Floating Trade Manager Widget */}
            {!isWidgetClosed && !isWidgetMinimized && (
              <div
                style={
                  layoutMode === 'floating_overlay'
                    ? { transform: `translate3d(${widgetPos.x}px, ${widgetPos.y}px, 0)` }
                    : undefined
                }
                className={`z-10 flex flex-col rounded-none border-2 border-[#f5a623]/70 shadow-[0_16px_50px_rgba(0,0,0,0.95),_0_0_24px_rgba(245,166,35,0.2)] overflow-hidden bg-[#0d121b] ${
                  layoutMode === 'floating_overlay'
                    ? `absolute ${
                        isWidgetExpanded ? 'w-[380px] sm:w-[440px]' : 'w-[310px] sm:w-[340px]'
                      } max-w-[calc(100vw-16px)] max-h-[92vh]`
                    : layoutMode === 'web_portal'
                    ? 'w-full md:w-[360px] h-full border-l border-[#1e2634]'
                    : 'w-full max-w-sm mx-auto my-auto h-full max-h-[94vh]'
                }`}
              >
                {/* Widget Body Content */}
                {activeSubTab === 'settings' ? (
                  <SettingsView
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onBackToTrade={() => setActiveSubTab('trade')}
                    onMinimize={() => setIsWidgetMinimized(true)}
                    onToggleExpand={() => setIsWidgetExpanded(!isWidgetExpanded)}
                    onCloseWidget={() => setIsWidgetClosed(true)}
                    isExpanded={isWidgetExpanded}
                    dragHandleProps={layoutMode === 'floating_overlay' ? dragHandleProps : undefined}
                  />
                ) : sessionPhase === 'SETUP' ? (
                  <PlanSetup
                    config={planConfig}
                    onChangeConfig={handleUpdateConfig}
                    onStartSession={handleStartSession}
                    onOpenSessionLog={() => setActiveView('session_log')}
                    onOpenSettings={() => setActiveSubTab('settings')}
                    onMinimize={() => setIsWidgetMinimized(true)}
                    onToggleExpand={() => setIsWidgetExpanded(!isWidgetExpanded)}
                    onCloseWidget={() => setIsWidgetClosed(true)}
                    isExpanded={isWidgetExpanded}
                    dragHandleProps={layoutMode === 'floating_overlay' ? dragHandleProps : undefined}
                  />
                ) : sessionPhase === 'TRADING' ? (
                  <ActiveTrading
                    config={planConfig}
                    currentBalance={currentBalance}
                    onOpenSettings={() => setActiveSubTab('settings')}
                    activeTab={activeSubTab}
                    onChangeTab={setActiveSubTab}
                    onMinimize={() => setIsWidgetMinimized(true)}
                    onToggleExpand={() => setIsWidgetExpanded(!isWidgetExpanded)}
                    onCloseWidget={() => setIsWidgetClosed(true)}
                    isExpanded={isWidgetExpanded}
                    dragHandleProps={layoutMode === 'floating_overlay' ? dragHandleProps : undefined}
                    tvSymbol={tvSymbol}
                    onSelectTvSymbol={setTvSymbol}
                    activeSignal={activeForexSignal}
                    onSignalGenerated={setActiveForexSignal}
                    isScanning={isScanning}
                    onTriggerScan={handleTriggerRadarScan}
                    onOpenSignalModal={() => setIsSignalModalOpen(true)}
                    currentTimeframe={currentTimeframe}
                    onChangeTimeframe={setCurrentTimeframe}
                  />

                ) : (
                  /* Celebration Phase */
                  lastFinishedSession && (
                    <CelebrationModal
                      session={lastFinishedSession}
                      currency={planConfig.currency}
                      celebrationTheme={settings.celebrationTheme}
                      onRepeatSession={handleRepeatSession}
                      onChangePlan={() => setSessionPhase('SETUP')}
                      onOpenSessionLog={() => setActiveView('session_log')}
                    />
                  )
                )}
              </div>
            )}
        </div>

        {/* Full-Screen Session Log View */}
        {activeView === 'session_log' && (
          <div className="flex-1 flex h-full w-full overflow-hidden relative bg-[#070b12]">
            <SessionLogView
              sessions={sessions}
              currency={planConfig.currency}
              onClearLast={handleClearLastSession}
              onClearAll={handleClearAllSessions}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onSwitchToCalendar={() => setActiveView('pnl_calendar')}
              onBackToTrading={() => setActiveView('trading')}
            />
          </div>
        )}

        {/* Full-Screen P&L Calendar View */}
        {activeView === 'pnl_calendar' && (
          <div className="flex-1 flex h-full w-full overflow-hidden relative bg-[#070b12]">
            <CalendarView
              sessions={sessions}
              currency={planConfig.currency}
              onSwitchToSessionLog={() => setActiveView('session_log')}
              onBackToTrading={() => setActiveView('trading')}
            />
          </div>
        )}

        {/* Full-Screen Settings View */}
        {activeView === 'settings' && (
          <div className="flex-1 flex justify-center bg-[#070b12] overflow-y-auto p-4 sm:p-6">
            <div className="w-full max-w-md bg-[#0d121b] border-2 border-[#1e2a3c] rounded-none overflow-hidden shadow-2xl h-fit">
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onBackToTrade={() => setActiveView('trading')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sessions={sessions}
        currency={planConfig.currency}
        traderName={settings.hideIdNumber ? 'Trader ****' : settings.traderName}
      />

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Dedicated Aladdin AI Live Signal Card Modal */}
      <SignalCardModal
        isOpen={isSignalModalOpen}
        signal={activeForexSignal}
        onClose={() => setIsSignalModalOpen(false)}
        onExecuteTrade={(dir) => {
          const nextStake = calculateNextStake(
            currentBalance,
            initialBalance,
            targetBalance,
            tradesLeft,
            winsLeft,
            planConfig.payout,
            10,
            steps.length === 0
          ).stake;
          handleRecordTrade('WIN', nextStake, planConfig.payout);
        }}
      />
    </div>
  );
}
