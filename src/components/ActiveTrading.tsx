import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PlanConfig } from '../types';
import { soundController } from '../utils/audio';
import {
  FOREX_PAIRS,
  ForexPairConfig,
  ForexSignal,
  MarketTimeframe,
  generateConfluenceSignal,
  generateLiveAiSignal,
  createCustomPair,
  calculateForexLotSize,
  formatSignalForClipboard,
  searchAssets,
} from '../utils/forexScanner';
import { getLiveQuote, fetchExactLiveQuote, LiveMarketQuote } from '../utils/liveMarketData';
import {
  Copy,
  Check,
  TrendingUp,
  Settings as SettingsIcon,
  RefreshCw,
  Minus,
  Square,
  Minimize2,
  GripHorizontal,
  ArrowUp,
  ArrowDown,
  Flame,
  CheckCircle2,
  XCircle,
  Radio,
  Sliders,
  Zap,
  Search,
  Clock,
  Sparkles,
  ShieldAlert,
  Target,
  DollarSign,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react';

interface ActiveTradingProps {
  config: PlanConfig;
  currentBalance: number;
  onOpenSettings: () => void;
  activeTab: 'trade' | 'settings';
  onChangeTab: (tab: 'trade' | 'settings') => void;
  onMinimize?: () => void;
  onToggleExpand?: () => void;
  onCloseWidget?: () => void;
  isExpanded?: boolean;
  dragHandleProps?: Record<string, unknown>;
  tvSymbol?: string;
  onSelectTvSymbol?: (s: string) => void;
  activeSignal?: ForexSignal | null;
  onSignalGenerated?: (sig: ForexSignal) => void;
  isScanning?: boolean;
  onTriggerScan?: (pair?: ForexPairConfig, tf?: MarketTimeframe) => void;
  onOpenSignalModal?: () => void;
  currentTimeframe?: MarketTimeframe;
  onChangeTimeframe?: (tf: MarketTimeframe) => void;
}

export interface ActiveForexTrade {
  id: string;
  symbol: string;
  pairId: string;
  direction: 'BUY' | 'SELL';
  timeframe: MarketTimeframe;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  lotSize: number;
  pips: number;
  pnl: number;
  openedAt: number;
  status: 'OPEN' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'CLOSED';
}

const AVAILABLE_TIMEFRAMES: MarketTimeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'];

export const ActiveTrading: React.FC<ActiveTradingProps> = ({
  config,
  currentBalance: initialBalanceProp,
  onOpenSettings,
  activeTab,
  onChangeTab,
  onMinimize,
  onToggleExpand,
  isExpanded = false,
  dragHandleProps,
  tvSymbol = 'FX:EURUSD',
  onSelectTvSymbol,
  activeSignal: externalSignal,
  onSignalGenerated,
  isScanning = false,
  onTriggerScan,
  onOpenSignalModal,
  currentTimeframe = '5m',
  onChangeTimeframe,
}) => {
  // Account & Risk Settings
  const [accountBalance, setAccountBalance] = useState<number>(() => {
    return initialBalanceProp || 10000;
  });
  const [riskPercent, setRiskPercent] = useState<number>(1.5); // 1.5% standard forex risk
  const [customLotSize, setCustomLotSize] = useState<number | null>(null);

  // Selected Pair & 1,000+ Assets Search
  const [selectedPair, setSelectedPair] = useState<ForexPairConfig>(() => {
    return FOREX_PAIRS.find((p) => p.tvSymbol === tvSymbol) || FOREX_PAIRS[0];
  });
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Forex' | 'Metals' | 'Crypto' | 'Indices' | 'Stocks'>('Forex');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState<boolean>(false);
  const [copiedSignal, setCopiedSignal] = useState<boolean>(false);

  // Real Live Market Price state (Direct live rates)
  const [liveQuote, setLiveQuote] = useState<LiveMarketQuote>(() => getLiveQuote(selectedPair));
  const [priceTickStatus, setPriceTickStatus] = useState<'UP' | 'DOWN' | 'NEUTRAL'>('NEUTRAL');

  // Active Live Signal
  const [currentSignal, setCurrentSignal] = useState<ForexSignal>(() => {
    return externalSignal || generateConfluenceSignal(selectedPair, 'BUY', currentTimeframe);
  });

  // Active Forex Live Positions
  const [activeTrades, setActiveTrades] = useState<ActiveForexTrade[]>([]);
  const [activeDeckTab, setActiveDeckTab] = useState<'signal' | 'positions' | 'calculator'>('signal');

  // Filtered Assets from 1,000+ Master Database
  const searchResults = useMemo(() => {
    return searchAssets(searchQuery, selectedCategory, 50);
  }, [searchQuery, selectedCategory]);

  // Recommended Lot Size calculation
  const recommendedLotSize = useMemo(() => {
    if (customLotSize) return customLotSize;
    return calculateForexLotSize(accountBalance, riskPercent, currentSignal.stopLossPips, selectedPair);
  }, [accountBalance, riskPercent, currentSignal.stopLossPips, selectedPair, customLotSize]);

  // Fetch real live price continuously for the selected pair directly from TradingView
  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      const quote = await fetchExactLiveQuote(selectedPair.tvSymbol || selectedPair.id);
      if (quote && isMounted) {
        setLiveQuote((prev) => {
          if (quote.price > prev.price) setPriceTickStatus('UP');
          else if (quote.price < prev.price) setPriceTickStatus('DOWN');
          else setPriceTickStatus('NEUTRAL');
          return quote;
        });

        // Ensure currentSignal entryPrice strictly stays in sync with real live price
        setCurrentSignal((prev) => ({
          ...prev,
          entryPrice: quote.price,
        }));
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedPair]);

  // Sync external signal
  useEffect(() => {
    if (externalSignal) {
      setCurrentSignal(externalSignal);
    }
  }, [externalSignal]);

  // Notify parent on initial load
  useEffect(() => {
    if (currentSignal && !externalSignal) {
      onSignalGenerated?.(currentSignal);
    }
  }, []);

  // Update active trades P&L relative to current live price
  useEffect(() => {
    if (activeTrades.length === 0) return;

    setActiveTrades((prevTrades) =>
      prevTrades.map((trade) => {
        if (trade.status === 'CLOSED') return trade;

        const isForex = selectedPair.category === 'Forex';
        const pipMultiplier = selectedPair.pipMultiplier || (isForex ? 10000 : 10);
        const pipDiff = trade.direction === 'BUY'
          ? (liveQuote.price - trade.entryPrice) * pipMultiplier
          : (trade.entryPrice - liveQuote.price) * pipMultiplier;

        const roundedPips = Math.round(pipDiff * 10) / 10;
        const pnl = Math.round(roundedPips * trade.lotSize * 10 * 100) / 100;

        let status = trade.status;
        if (trade.direction === 'BUY') {
          if (liveQuote.price >= trade.takeProfit3) status = 'TP3_HIT';
          else if (liveQuote.price >= trade.takeProfit2) status = 'TP2_HIT';
          else if (liveQuote.price >= trade.takeProfit1) status = 'TP1_HIT';
          else if (liveQuote.price <= trade.stopLoss) status = 'SL_HIT';
        } else {
          if (liveQuote.price <= trade.takeProfit3) status = 'TP3_HIT';
          else if (liveQuote.price <= trade.takeProfit2) status = 'TP2_HIT';
          else if (liveQuote.price <= trade.takeProfit1) status = 'TP1_HIT';
          else if (liveQuote.price >= trade.stopLoss) status = 'SL_HIT';
        }

        return {
          ...trade,
          currentPrice: liveQuote.price,
          pips: roundedPips,
          pnl,
          status,
        };
      })
    );
  }, [liveQuote.price, selectedPair]);

  // Select Pair from 1000+ Assets
  const handleSelectPair = (pair: ForexPairConfig) => {
    setSelectedPair(pair);
    soundController.playTorchSwitch();
    onSelectTvSymbol?.(pair.tvSymbol);
    onTriggerScan?.(pair, currentTimeframe);
    setIsAssetDrawerOpen(false);
    setSearchQuery('');
  };

  // Switch Timeframe (1m to 1M)
  const handleTimeframeChange = (tf: MarketTimeframe) => {
    soundController.playTradeClick();
    onChangeTimeframe?.(tf);
    onTriggerScan?.(selectedPair, tf);
  };

  // Copy signal to clipboard
  const handleCopySignal = () => {
    soundController.playTradeClick();
    const formatted = formatSignalForClipboard(currentSignal);
    navigator.clipboard.writeText(formatted);
    setCopiedSignal(true);
    setTimeout(() => setCopiedSignal(false), 2000);
  };

  // Execute Forex Trade (BUY or SELL)
  const handleExecuteTrade = (direction: 'BUY' | 'SELL') => {
    soundController.playTradePlaced(direction, recommendedLotSize * 100);

    const newTrade: ActiveForexTrade = {
      id: `trade_${Date.now()}`,
      symbol: selectedPair.symbol,
      pairId: selectedPair.id,
      direction,
      timeframe: currentTimeframe,
      entryPrice: liveQuote.price,
      currentPrice: liveQuote.price,
      stopLoss: currentSignal.stopLoss,
      takeProfit1: currentSignal.takeProfit1,
      takeProfit2: currentSignal.takeProfit2,
      takeProfit3: currentSignal.takeProfit3,
      lotSize: recommendedLotSize,
      pips: 0,
      pnl: 0,
      openedAt: Date.now(),
      status: 'OPEN',
    };

    setActiveTrades((prev) => [newTrade, ...prev]);
    setActiveDeckTab('positions');
  };

  // Close Active Position
  const handleClosePosition = (tradeId: string) => {
    const trade = activeTrades.find((t) => t.id === tradeId);
    if (trade && trade.pnl >= 0) {
      soundController.playWin();
    } else {
      soundController.playLoss();
    }

    setActiveTrades((prev) =>
      prev.map((t) => (t.id === tradeId ? { ...t, status: 'CLOSED' as const } : t))
    );
  };

  const openTradesCount = activeTrades.filter((t) => t.status !== 'CLOSED').length;
  const totalOpenPnl = activeTrades
    .filter((t) => t.status !== 'CLOSED')
    .reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="flex flex-col h-full bg-[#0d121b]/98 backdrop-blur-md text-white select-none overflow-y-auto rounded-none border border-[#1e2a3c]">
      {/* Draggable Title Header with Controls */}
      <div
        {...dragHandleProps}
        className="flex items-center justify-between border-b border-[#1b2638] px-2.5 py-1.5 bg-[#0a0e16] cursor-grab active:cursor-grabbing select-none"
        title="Drag anywhere on screen"
      >
        {/* Left: Aladdin Forex Branding & Tabs */}
        <div className="flex items-center space-x-1" onMouseDown={(e) => e.stopPropagation()}>
          <div className="text-zinc-600 mr-1 hidden sm:block">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>

          <button
            onClick={() => onChangeTab('trade')}
            className={`flex items-center space-x-1 py-1 px-2.5 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
              activeTab === 'trade'
                ? 'border-[#f5a623] text-[#f5a623] shadow-[0_2px_8px_rgba(245,166,35,0.3)]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-[#f5a623]" />
            <span>Aladdin Forex Sniper</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-1 py-1 px-2.5 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#f5a623] text-[#f5a623]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SettingsIcon className="w-3 h-3 text-zinc-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center space-x-0.5" onMouseDown={(e) => e.stopPropagation()}>
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Minimize (-)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Restore' : 'Maximize (□)'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-2 sm:p-2.5 space-y-2">
        {/* TIMEFRAME SELECTOR BAR (1m to 1M) */}
        <div className="bg-[#101724] border border-[#1e2a3c] p-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1 px-1">
            <span className="flex items-center space-x-1 text-[#f5a623] font-bold">
              <Clock className="w-3 h-3" />
              <span>SCAN TIMEFRAME (1m - 1M)</span>
            </span>
            <span className="text-[#00e676] font-bold">TradingView Synced</span>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pb-0.5">
            {AVAILABLE_TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`flex-1 py-1 px-1.5 text-center text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  currentTimeframe === tf
                    ? 'bg-[#f5a623] text-black border-[#f5a623] shadow-[0_0_10px_rgba(245,166,35,0.4)]'
                    : 'bg-[#0b1018] text-zinc-400 border-[#1a2536] hover:text-white hover:bg-[#162234]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* 1,000+ CURRENCIES & ASSETS SELECTOR BAR */}
        <div className="bg-[#101724] border border-[#1e2a3c] p-1.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono font-black text-[#f5a623] flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>1,000+ CURRENCIES</span>
              </span>
              <span className="bg-[#182333] text-[#00e676] text-[8px] font-mono px-1.5 py-0.2 font-bold">
                REAL MARKET
              </span>
            </div>

            <button
              onClick={() => setIsAssetDrawerOpen((prev) => !prev)}
              className="flex items-center space-x-1 py-0.5 px-2 bg-[#1b2738] hover:bg-[#25354c] text-white text-[10px] font-mono font-bold border border-[#2b3d56] cursor-pointer"
            >
              <Search className="w-3 h-3 text-[#f5a623]" />
              <span>SEARCH ALL (1000+)</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          {/* Quick Trending Chips (Forex Majors, Gold, BTC, SOL, Indices) */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pb-0.5 text-[10px] font-mono font-bold">
            {FOREX_PAIRS.slice(0, 10).map((p) => {
              const isSelected = p.id === selectedPair.id;
              const isGold = p.id === 'XAUUSD';

              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPair(p)}
                  className={`px-2 py-1 whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? isGold
                        ? 'bg-[#ffd700]/25 text-[#ffd700] border-[#ffd700] shadow-[0_0_10px_rgba(255,215,0,0.4)]'
                        : 'bg-[#f5a623]/25 text-[#f5a623] border-[#f5a623] shadow-[0_0_10px_rgba(245,166,35,0.4)]'
                      : 'bg-[#0b1018] hover:bg-[#162234] text-zinc-300 border-[#1a2536]'
                  }`}
                >
                  {isGold ? '★ GOLD' : p.symbol}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1,000+ ASSETS SEARCH MODAL / DRAWER */}
        {isAssetDrawerOpen && (
          <div className="bg-[#0b1018] border-2 border-[#f5a623] p-2 space-y-2 animate-in fade-in max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1f2d42] pb-1.5">
              <span className="text-[11px] font-mono font-bold text-white flex items-center space-x-1">
                <Search className="w-3.5 h-3.5 text-[#f5a623]" />
                <span>Search 1,000+ Currencies & Assets</span>
              </span>
              <button
                onClick={() => setIsAssetDrawerOpen(false)}
                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none text-[9px] font-mono">
              {(['All', 'Forex', 'Metals', 'Crypto', 'Indices', 'Stocks'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 font-bold uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#f5a623] text-black'
                      : 'bg-[#121927] text-zinc-400 hover:text-white border border-[#1d293d]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search symbol e.g. EURUSD, GOLD, BTC, SOL, TSLA, US500..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-[#101724] border border-[#23334d] px-2 py-1.5 text-xs font-mono text-white placeholder-zinc-500 outline-none focus:border-[#f5a623]"
            />

            {/* Search Results Grid */}
            <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-1">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectPair(item)}
                  className={`p-1.5 text-left text-[10px] font-mono border transition-all cursor-pointer flex flex-col ${
                    item.id === selectedPair.id
                      ? 'bg-[#f5a623]/20 border-[#f5a623] text-[#f5a623]'
                      : 'bg-[#101622] border-[#1c2738] text-zinc-300 hover:bg-[#182335] hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{item.symbol}</span>
                    <span className="text-[8px] text-zinc-500 uppercase">{item.category}</span>
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate">{item.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 100% REAL LIVE MARKET TICKER CARD */}
        <div className="bg-[#101622] border border-[#1e2a3c] p-2 grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs shadow-inner">
          {/* REAL EXACT PRICE */}
          <div className="bg-[#0b1018] p-1.5 border border-[#172233]">
            <div className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase flex items-center justify-between">
              <span className="text-[#f5a623] font-bold">REAL LIVE PRICE</span>
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  priceTickStatus === 'UP'
                    ? 'bg-[#00e676] animate-ping'
                    : priceTickStatus === 'DOWN'
                    ? 'bg-[#ff3b57] animate-ping'
                    : 'bg-zinc-500'
                }`}
              />
            </div>
            <div
              className={`font-mono font-black text-sm mt-0.5 flex items-center space-x-1 ${
                priceTickStatus === 'UP'
                  ? 'text-[#00e676]'
                  : priceTickStatus === 'DOWN'
                  ? 'text-[#ff3b57]'
                  : 'text-white'
              }`}
            >
              {priceTickStatus === 'UP' ? <ArrowUp className="w-3.5 h-3.5 stroke-[3]" /> : priceTickStatus === 'DOWN' ? <ArrowDown className="w-3.5 h-3.5 stroke-[3]" /> : null}
              <span>{liveQuote.price}</span>
            </div>
          </div>

          {/* ACTIVE ASSET & TIMEFRAME */}
          <div className="bg-[#0b1018] p-1.5 border border-[#172233]">
            <div className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
              ACTIVE ASSET
            </div>
            <div className="font-mono font-bold text-xs text-[#f5a623] mt-0.5 truncate">
              {selectedPair.symbol} ({currentTimeframe})
            </div>
          </div>

          {/* REAL BID / ASK & SPREAD */}
          <div className="bg-[#0b1018] p-1.5 border border-[#172233]">
            <div className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
              BID / ASK
            </div>
            <div className="font-mono text-[10px] text-zinc-300 mt-0.5">
              <span>{liveQuote.bid}</span> <span className="text-zinc-600">/</span> <span>{liveQuote.ask}</span>
            </div>
          </div>

          {/* SPREAD & 24H CHANGE */}
          <div className="bg-[#0b1018] p-1.5 border border-[#172233]">
            <div className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
              SPREAD / 24H
            </div>
            <div className="font-mono font-bold text-[10px] mt-0.5 flex items-center space-x-1.5">
              <span className="text-zinc-300">{liveQuote.spreadPips} pips</span>
              <span
                className={
                  liveQuote.change24h >= 0 ? 'text-[#00e676]' : 'text-[#ff3b57]'
                }
              >
                {liveQuote.change24h >= 0 ? '+' : ''}{liveQuote.change24hPercent || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* PROPER FOREX SIGNAL RADAR HUD */}
        <div className="bg-[#0f1724] border-2 border-[#1f2d42] p-2 space-y-2">
          {/* Signal Header & AI Confluence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isScanning ? 'bg-[#f5a623]' : 'bg-[#00e676]'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isScanning ? 'bg-[#f5a623]' : 'bg-[#00e676]'
                  }`}
                />
              </span>

              <div className="font-mono">
                <div className="font-black text-xs flex items-center space-x-1.5">
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-black ${
                      currentSignal.direction === 'BUY'
                        ? 'bg-[#00e676]/20 text-[#00e676] border border-[#00e676]'
                        : 'bg-[#ff3b57]/20 text-[#ff3b57] border border-[#ff3b57]'
                    }`}
                  >
                    {currentSignal.direction === 'BUY' ? 'STRONG BUY (LONG)' : 'STRONG SELL (SHORT)'}
                  </span>
                  <span className="text-[#f5a623] text-[10px] font-bold">
                    {currentSignal.confidenceScore}% AI CONFLUENCE
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopySignal}
                className="p-1.5 bg-[#172233] hover:bg-[#20314a] text-zinc-300 hover:text-white border border-[#2b3c55] text-[9px] font-mono font-bold flex items-center space-x-1 cursor-pointer"
                title="Copy MT4/MT5 Trade Order"
              >
                {copiedSignal ? <Check className="w-3 h-3 text-[#00e676]" /> : <Copy className="w-3 h-3 text-[#f5a623]" />}
                <span>{copiedSignal ? 'COPIED' : 'MT4/MT5'}</span>
              </button>
            </div>
          </div>

          {/* Signal Exact Key Levels: Entry, SL, TP1, TP2, TP3 */}
          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
            <div className="bg-[#0b1018] p-1 border border-[#1b2536]">
              <div className="text-zinc-400 text-[8px] uppercase">ENTRY ZONE</div>
              <div className="font-black text-white mt-0.5">{currentSignal.entryPrice}</div>
            </div>

            <div className="bg-[#240a10] p-1 border border-[#ff3b57]/60">
              <div className="text-[#ff3b57] text-[8px] uppercase font-bold">STOP LOSS</div>
              <div className="font-black text-[#ff3b57] mt-0.5">{currentSignal.stopLoss}</div>
              <div className="text-[8px] text-zinc-400">-{currentSignal.stopLossPips}p</div>
            </div>

            <div className="bg-[#042116] p-1 border border-[#00e676]/60">
              <div className="text-[#00e676] text-[8px] uppercase font-bold">TP 1 (1:1)</div>
              <div className="font-black text-[#00e676] mt-0.5">{currentSignal.takeProfit1}</div>
              <div className="text-[8px] text-zinc-400">+{currentSignal.tp1Pips}p</div>
            </div>

            <div className="bg-[#05281b] p-1 border border-[#00e676]">
              <div className="text-[#00e676] text-[8px] uppercase font-bold">TP 2 (1:2)</div>
              <div className="font-black text-[#00e676] mt-0.5">{currentSignal.takeProfit2}</div>
              <div className="text-[8px] text-zinc-400">+{currentSignal.tp2Pips}p</div>
            </div>
          </div>

          {/* Strategy Rationale */}
          <div className="text-[9px] font-mono text-zinc-300 bg-[#090e17] p-1.5 border border-[#172336] flex items-center justify-between">
            <span className="text-[#f5a623] font-bold">STRATEGY:</span>
            <span className="truncate ml-1 text-zinc-200">{currentSignal.strategyUsed}</span>
          </div>

          {/* Scanner Buttons */}
          <div className="flex items-center space-x-1.5 pt-0.5">
            <button
              onClick={() => onTriggerScan?.(selectedPair, currentTimeframe)}
              disabled={isScanning}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-[#172233] to-[#202f47] hover:from-[#202f47] hover:to-[#2c3f5e] text-white border border-[#2a3c57] text-[10px] font-bold font-mono tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all shadow-md"
              title="Run Real-Time AI Radar Scan"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00e676] ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'SCANNING CHART...' : 'SCAN RADAR (AI)'}</span>
            </button>

            {onOpenSignalModal && (
              <button
                onClick={onOpenSignalModal}
                className="py-1.5 px-3 bg-[#f5a623] hover:bg-[#ffb43a] text-black text-[10px] font-black font-mono tracking-wider flex items-center space-x-1 cursor-pointer active:scale-95 shadow-sm"
                title="Open Detailed Signal Card"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>SIGNAL CARD</span>
              </button>
            )}
          </div>
        </div>

        {/* FOREX RISK & LOT SIZE CALCULATOR STRIP */}
        <div className="bg-[#101724] border border-[#1e2a3c] p-1.5 space-y-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase">
            <span className="text-[#f5a623] font-bold flex items-center space-x-1">
              <DollarSign className="w-3 h-3" />
              <span>FOREX LOT SIZE & RISK</span>
            </span>
            <span className="text-zinc-300 font-bold">
              LOT: <span className="text-[#00e676]">{recommendedLotSize} LOTS</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[10px] font-mono">
            {/* Risk % selector */}
            <div className="flex-1 flex items-center space-x-0.5 bg-[#0b1018] p-1 border border-[#192436]">
              <span className="text-zinc-500 text-[8px] mr-1">RISK:</span>
              {[1, 1.5, 2, 3].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskPercent(r)}
                  className={`px-1.5 py-0.5 text-[9px] font-bold cursor-pointer ${
                    riskPercent === r
                      ? 'bg-[#f5a623] text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>

            {/* Max Risk $ & TP Reward $ */}
            <div className="flex-1 bg-[#0b1018] p-1 border border-[#192436] flex items-center justify-between text-[9px]">
              <span className="text-[#ff3b57] font-bold">
                -${Math.round(accountBalance * (riskPercent / 100))}
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-[#00e676] font-bold">
                +${Math.round(accountBalance * (riskPercent / 100) * 2)}
              </span>
            </div>
          </div>
        </div>

        {/* CLASSIC ACTION BUTTONS (BUY, NEON TORCH, SELL) */}
        <div className="my-1">
          <div className="flex items-center justify-between space-x-2">
            {/* LEFT BUTTON: EXECUTE BUY (LONG) */}
            <div className="flex-1">
              <button
                onClick={() => handleExecuteTrade('BUY')}
                className="w-full py-2.5 px-2 rounded-none font-black text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center space-x-1.5 border-2 bg-gradient-to-b from-[#00e676]/25 to-[#00e676]/10 hover:from-[#00e676]/40 hover:to-[#00e676]/20 text-[#00e676] border-[#00e676]/80 shadow-[0_0_12px_rgba(0,230,118,0.3)] active:scale-95"
              >
                <ArrowUp className="w-4 h-4 stroke-[3]" />
                <span>BUY (LONG)</span>
              </button>
            </div>

            {/* CENTER BUTTON: NEON TORCH (Active Positions Toggle) */}
            <div className="flex flex-col items-center justify-center px-1">
              <button
                onClick={() => {
                  soundController.playTorchSwitch();
                  setActiveDeckTab((prev) => (prev === 'positions' ? 'signal' : 'positions'));
                }}
                className={`relative group p-2.5 rounded-full border-2 transition-all cursor-pointer ${
                  activeDeckTab === 'positions'
                    ? 'border-[#00e676] bg-[#00e676]/20 text-[#00e676] shadow-[0_0_20px_rgba(0,230,118,0.6)]'
                    : 'border-[#f5a623] bg-gradient-to-br from-[#1a2638] via-[#0f1724] to-[#0a0e17] text-[#f5a623] hover:text-white shadow-[0_0_16px_rgba(245,166,35,0.45)]'
                }`}
                title={`Active Positions: ${openTradesCount} — Click to View Orders`}
              >
                {openTradesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00e676] text-black text-[9px] font-black flex items-center justify-center shadow-md">
                    {openTradesCount}
                  </span>
                )}
                <Flame className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* RIGHT BUTTON: EXECUTE SELL (SHORT) */}
            <div className="flex-1">
              <button
                onClick={() => handleExecuteTrade('SELL')}
                className="w-full py-2.5 px-2 rounded-none font-black text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center space-x-1.5 border-2 bg-gradient-to-b from-[#ff3b57]/25 to-[#ff3b57]/10 hover:from-[#ff3b57]/40 hover:to-[#ff3b57]/20 text-[#ff3b57] border-[#ff3b57]/80 shadow-[0_0_12px_rgba(255,59,87,0.3)] active:scale-95"
              >
                <ArrowDown className="w-4 h-4 stroke-[3]" />
                <span>SELL (SHORT)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE LIVE FOREX POSITIONS TRACKER */}
        {activeDeckTab === 'positions' && (
          <div className="bg-[#0b1018] border border-[#1e2a3c] p-2 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#182333] pb-1">
              <span className="text-[#f5a623] font-bold flex items-center space-x-1">
                <Target className="w-3.5 h-3.5" />
                <span>ACTIVE FOREX POSITIONS ({openTradesCount})</span>
              </span>
              <span
                className={`font-black ${
                  totalOpenPnl >= 0 ? 'text-[#00e676]' : 'text-[#ff3b57]'
                }`}
              >
                P/L: {totalOpenPnl >= 0 ? '+' : ''}${totalOpenPnl.toFixed(2)}
              </span>
            </div>

            {activeTrades.filter((t) => t.status !== 'CLOSED').length === 0 ? (
              <div className="py-3 text-center text-zinc-500 text-[10px] font-mono">
                No active orders. Click BUY or SELL above to execute a live trade.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {activeTrades
                  .filter((t) => t.status !== 'CLOSED')
                  .map((trade) => (
                    <div
                      key={trade.id}
                      className={`p-1.5 border text-[10px] font-mono flex flex-col space-y-1 ${
                        trade.pnl >= 0
                          ? 'bg-[#031d13] border-[#00e676]/60'
                          : 'bg-[#23090e] border-[#ff3b57]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black flex items-center space-x-1">
                          <span
                            className={
                              trade.direction === 'BUY' ? 'text-[#00e676]' : 'text-[#ff3b57]'
                            }
                          >
                            {trade.direction}
                          </span>
                          <span className="text-white">{trade.symbol}</span>
                          <span className="text-zinc-400">({trade.lotSize}L)</span>
                        </span>

                        <span
                          className={`font-black text-xs ${
                            trade.pnl >= 0 ? 'text-[#00e676]' : 'text-[#ff3b57]'
                          }`}
                        >
                          {trade.pips >= 0 ? `+${trade.pips} pips` : `${trade.pips} pips`} (
                          {trade.pnl >= 0 ? `+$${trade.pnl}` : `-$${Math.abs(trade.pnl)}`})
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-zinc-400">
                        <span>Entry: {trade.entryPrice}</span>
                        <span>Now: {trade.currentPrice}</span>
                        <span>SL: {trade.stopLoss}</span>
                        <span>TP: {trade.takeProfit1}</span>
                      </div>

                      <div className="pt-0.5 flex justify-end">
                        <button
                          onClick={() => handleClosePosition(trade.id)}
                          className="px-2 py-0.5 bg-[#182333] hover:bg-[#25354c] text-white border border-[#2c3e58] text-[9px] font-bold cursor-pointer"
                        >
                          Close / Lock Profit
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
