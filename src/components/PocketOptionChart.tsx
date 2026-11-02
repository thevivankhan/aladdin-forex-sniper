import React, { useState, useEffect, useRef } from 'react';
import { Candle } from '../types';
import { soundController } from '../utils/audio';
import {
  TrendingUp,
  Clock,
  ChevronDown,
  Gift,
  Wallet,
  User,
  SlidersHorizontal,
  Compass,
  Users,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';

interface PocketOptionChartProps {
  currentAsset: string;
  onChangeAsset: (asset: string) => void;
  payout: number;
  brokerLink?: string;
  nextStake?: number;
  onRecordTrade?: (result: 'WIN' | 'LOSS', stake: number, payout: number) => void;
  onSwitchToTradingView?: () => void;
  activeTrade?: {
    stake: number;
    direction: 'BUY' | 'SELL';
    entryPrice: number;
    remainingSeconds: number;
  } | null;
}

export const ASSET_LIST = [
  { name: 'OMR/CNY OTC', payout: 92, basePrice: 17.95864, flag: '🇨🇳' },
  { name: 'AUD/USD OTC', payout: 92, basePrice: 0.65824, flag: '🇦🇺' },
  { name: 'AUD/CAD OTC', payout: 92, basePrice: 0.90452, flag: '🇨🇦' },
  { name: 'CAD/CHF OTC', payout: 92, basePrice: 0.63801, flag: '🇨🇭' },
  { name: 'EUR/RUB OTC', payout: 92, basePrice: 104.251, flag: '🇷🇺' },
  { name: 'USD/SGD OTC', payout: 80, basePrice: 1.34105, flag: '🇸🇬' },
  { name: 'EUR/USD OTC', payout: 92, basePrice: 1.08420, flag: '🇪🇺' },
];

export const PocketOptionChart: React.FC<PocketOptionChartProps> = ({
  currentAsset,
  onChangeAsset,
  payout,
  brokerLink = 'https://pocket-friends.co/r/mphdnyllo5',
  nextStake = 1.10,
  onRecordTrade,
  onSwitchToTradingView,
  activeTrade: externalActiveTrade,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(17.95864);
  const [expirySeconds, setExpirySeconds] = useState<number>(46);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [bullSentiment, setBullSentiment] = useState<number>(48);
  const [isOrderPanelCollapsed, setIsOrderPanelCollapsed] = useState(false);

  // Local chart trade state
  const [localActiveTrade, setLocalActiveTrade] = useState<{
    direction: 'BUY' | 'SELL';
    stake: number;
    payout: number;
    remainingSeconds: number;
  } | null>(null);
  const [tradeDuration, setTradeDuration] = useState<number>(30);
  const [customStake, setCustomStake] = useState<number>(nextStake);

  useEffect(() => {
    setCustomStake(nextStake);
  }, [nextStake]);

  const activeTrade = externalActiveTrade || (localActiveTrade ? {
    stake: localActiveTrade.stake,
    direction: localActiveTrade.direction,
    entryPrice: currentPrice,
    remainingSeconds: localActiveTrade.remainingSeconds,
  } : null);

  const selectedAsset = ASSET_LIST.find((a) => a.name === currentAsset) || ASSET_LIST[0];

  // Initialize initial candles
  useEffect(() => {
    let price = selectedAsset.basePrice;
    const initialCandles: Candle[] = [];
    const now = Math.floor(Date.now() / 1000);

    for (let i = 50; i >= 0; i--) {
      const open = price;
      const delta = (Math.random() - 0.49) * (selectedAsset.basePrice * 0.0006);
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * (selectedAsset.basePrice * 0.0003);
      const low = Math.min(open, close) - Math.random() * (selectedAsset.basePrice * 0.0003);
      initialCandles.push({
        time: now - i * 5,
        open,
        high,
        low,
        close,
      });
      price = close;
    }

    setCandles(initialCandles);
    setCurrentPrice(price);
  }, [currentAsset, selectedAsset.basePrice]);

  // Real-time tick generator & sentiment shifts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const delta = (Math.random() - 0.492) * (selectedAsset.basePrice * 0.00025);
        const nextPrice = Number((prev + delta).toFixed(5));

        setCandles((oldCandles) => {
          if (oldCandles.length === 0) return oldCandles;
          const lastCandle = oldCandles[oldCandles.length - 1];
          const updatedLast = {
            ...lastCandle,
            high: Math.max(lastCandle.high, nextPrice),
            low: Math.min(lastCandle.low, nextPrice),
            close: nextPrice,
          };
          return [...oldCandles.slice(0, -1), updatedLast];
        });

        return nextPrice;
      });

      setExpirySeconds((sec) => (sec <= 1 ? 59 : sec - 1));

      // Gentle sentiment jitter
      if (Math.random() > 0.6) {
        setBullSentiment((b) => Math.max(35, Math.min(65, b + (Math.random() > 0.5 ? 1 : -1))));
      }
    }, 600);

    return () => clearInterval(interval);
  }, [selectedAsset.basePrice]);

  // Periodic new candle append every 6 seconds
  useEffect(() => {
    const candleInterval = setInterval(() => {
      setCandles((old) => {
        if (old.length === 0) return old;
        const last = old[old.length - 1];
        const newCandle: Candle = {
          time: Math.floor(Date.now() / 1000),
          open: last.close,
          high: last.close,
          low: last.close,
          close: last.close,
        };
        return [...old.slice(1), newCandle];
      });
    }, 6000);

    return () => clearInterval(candleInterval);
  }, []);

  // Handle high-dpi canvas resize & render
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Deep high-tech Pocket Option background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0c121c');
    bgGrad.addColorStop(0.4, '#090e17');
    bgGrad.addColorStop(0.8, '#060a10');
    bgGrad.addColorStop(1, '#04060a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Authentic Mountain Silhouette Backdrop (Signature Pocket Option styling)
    ctx.fillStyle = 'rgba(15, 23, 38, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.45);
    ctx.lineTo(width * 0.15, height * 0.35);
    ctx.lineTo(width * 0.32, height * 0.55);
    ctx.lineTo(width * 0.48, height * 0.28);
    ctx.lineTo(width * 0.65, height * 0.5);
    ctx.lineTo(width * 0.82, height * 0.32);
    ctx.lineTo(width, height * 0.42);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Subtle grid lines with coordinate timestamps
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 60; x < width; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 30; y < height; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (candles.length === 0) return;

    // Price scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    candles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    const padding = (maxPrice - minPrice) * 0.18 || 0.001;
    minPrice -= padding;
    maxPrice += padding;
    const priceRange = maxPrice - minPrice || 1;

    const getY = (val: number) => height - ((val - minPrice) / priceRange) * height;

    // Moving Average Line (20-period EMA / SMA line in gold neon)
    ctx.strokeStyle = 'rgba(245, 166, 35, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const candleWidth = Math.max(5, Math.floor((width - 100) / candles.length) - 3);

    let smaSum = 0;
    const period = 7;
    candles.forEach((c, idx) => {
      smaSum += c.close;
      if (idx >= period) smaSum -= candles[idx - period].close;
      const sma = idx >= period ? smaSum / period : c.close;
      const x = idx * (candleWidth + 3) + 20 + candleWidth / 2;
      const y = getY(sma);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Candlesticks with neon glow
    candles.forEach((c, idx) => {
      const x = idx * (candleWidth + 3) + 20;
      const isBull = c.close >= c.open;
      const color = isBull ? '#00e676' : '#ff3b57';
      const glow = isBull ? 'rgba(0, 230, 118, 0.35)' : 'rgba(255, 59, 87, 0.35)';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, getY(c.high));
      ctx.lineTo(x + candleWidth / 2, getY(c.low));
      ctx.stroke();

      // Body with crisp corners
      ctx.fillStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 6;
      const bodyTop = Math.min(getY(c.open), getY(c.close));
      const bodyHeight = Math.max(2, Math.abs(getY(c.close) - getY(c.open)));
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
      ctx.shadowBlur = 0;
    });

    // Current Price Pulsating Horizontal Line
    const currentY = getY(currentPrice);
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(width - 85, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing Pulse Beacon at Latest Price
    const latestX = (candles.length - 1) * (candleWidth + 3) + 20 + candleWidth / 2;
    ctx.fillStyle = '#00e676';
    ctx.beginPath();
    ctx.arc(latestX, currentY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pulse ring
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(latestX, currentY, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Right-Axis Current Price Tag
    ctx.fillStyle = '#1b64da';
    ctx.fillRect(width - 82, currentY - 11, 78, 22);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrice.toFixed(5), width - 43, currentY + 4);
    ctx.textAlign = 'left';

    // Active Trade Line & Profit Flag
    if (activeTrade) {
      const strikeY = getY(activeTrade.entryPrice);
      ctx.strokeStyle = '#f5a623';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, strikeY);
      ctx.lineTo(width - 85, strikeY);
      ctx.stroke();

      // Glowing profit bubble
      ctx.fillStyle = '#00e676';
      ctx.shadowColor = 'rgba(0, 230, 118, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillRect(width - 170, strikeY - 12, 80, 24);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(
        `+$${(activeTrade.stake * (payout / 100)).toFixed(2)} ✓`,
        width - 162,
        strikeY + 4
      );
    }
  }, [candles, currentPrice, activeTrade, payout]);

  // Local trade timer
  useEffect(() => {
    if (!localActiveTrade) return;
    if (localActiveTrade.remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setLocalActiveTrade((prev) => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          clearInterval(timer);
          return { ...prev, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [localActiveTrade]);

  const handleStartTrade = (direction: 'BUY' | 'SELL') => {
    soundController.playTradeClick();
    setLocalActiveTrade({
      direction,
      stake: customStake,
      payout,
      remainingSeconds: tradeDuration,
    });
  };

  const handleTradeOutcome = (outcome: 'WIN' | 'LOSS') => {
    if (onRecordTrade) {
      onRecordTrade(outcome, customStake, payout);
    }
    setLocalActiveTrade(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col bg-[#070b12] select-none overflow-hidden"
    >
      {/* Top Pocket Option Broker Bar */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-2 bg-[#0c121d] border-b border-[#182335] z-10 text-white gap-1 sm:gap-3 flex-wrap sm:flex-nowrap">
        {/* Left: User Avatar, Demo Balance, Deposit & Pocket Option Link */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-[#1b3a2a] border border-[#00e676]/60 flex items-center justify-center text-[#00e676]">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <a
              href={brokerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-none bg-[#162132] border border-[#23334c] text-cyan-400 hover:text-white cursor-pointer transition-colors"
              title="Open Pocket Option Bonuses"
            >
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>

          <div className="flex items-center space-x-1 bg-[#121a28] border border-[#1e2d42] px-2 sm:px-3 py-1 rounded-none cursor-pointer">
            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">Demo</span>
            <span className="text-xs font-mono font-bold text-white">$50,000</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>

          <a
            href={brokerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1 bg-[#00e676] hover:bg-[#05f57f] text-black font-extrabold text-[11px] sm:text-xs rounded-none shadow-[0_0_12px_rgba(0,230,118,0.4)] cursor-pointer no-underline transition-all"
            title="Deposit or Open Live Pocket Option"
          >
            <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Deposit</span>
          </a>
        </div>

        {/* Center: Live Asset Picker */}
        <div className="relative">
          <button
            onClick={() => setShowAssetDropdown(!showAssetDropdown)}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 bg-[#131d2c] border border-[#23334a] hover:border-[#f5a623] text-white font-bold text-[11px] sm:text-xs rounded-none transition-colors cursor-pointer shadow-sm"
          >
            <span className="text-sm sm:text-base">{selectedAsset.flag}</span>
            <span className="truncate max-w-[90px] sm:max-w-none">{selectedAsset.name}</span>
            <span className="text-[10px] font-mono text-[#00e676]">+{selectedAsset.payout}%</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showAssetDropdown && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-56 bg-[#101724] border-2 border-[#223249] shadow-2xl py-1 z-30 rounded-none animate-in fade-in">
              {ASSET_LIST.map((a) => (
                <button
                  key={a.name}
                  onClick={() => {
                    onChangeAsset(a.name);
                    setShowAssetDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-[#182336] transition-colors cursor-pointer ${
                    currentAsset === a.name
                      ? 'text-[#f5a623] font-bold bg-[#182336]'
                      : 'text-zinc-200'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{a.flag}</span>
                    <span>{a.name}</span>
                  </span>
                  <span className="font-mono text-[#00e676] font-bold">+{a.payout}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: TradingView Switcher & Expiration Countdown */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-mono">
          {onSwitchToTradingView && (
            <button
              onClick={onSwitchToTradingView}
              className="flex items-center space-x-1 px-2.5 py-1 bg-[#162335] hover:bg-[#20324c] border border-[#00e676]/60 text-[#00e676] font-bold text-xs rounded-none transition-all cursor-pointer shadow-[0_0_8px_rgba(0,230,118,0.25)]"
              title="Switch to Real Live TradingView Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>TradingView Live ↗</span>
            </button>
          )}

          <div className="hidden md:flex items-center space-x-1 text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>M1 00:{String(expirySeconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Main Candlestick Chart Area + Right Order Panel */}
      <div className="relative flex-1 w-full h-full flex overflow-hidden">
        <div className="relative flex-1 w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Active Trade Banner Overlay on Chart */}
          {localActiveTrade && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#0c121e]/95 border-2 border-[#f5a623] px-3.5 py-2 shadow-[0_0_24px_rgba(245,166,35,0.45)] text-center animate-in fade-in flex items-center space-x-3">
              <div>
                <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                  CHART TRADE RUNNING
                </div>
                <div className="text-xs font-mono font-black text-white flex items-center space-x-2">
                  <span className={localActiveTrade.direction === 'BUY' ? 'text-[#00e676]' : 'text-[#ff3b57]'}>
                    {localActiveTrade.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
                  </span>
                  <span className="text-[#f5a623]">${localActiveTrade.stake.toFixed(2)}</span>
                  <span className="text-cyan-400">{localActiveTrade.remainingSeconds}s left</span>
                </div>
              </div>

              <div className="flex items-center space-x-1 pl-2 border-l border-zinc-700">
                <button
                  onClick={() => handleTradeOutcome('WIN')}
                  className="px-2 py-1 bg-[#00e676] hover:bg-[#05f57f] text-black font-black text-[11px] rounded-none cursor-pointer"
                >
                  WIN
                </button>
                <button
                  onClick={() => handleTradeOutcome('LOSS')}
                  className="px-2 py-1 bg-[#ff3b57] hover:bg-[#ff526d] text-white font-black text-[11px] rounded-none cursor-pointer"
                >
                  LOSS
                </button>
              </div>
            </div>
          )}

          {/* Sentiment Meter (Bottom Left) */}
          <div className="absolute bottom-12 left-3 sm:left-4 w-36 sm:w-56 z-10 select-none bg-black/60 p-1.5 sm:p-2 border border-[#1f2c40] rounded-none backdrop-blur-sm">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold mb-1">
              <span className="text-[#00e676]">{bullSentiment}% BUY</span>
              <span className="text-[#ff3b57]">{100 - bullSentiment}% SELL</span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-zinc-800 flex overflow-hidden">
              <div
                className="bg-[#00e676] transition-all duration-500 shadow-[0_0_8px_rgba(0,230,118,0.5)]"
                style={{ width: `${bullSentiment}%` }}
              />
              <div
                className="bg-[#ff3b57] transition-all duration-500 shadow-[0_0_8px_rgba(255,59,87,0.5)]"
                style={{ width: `${100 - bullSentiment}%` }}
              />
            </div>
          </div>

          {/* Bottom Pocket Option Navigation Tabs */}
          <div className="absolute bottom-0 left-0 right-0 h-9 sm:h-10 bg-[#0a0f18] border-t border-[#182335] flex items-center justify-around text-zinc-400 text-[11px] sm:text-xs z-10 px-1">
            <div className="flex items-center space-x-1 text-[#00e676] font-semibold cursor-pointer">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trades</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 hover:text-white cursor-pointer">
              <Compass className="w-3.5 h-3.5" />
              <span>Signals</span>
            </div>
            <a
              href={brokerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-[#f5a623] hover:text-[#ffc107] font-bold cursor-pointer no-underline"
              title="Launch Pocket Option"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pocket Option Live ↗</span>
            </a>
          </div>
        </div>

        {/* Right Side: Binary Option Order Execution Panel (BUY / SELL on Chart) */}
        <div
          className={`${
            isOrderPanelCollapsed ? 'w-9' : 'w-52 sm:w-60'
          } bg-[#0c121d] border-l border-[#1a2537] flex flex-col z-20 transition-all duration-200 select-none`}
        >
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#1a2537] bg-[#090e17]">
            {!isOrderPanelCollapsed && (
              <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-300 uppercase">
                DEMO TRADING
              </span>
            )}
            <button
              onClick={() => setIsOrderPanelCollapsed(!isOrderPanelCollapsed)}
              className="p-1 text-zinc-400 hover:text-white rounded-none ml-auto cursor-pointer"
              title={isOrderPanelCollapsed ? 'Expand Order Panel' : 'Collapse Order Panel'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#f5a623]" />
            </button>
          </div>

          {!isOrderPanelCollapsed && (
            <div className="p-2.5 flex flex-col justify-between h-full space-y-2.5 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase mb-1">
                  <span>AMOUNT / STAKE</span>
                  <span className="text-[#f5a623] font-bold">SniperCORE</span>
                </div>
                <div className="flex items-center bg-[#131d2c] border border-[#253750] px-2 py-1.5">
                  <span className="text-[#f5a623] font-mono font-bold text-xs mr-1">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={customStake}
                    onChange={(e) => setCustomStake(parseFloat(e.target.value) || 1)}
                    className="w-full bg-transparent font-mono font-black text-xs text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 mt-1 text-[9px] font-mono">
                  <button
                    onClick={() => setCustomStake((s) => Math.max(1, Number((s - 1).toFixed(2))))}
                    className="py-1 bg-[#152030] text-zinc-300 font-bold border border-[#223348] cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => setCustomStake((s) => Number((s + 1).toFixed(2)))}
                    className="py-1 bg-[#152030] text-zinc-300 font-bold border border-[#223348] cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => setCustomStake((s) => Number((s + 5).toFixed(2)))}
                    className="py-1 bg-[#152030] text-zinc-300 font-bold border border-[#223348] cursor-pointer"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => setCustomStake(nextStake)}
                    className="py-1 bg-[#1b2b3f] text-[#f5a623] font-bold border border-[#f5a623]/40 cursor-pointer"
                  >
                    SYNC
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase mb-1">
                  <span>TIME</span>
                  <span className="text-amber-400 font-bold">{tradeDuration}s</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
                  {[5, 15, 30, 60].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setTradeDuration(sec)}
                      className={`py-1 border font-bold cursor-pointer transition-colors ${
                        tradeDuration === sec
                          ? 'bg-[#1e2a3c] border-[#f5a623] text-[#f5a623]'
                          : 'bg-[#131d2c] border-[#223348] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {sec < 60 ? `${sec}s` : '1m'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#101824] border border-[#1f2d42] p-2 text-xs font-mono space-y-0.5">
                <div className="flex items-center justify-between text-zinc-400 text-[9px]">
                  <span>PAYOUT</span>
                  <span className="text-[#00e676] font-bold">+{payout}%</span>
                </div>
                <div className="flex items-center justify-between text-white font-bold text-xs pt-0.5 border-t border-[#1a2638]">
                  <span>PROFIT</span>
                  <span className="text-[#00e676] font-black">+${(customStake * (payout / 100)).toFixed(2)}</span>
                </div>
              </div>

              {/* ON-CHART BUY & SELL */}
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => handleStartTrade('BUY')}
                  disabled={localActiveTrade !== null && localActiveTrade.remainingSeconds > 0}
                  className="w-full py-3 px-2 bg-gradient-to-b from-[#00e676] to-[#00b05b] hover:from-[#05f57f] hover:to-[#00c868] text-black font-black text-xs sm:text-sm tracking-wider uppercase rounded-none shadow-[0_0_14px_rgba(0,230,118,0.4)] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5 transition-all"
                >
                  <ArrowUp className="w-4 h-4 stroke-[3]" />
                  <span>BUY (CALL)</span>
                </button>

                <button
                  onClick={() => handleStartTrade('SELL')}
                  disabled={localActiveTrade !== null && localActiveTrade.remainingSeconds > 0}
                  className="w-full py-3 px-2 bg-gradient-to-b from-[#ff3b57] to-[#d6203c] hover:from-[#ff526d] hover:to-[#eb2845] text-white font-black text-xs sm:text-sm tracking-wider uppercase rounded-none shadow-[0_0_14px_rgba(255,59,87,0.4)] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5 transition-all"
                >
                  <ArrowDown className="w-4 h-4 stroke-[3]" />
                  <span>SELL (PUT)</span>
                </button>
              </div>

              <div className="text-[9px] text-zinc-500 font-mono text-center">
                Record WIN / LOSS on Trade Manager.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
