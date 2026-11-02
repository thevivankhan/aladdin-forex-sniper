import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Zap, Radio } from 'lucide-react';


import { ForexSignal, MarketTimeframe } from '../utils/forexScanner';
import { RadarHudOverlay } from './RadarHudOverlay';


interface TradingViewChartProps {
  currentSymbol?: string;
  activeSignal?: ForexSignal | null;
  isScanning?: boolean;
  onOpenSignalModal?: () => void;
  currentTimeframe?: MarketTimeframe;
}

const tvIntervalMap: Record<MarketTimeframe, string> = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '30m': '30',
  '1h': '60',
  '4h': '240',
  '1D': 'D',
  '1W': 'W',
  '1M': 'M',
};

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  currentSymbol = 'FX:EURUSD',
  activeSignal,
  isScanning = false,
  onOpenSignalModal,
  currentTimeframe = '5m',
}) => {
  const containerId = useRef(`tv_chart_${Math.random().toString(36).substring(2, 9)}`);
  
  // State for side drawing tools collapse/expand
  const [isSideToolbarOpen, setIsSideToolbarOpen] = useState<boolean>(true);

  // Initialize 100% Real TradingView Widget
  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initWidget = () => {
      // @ts-expect-error TradingView is injected globally by tv.js
      if (typeof window.TradingView !== 'undefined' && document.getElementById(containerId.current)) {
        const container = document.getElementById(containerId.current);
        if (container) container.innerHTML = '';

        // @ts-expect-error TradingView is injected globally
        new window.TradingView.widget({
          autosize: true,
          symbol: currentSymbol,
          interval: tvIntervalMap[currentTimeframe] || '5',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0a0e17',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerId.current,
          backgroundColor: '#070b12',
          gridColor: 'rgba(255, 255, 255, 0.05)',
          hide_side_toolbar: !isSideToolbarOpen, // Controls left drawing toolbar visibility
          allow_symbol_change: true,
          withdateranges: false, // Disables bottom date range & UTC timezone bar
          details: false,
          hotlist: false,
          calendar: false,
          studies: ['Moving Average Exponential@tv-basicstudies'],
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      initWidget();
    }
  }, [currentSymbol, isSideToolbarOpen, currentTimeframe]);

  return (
    <div className="relative w-full h-full bg-[#070b12] select-none overflow-hidden">
      {/* Real TradingView Canvas */}
      <div id={containerId.current} className="w-full h-full bg-[#070b12]" />



      {/* 
        Ultra-compact mini toggle arrow for TradingView Drawing Tools.
        Positioned higher up at bottom: 120px (well away from the TradingView bottom logo to prevent accidental clicks/redirects).
      */}
      <button
        onClick={() => setIsSideToolbarOpen((prev) => !prev)}
        className="absolute z-30 flex items-center justify-center w-[10px] h-[22px] bg-[#131722]/90 hover:bg-[#1e222d] text-zinc-400 hover:text-white border-y border-r border-[#2a2e39] cursor-pointer transition-all duration-150 rounded-r-xs shadow-sm group"
        style={{
          bottom: '120px',
          left: isSideToolbarOpen ? '46px' : '-2px',
        }}
        title={isSideToolbarOpen ? 'Hide Drawing Tools' : 'Show Drawing Tools'}
      >
        {isSideToolbarOpen ? (
          <ChevronLeft className="w-2.5 h-2.5 text-zinc-400 group-hover:text-white transition-transform" />
        ) : (
          <ChevronRight className="w-2.5 h-2.5 text-[#00e676] group-hover:text-white transition-transform" />
        )}
      </button>

      {/* 
        Mask for TradingView Text only (NO double icons):
        Leaves the original TradingView logo icon visible while cleanly masking only the written word "TradingView"
      */}
      <div
        className="absolute z-10 pointer-events-none bg-[#070b12]"
        style={{
          bottom: '2px',
          left: isSideToolbarOpen ? '84px' : '32px',
          width: '95px',
          height: '24px',
        }}
      />

      {/* 
        Mask for Bottom UTC Time / Timezone Label:
        Keeps bottom cleanly masked so UTC time doesn't consume screen space
      */}
      <div
        className="absolute z-10 pointer-events-none bg-[#070b12]"
        style={{
          bottom: '0px',
          right: '50px',
          width: '100px',
          height: '24px',
        }}
      />



      {/* 
        Aladdin Forex Sniper Live Signals Bottom Scrolling Ticker Bar:
        Touches the absolute bottom edge of the screen with smooth continuous right-to-left scrolling live signals
      */}
      <div className="absolute bottom-0 inset-x-0 z-30 flex items-center h-7 sm:h-7.5 bg-[#0a0e16]/98 backdrop-blur-md border-t border-[#1e2a3c] shadow-[0_-4px_16px_rgba(0,0,0,0.8)] overflow-hidden select-none font-mono text-[10px]">
        {/* Pinned Left Radar Badge */}
        <div className="flex-shrink-0 z-10 flex items-center space-x-1.5 bg-[#0e1422] px-2 sm:px-2.5 h-full border-r border-[#1e2a3c]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]" />
          </span>
          <span className="font-black uppercase tracking-wider text-[#f5a623] font-['Chakra_Petch',sans-serif] whitespace-nowrap hidden xs:inline">
            ALADDIN LIVE SIGNALS
          </span>
          <span className="font-black uppercase tracking-wider text-[#f5a623] font-['Chakra_Petch',sans-serif] whitespace-nowrap xs:hidden">
            SIGNALS
          </span>
        </div>

        {/* Scrolling Right-to-Left Live Signals Track */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          <div className="animate-ticker items-center py-0.5">
            {[
              activeSignal
                ? {
                    symbol: activeSignal.symbol,
                    direction: activeSignal.direction,
                    entryPrice: activeSignal.entryPrice,
                    tp: activeSignal.takeProfit1,
                    sl: activeSignal.stopLoss,
                    pips: activeSignal.tp1Pips,
                    conf: activeSignal.confidenceScore,
                    isHot: true,
                  }
                : {
                    symbol: 'EUR/USD',
                    direction: 'BUY',
                    entryPrice: 1.1166,
                    tp: 1.1216,
                    sl: 1.1141,
                    pips: 50,
                    conf: 96,
                    isHot: true,
                  },
              { symbol: 'XAU/USD (GOLD)', direction: 'BUY', entryPrice: 3898.90, tp: 3943.90, sl: 3875.00, pips: 450, conf: 97, isHot: true },
              { symbol: 'GBP/USD', direction: 'SELL', entryPrice: 1.3393, tp: 1.3343, sl: 1.3418, pips: 50, conf: 94, isHot: false },
              { symbol: 'BTC/USDT', direction: 'BUY', entryPrice: 77850.00, tp: 78900.00, sl: 77200.00, pips: 1050, conf: 98, isHot: true },
              { symbol: 'USD/JPY', direction: 'SELL', entryPrice: 157.519, tp: 156.800, sl: 157.750, pips: 72, conf: 93, isHot: false },
              { symbol: 'SOL/USDT', direction: 'BUY', entryPrice: 94.46, tp: 98.20, sl: 93.10, pips: 37, conf: 95, isHot: false },
              { symbol: 'US500', direction: 'BUY', entryPrice: 5985.20, tp: 6025.00, sl: 5960.00, pips: 40, conf: 96, isHot: true },
              { symbol: 'AUD/USD', direction: 'BUY', entryPrice: 0.7033, tp: 0.7075, sl: 0.7010, pips: 42, conf: 92, isHot: false },
              { symbol: 'USD/CAD', direction: 'SELL', entryPrice: 1.3973, tp: 1.3920, sl: 1.3998, pips: 53, conf: 94, isHot: false },
              { symbol: 'NVDA', direction: 'BUY', entryPrice: 138.25, tp: 144.00, sl: 135.50, pips: 5.75, conf: 95, isHot: false },
              // Duplicate set for seamless continuous marquee loop
              activeSignal
                ? {
                    symbol: activeSignal.symbol,
                    direction: activeSignal.direction,
                    entryPrice: activeSignal.entryPrice,
                    tp: activeSignal.takeProfit1,
                    sl: activeSignal.stopLoss,
                    pips: activeSignal.tp1Pips,
                    conf: activeSignal.confidenceScore,
                    isHot: true,
                  }
                : {
                    symbol: 'EUR/USD',
                    direction: 'BUY',
                    entryPrice: 1.1166,
                    tp: 1.1216,
                    sl: 1.1141,
                    pips: 50,
                    conf: 96,
                    isHot: true,
                  },
              { symbol: 'XAU/USD (GOLD)', direction: 'BUY', entryPrice: 3898.90, tp: 3943.90, sl: 3875.00, pips: 450, conf: 97, isHot: true },
              { symbol: 'GBP/USD', direction: 'SELL', entryPrice: 1.3393, tp: 1.3343, sl: 1.3418, pips: 50, conf: 94, isHot: false },
              { symbol: 'BTC/USDT', direction: 'BUY', entryPrice: 77850.00, tp: 78900.00, sl: 77200.00, pips: 1050, conf: 98, isHot: true },
              { symbol: 'USD/JPY', direction: 'SELL', entryPrice: 157.519, tp: 156.800, sl: 157.750, pips: 72, conf: 93, isHot: false },
              { symbol: 'SOL/USDT', direction: 'BUY', entryPrice: 94.46, tp: 98.20, sl: 93.10, pips: 37, conf: 95, isHot: false },
              { symbol: 'US500', direction: 'BUY', entryPrice: 5985.20, tp: 6025.00, sl: 5960.00, pips: 40, conf: 96, isHot: true },
              { symbol: 'AUD/USD', direction: 'BUY', entryPrice: 0.7033, tp: 0.7075, sl: 0.7010, pips: 42, conf: 92, isHot: false },
              { symbol: 'USD/CAD', direction: 'SELL', entryPrice: 1.3973, tp: 1.3920, sl: 1.3998, pips: 53, conf: 94, isHot: false },
              { symbol: 'NVDA', direction: 'BUY', entryPrice: 138.25, tp: 144.00, sl: 135.50, pips: 5.75, conf: 95, isHot: false },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={onOpenSignalModal}
                className="flex items-center space-x-1.5 px-3 whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors"
                title="Click to view signal card"
              >
                <span className="font-bold text-white flex items-center space-x-1">
                  {item.isHot && <span className="text-[#ffd700] text-[9px]">★</span>}
                  <span>{item.symbol}</span>
                </span>

                <span
                  className={`font-black uppercase px-1 py-0.2 text-[8px] rounded-xs ${
                    item.direction === 'BUY'
                      ? 'bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/50'
                      : 'bg-[#ff3b57]/20 text-[#ff3b57] border border-[#ff3b57]/50'
                  }`}
                >
                  {item.direction}
                </span>

                <span className="text-zinc-400">@</span>
                <span className="text-white font-bold">{item.entryPrice}</span>

                <span className="text-[#00e676] font-bold">
                  TP {item.tp} (+{item.pips}p)
                </span>

                <span className="text-zinc-400 text-[9px]">
                  SL {item.sl}
                </span>

                <span className="text-[#f5a623] text-[9px] font-bold">
                  {item.conf}% AI
                </span>

                <span className="text-zinc-600 px-1">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned Right CARD Button */}
        {onOpenSignalModal && (
          <div className="flex-shrink-0 z-10 flex items-center bg-[#0e1422] px-1.5 sm:px-2 h-full border-l border-[#1e2a3c]">
            <button
              onClick={onOpenSignalModal}
              className="px-2 py-0.5 bg-[#f5a623] hover:bg-[#ffb43a] text-black font-black text-[9px] sm:text-[10px] tracking-tight uppercase cursor-pointer transition-transform active:scale-95 shadow-sm whitespace-nowrap flex items-center space-x-1"
              title="Open Full AI Signal Card"
            >
              <Zap className="w-3 h-3 fill-black" />
              <span>CARD</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

