import React, { useState } from 'react';
import { ForexSignal, formatSignalForClipboard } from '../utils/forexScanner';
import { soundController } from '../utils/audio';
import {
  X,
  Copy,
  Check,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Target,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

interface SignalCardModalProps {
  signal: ForexSignal | null;
  isOpen: boolean;
  onClose: () => void;
  onExecuteTrade?: (direction: 'BUY' | 'SELL') => void;
}

export const SignalCardModal: React.FC<SignalCardModalProps> = ({
  signal,
  isOpen,
  onClose,
  onExecuteTrade,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !signal) return null;

  const isBuy = signal.direction === 'BUY';

  const handleCopy = () => {
    const text = formatSignalForClipboard(signal);
    navigator.clipboard.writeText(text);
    soundController.playCopied();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-md bg-[#0a0f18] border-2 ${
          isBuy ? 'border-[#00e676] shadow-[0_0_35px_rgba(0,230,118,0.3)]' : 'border-[#ff3b57] shadow-[0_0_35px_rgba(255,59,87,0.3)]'
        } p-3.5 sm:p-4 text-white font-mono select-none overflow-hidden`}
      >
        {/* Top Header: Title & Close Button */}
        <div className="flex items-center justify-between border-b border-[#1b2536] pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#f5a623] to-[#e65100] rounded-[2px] flex items-center justify-center font-black text-black text-xs font-mono shadow-[0_0_10px_#f5a623]">
              A
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-white font-['Chakra_Petch',sans-serif]">
                ALADDIN AI LIVE SIGNAL
              </div>
              <div className="text-[9px] text-[#f5a623] font-bold">
                REAL-TIME CONFLUENCE SCAN
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Action Badge (BUY or SELL) */}
        <div
          className={`my-3 p-3 border-2 flex items-center justify-between ${
            isBuy
              ? 'bg-gradient-to-r from-[#032317] via-[#053221] to-[#032317] border-[#00e676] shadow-[0_0_20px_rgba(0,230,118,0.35)]'
              : 'bg-gradient-to-r from-[#2a0b12] via-[#3a0f19] to-[#2a0b12] border-[#ff3b57] shadow-[0_0_20px_rgba(255,59,87,0.35)]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-full ${
                isBuy
                  ? 'bg-[#00e676] text-black shadow-[0_0_14px_#00e676]'
                  : 'bg-[#ff3b57] text-white shadow-[0_0_14px_#ff3b57]'
              }`}
            >
              {isBuy ? <ArrowUp className="w-6 h-6 stroke-[3]" /> : <ArrowDown className="w-6 h-6 stroke-[3]" />}
            </div>

            <div>
              <div
                className={`font-black text-lg sm:text-xl tracking-wider uppercase font-['Chakra_Petch',sans-serif] ${
                  isBuy ? 'text-[#00e676]' : 'text-[#ff3b57]'
                }`}
              >
                {isBuy ? 'STRONG BUY (LONG)' : 'STRONG SELL (SHORT)'}
              </div>
              <div className="text-xs text-zinc-300 font-bold">
                {signal.symbol} • {signal.timeframe} • {signal.timeString}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-zinc-400 uppercase tracking-widest">CONFIDENCE</div>
            <div className="text-base font-black text-[#f5a623] drop-shadow-[0_0_8px_rgba(245,166,35,0.7)]">
              {signal.confidenceScore}%
            </div>
          </div>
        </div>

        {/* 2x2 Primary Trade Parameters Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Entry Price */}
          <div className="bg-[#0e1420] p-2 border border-[#1b2536]">
            <div className="text-[9px] text-zinc-400 uppercase flex items-center space-x-1">
              <Zap className="w-3 h-3 text-[#f5a623]" />
              <span>ENTRY PRICE</span>
            </div>
            <div className="font-bold text-base text-white mt-0.5">{signal.entryPrice}</div>
          </div>

          {/* Stop Loss (SL) */}
          <div className="bg-[#1f0d12] p-2 border border-[#ff3b57]/50">
            <div className="text-[9px] text-[#ff3b57] uppercase font-bold flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3 text-[#ff3b57]" />
                <span>STOP LOSS (SL)</span>
              </span>
              <span>-{signal.stopLossPips} pips</span>
            </div>
            <div className="font-bold text-base text-[#ff3b57] mt-0.5">{signal.stopLoss}</div>
          </div>

          {/* Take Profit 1 */}
          <div className="bg-[#071d14] p-2 border border-[#00e676]/50">
            <div className="text-[9px] text-[#00e676] uppercase font-bold flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-[#00e676]" />
                <span>TAKE PROFIT 1</span>
              </span>
              <span>+{signal.tp1Pips} pips</span>
            </div>
            <div className="font-bold text-sm text-[#00e676] mt-0.5">{signal.takeProfit1}</div>
          </div>

          {/* Take Profit 2 */}
          <div className="bg-[#071d14] p-2 border border-[#00e676]/50">
            <div className="text-[9px] text-[#00e676] uppercase font-bold flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-[#00e676]" />
                <span>TAKE PROFIT 2</span>
              </span>
              <span>+{signal.tp2Pips} pips</span>
            </div>
            <div className="font-bold text-sm text-[#00e676] mt-0.5">{signal.takeProfit2}</div>
          </div>
        </div>

        {/* Take Profit 3 (Runner Target) */}
        <div className="mt-2 bg-[#0e1420] px-2.5 py-1.5 border border-[#1b2536] flex items-center justify-between text-xs">
          <span className="text-zinc-400">TP 3 (Runner Target):</span>
          <span className="font-bold text-[#00e676]">{signal.takeProfit3} (+{signal.tp3Pips} pips)</span>
          <span className="text-[#f5a623] font-bold">R:R {signal.riskRewardRatio}</span>
        </div>

        {/* AI Confluence Rationale */}
        <div className="mt-2.5 bg-[#0b1018] p-2 border border-[#182333] space-y-1 text-[11px]">
          <div className="text-[9px] text-[#f5a623] font-bold uppercase tracking-wider flex items-center space-x-1">
            <Activity className="w-3 h-3 text-[#f5a623]" />
            <span>AI Market Confluence Rationale:</span>
          </div>
          {signal.reasons.map((r, i) => (
            <div key={i} className="flex items-start space-x-1.5 text-zinc-300">
              <span className="text-[#00e676] mt-0.5">✓</span>
              <span className="leading-tight">{r}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#1b2536]">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 bg-[#f5a623] hover:bg-[#ffb43a] text-black font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_16px_rgba(245,166,35,0.4)] active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY MT4/MT5</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onExecuteTrade?.(signal.direction);
              onClose();
            }}
            className={`py-2.5 px-3 font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 border-2 ${
              isBuy
                ? 'bg-[#00e676] text-black border-[#00e676] shadow-[0_0_16px_rgba(0,230,118,0.5)]'
                : 'bg-[#ff3b57] text-white border-[#ff3b57] shadow-[0_0_16px_rgba(255,59,87,0.5)]'
            }`}
          >
            <span>CONFIRM & EXECUTE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
