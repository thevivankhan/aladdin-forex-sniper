import React, { useState, useMemo } from 'react';
import { PlanConfig, Currency } from '../types';
import { calculatePlanPreview, formatCurrency } from '../utils/sniperCore';
import {
  ALL_300_OTC_ASSETS,
  OTC_FOREX_ASSETS,
  OTC_CRYPTO_ASSETS,
  OTC_STOCKS_COMMODITIES_ASSETS,
  OTCAsset,
} from '../data/otcAssets';
import {
  Minus,
  Plus,
  TrendingUp,
  Settings as SettingsIcon,
  Square,
  Minimize2,
  GripHorizontal,
  Cpu,
  Search,
  X,
  ShieldAlert,
} from 'lucide-react';

interface PlanSetupProps {
  config: PlanConfig;
  onChangeConfig: (config: PlanConfig) => void;
  onStartSession: () => void;
  onOpenSessionLog: () => void;
  onOpenSettings?: () => void;
  onMinimize?: () => void;
  onToggleExpand?: () => void;
  onCloseWidget?: () => void;
  isExpanded?: boolean;
  dragHandleProps?: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
}

export const PlanSetup: React.FC<PlanSetupProps> = ({
  config,
  onChangeConfig,
  onStartSession,
  onOpenSessionLog,
  onOpenSettings,
  onMinimize,
  onToggleExpand,
  isExpanded = false,
  dragHandleProps,
}) => {
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetCategory, setAssetCategory] = useState<'all' | 'forex' | 'crypto' | 'commodities_stocks'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const preview = calculatePlanPreview(config);

  const filteredAssets = useMemo(() => {
    let list: OTCAsset[] = [];
    if (assetCategory === 'forex') list = OTC_FOREX_ASSETS;
    else if (assetCategory === 'crypto') list = OTC_CRYPTO_ASSETS;
    else if (assetCategory === 'commodities_stocks') list = OTC_STOCKS_COMMODITIES_ASSETS;
    else list = ALL_300_OTC_ASSETS;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
  }, [assetCategory, searchQuery]);

  const handleSelectAsset = (asset: OTCAsset) => {
    onChangeConfig({
      ...config,
      asset: asset.symbol,
      payout: asset.payoutDefault || config.payout,
    });
    setShowAssetModal(false);
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value.replace(/,/g, ''));
    if (!isNaN(val) && val >= 0) {
      onChangeConfig({ ...config, balance: val });
    } else if (e.target.value === '') {
      onChangeConfig({ ...config, balance: 0 });
    }
  };

  const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      onChangeConfig({ ...config, riskAmountPercent: val });
    }
  };

  const handlePayoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 10 && val <= 100) {
      onChangeConfig({ ...config, payout: val });
    }
  };

  const handleTradesChange = (delta: number) => {
    const newTrades = Math.max(config.winsNeeded + 1, Math.min(30, config.trades + delta));
    onChangeConfig({ ...config, trades: newTrades });
  };

  const handleWinsChange = (delta: number) => {
    const newWins = Math.max(1, Math.min(config.trades - 1, config.winsNeeded + delta));
    onChangeConfig({ ...config, winsNeeded: newWins });
  };

  const maxLiquidation = config.balance * (config.riskAmountPercent / 100);

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
            className="flex items-center space-x-1 py-1 px-2.5 text-xs font-bold tracking-wide border-b-2 border-[#f5a623] text-[#f5a623] shadow-[0_2px_8px_rgba(245,166,35,0.3)] cursor-pointer"
          >
            <TrendingUp className="w-3 h-3 text-[#f5a623]" />
            <span>Trade</span>
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1 py-1 px-2.5 text-xs font-bold tracking-wide border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <SettingsIcon className="w-3 h-3 text-zinc-400" />
              <span>Settings</span>
            </button>
          )}
        </div>

        {/* Right: Window Controls: Minus (-) & Square (□) only */}
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
              title={isExpanded ? 'Restore Size (□)' : 'Maximize Window (□)'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 space-y-3">
        {/* Top Pocket Option Balance Input Box */}
        <div className="bg-[#101724] border border-[#223044] p-2.5 rounded-none shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider font-mono">
              POCKET OPTION BALANCE
            </label>
            <span className="text-[9px] font-mono text-[#f5a623] font-bold">MANUAL EDIT</span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={config.balance || ''}
              onChange={handleBalanceChange}
              className="w-full bg-[#0a0e16] border-2 border-[#f5a623] focus:ring-2 focus:ring-[#f5a623]/40 rounded-none px-3 py-1.5 text-base font-mono font-bold text-white outline-none tracking-wide shadow-[0_0_14px_rgba(245,166,35,0.2)]"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Selected Asset Box with direct 300 OTC Select & Search Trigger */}
        <div className="bg-[#101724] border border-[#223044] p-2 rounded-none">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-zinc-300 font-mono">
              SELECTED ASSET
            </span>
            <button
              type="button"
              onClick={() => setShowAssetModal(true)}
              className="text-[9px] font-mono text-[#f5a623] hover:underline flex items-center space-x-1 cursor-pointer font-bold"
            >
              <Search className="w-2.5 h-2.5" />
              <span>Search</span>
            </button>
          </div>
          <div className="relative">
            <select
              value={config.asset}
              onChange={(e) => {
                const found = ALL_300_OTC_ASSETS.find((a) => a.symbol === e.target.value);
                onChangeConfig({
                  ...config,
                  asset: e.target.value,
                  payout: found?.payoutDefault || config.payout,
                });
              }}
              className="w-full bg-[#0a0e16] border border-[#24334a] hover:border-[#f5a623] rounded-none px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300 outline-none cursor-pointer"
            >
              <optgroup label="── FOREX OTC (100) ──">
                {OTC_FOREX_ASSETS.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.payoutDefault}%)
                  </option>
                ))}
              </optgroup>
              <optgroup label="── CRYPTO OTC (100) ──">
                {OTC_CRYPTO_ASSETS.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.payoutDefault}%)
                  </option>
                ))}
              </optgroup>
              <optgroup label="── COMMODITIES & STOCKS OTC (100) ──">
                {OTC_STOCKS_COMMODITIES_ASSETS.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.payoutDefault}%)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Currency & Payout Boxes */}
        <div className="grid grid-cols-2 gap-2">
          {/* Currency Box */}
          <div className="bg-[#101724] border border-[#223044] p-2 rounded-none">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-zinc-300 font-mono">CURRENCY</span>
              <span className="text-[8px] font-mono text-zinc-500">SELECT</span>
            </div>
            <select
              value={config.currency}
              onChange={(e) => onChangeConfig({ ...config, currency: e.target.value as Currency })}
              className="w-full bg-[#0a0e16] border border-[#24334a] hover:border-zinc-400 rounded-none px-2 py-1 text-xs font-semibold text-white outline-none cursor-pointer"
            >
              <option value="USD">USD — Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — Pound</option>
              <option value="INR">INR — Rupee</option>
              <option value="BRL">BRL — Real</option>
              <option value="CAD">CAD — Dollar</option>
              <option value="AUD">AUD — Dollar</option>
              <option value="JPY">JPY — Yen</option>
            </select>
          </div>

          {/* Payout % Box */}
          <div className="bg-[#101724] border border-[#223044] p-2 rounded-none">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-zinc-300 font-mono">PAYOUT %</span>
              <span className="text-[8px] font-mono text-zinc-500">INPUT</span>
            </div>
            <input
              type="number"
              min="10"
              max="100"
              value={config.payout}
              onChange={handlePayoutChange}
              className="w-full bg-[#0a0e16] border border-[#24334a] hover:border-zinc-400 rounded-none px-2 py-1 text-xs font-mono font-bold text-[#00e676] outline-none text-left"
            />
          </div>
        </div>

        {/* Risk Amount & Max Liquidation Boxes */}
        <div className="grid grid-cols-2 gap-2">
          {/* Risk Amount Box */}
          <div className="bg-[#101724] border border-[#223044] p-2 rounded-none">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-zinc-300 font-mono">RISK AMOUNT</span>
              <span className="text-[8px] font-mono text-zinc-500">EDIT</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                max="100"
                value={config.riskAmountPercent}
                onChange={handleRiskChange}
                className="w-full bg-[#0a0e16] border border-[#24334a] rounded-none px-2 py-1 text-xs font-mono font-bold text-white outline-none"
              />
              <span className="absolute right-2 text-xs text-zinc-400 font-mono">%</span>
            </div>
          </div>

          {/* Max Liquidation Box (Auto-calculated) */}
          <div className="bg-[#101724] border border-[#223044] p-2 rounded-none">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-zinc-300 font-mono">MAX LIQUIDATION</span>
              <span className="text-[8px] font-mono text-[#f5a623] font-bold">AUTO</span>
            </div>
            <div className="bg-[#0a0e16] border border-[#1b2535] rounded-none px-2 py-1 text-xs font-mono font-bold text-zinc-200 truncate">
              {formatCurrency(maxLiquidation, config.currency)}
            </div>
          </div>
        </div>

        {/* Trades & Wins Needed Stepper Boxes */}
        <div className="grid grid-cols-2 gap-2">
          {/* Trades Box */}
          <div className="bg-[#101724] border border-[#223044] p-2 rounded-none">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-zinc-300 font-mono">TRADES</span>
              <span className="text-[8px] font-mono text-zinc-500">CYCLE</span>
            </div>
            <div className="flex items-center bg-[#0a0e16] border border-[#24334a] rounded-none">
              <button
                onClick={() => handleTradesChange(-1)}
                className="px-2 py-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <div className="flex-1 text-center font-mono font-bold text-xs text-white">
                {config.trades}
              </div>
              <button
                onClick={() => handleTradesChange(1)}
                className="px-2 py-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Wins Needed Box */}
          <div className="bg-[#101724] border border-[#223044] p-2 rounded-none">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-zinc-300 font-mono">WINS NEEDED</span>
              <span className="text-[8px] font-mono text-zinc-500">TARGET</span>
            </div>
            <div className="flex items-center bg-[#0a0e16] border border-[#24334a] rounded-none">
              <button
                onClick={() => handleWinsChange(-1)}
                className="px-2 py-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <div className="flex-1 text-center font-mono font-bold text-xs text-white">
                {config.winsNeeded}
              </div>
              <button
                onClick={() => handleWinsChange(1)}
                className="px-2 py-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Plan Preview Box */}
        <div className="bg-[#0b1018] border border-[#1e2a3c] p-2.5 rounded-none space-y-2 shadow-inner">
          <div className="text-[11px] font-semibold text-zinc-300 pb-1.5 flex items-center justify-between border-b border-[#1b2638]">
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#f5a623]" />
              <span className="font-mono uppercase font-bold text-xs text-white">PLAN PREVIEW</span>
            </div>
          </div>

          {/* 6 Grid Metric Boxes (Auto-calculated) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Box 1: First Stake */}
            <div className="bg-[#101724] border border-[#1b2535] p-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase">First Stake</span>
                <span className="text-[8px] font-mono text-[#f5a623] font-bold">AUTO</span>
              </div>
              <div className="font-mono font-bold text-white text-sm mt-0.5">
                {formatCurrency(preview.firstStake, config.currency)}
              </div>
            </div>

            {/* Box 2: Capital Final */}
            <div className="bg-[#101724] border border-[#1b2535] p-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase">Capital Final</span>
                <span className="text-[8px] font-mono text-[#00e676] font-bold">AUTO</span>
              </div>
              <div className="font-mono font-bold text-[#00e676] text-sm mt-0.5">
                {formatCurrency(preview.finalCapital, config.currency)}
              </div>
            </div>

            {/* Box 3: Account Gain */}
            <div className="bg-[#101724] border border-[#1b2535] p-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase">Account Gain</span>
                <span className="text-[8px] font-mono text-[#00e676] font-bold">AUTO</span>
              </div>
              <div className="font-mono font-bold text-[#00e676] text-sm mt-0.5">
                +{preview.accountGainPercent.toFixed(2)}%
              </div>
            </div>

            {/* Box 4: Win Profit */}
            <div className="bg-[#101724] border border-[#1b2535] p-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase">Win Profit</span>
                <span className="text-[8px] font-mono text-[#00e676] font-bold">AUTO</span>
              </div>
              <div className="font-mono font-bold text-white text-sm mt-0.5">
                +{formatCurrency(preview.winProfit, config.currency)}
              </div>
            </div>

            {/* Box 5: Trade Loss Limit */}
            <div className="bg-[#101724] border border-[#1b2535] p-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase">Loss Limit</span>
                <span className="text-[8px] font-mono text-[#ff3b57] font-bold">AUTO</span>
              </div>
              <div className="font-mono font-bold text-zinc-200 text-sm mt-0.5">
                {preview.tradeLossLimit} losses
              </div>
            </div>

            {/* Box 6: Min Capital Needed */}
            <div className="bg-[#101724] border border-[#1b2535] p-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase">Min Capital</span>
                <span className="text-[8px] font-mono text-amber-300 font-bold">AUTO</span>
              </div>
              <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                {formatCurrency(preview.minCapitalNeeded, config.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2 pt-1">
          <button
            onClick={onStartSession}
            className="w-full bg-[#f5a623] hover:bg-[#ffb530] text-black font-extrabold py-3 px-4 rounded-none text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(245,166,35,0.4)] active:scale-[0.99] cursor-pointer"
          >
            Start session
          </button>

          <button
            onClick={onOpenSessionLog}
            className="w-full bg-[#141b27] hover:bg-[#1e2738] text-zinc-300 hover:text-white font-semibold py-2 px-3 rounded-none text-xs transition-colors border border-[#233146] cursor-pointer"
          >
            Session Log
          </button>
        </div>
      </div>

      {/* 300 OTC ASSETS SELECTION MODAL */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e141f] border-2 border-[#f5a623] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1f2b3e] bg-[#0a0e16]">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-[#f5a623] flex items-center justify-center font-bold text-black text-xs font-mono">
                  300
                </div>
                <span className="font-mono font-bold text-xs uppercase text-white">
                  SELECT OTC ASSET (300 AVAILABLE)
                </span>
              </div>
              <button
                onClick={() => setShowAssetModal(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Sector Filters */}
            <div className="p-3 border-b border-[#1f2b3e] space-y-2 bg-[#0d121c]">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 300 OTC pairs (e.g. EUR/USD, BTC, Gold, Apple)..."
                  className="w-full bg-[#151c28] border border-[#233145] focus:border-[#f5a623] rounded-none pl-8 pr-3 py-1.5 text-xs font-mono text-white outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 4 Category Tabs */}
              <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                <button
                  onClick={() => setAssetCategory('all')}
                  className={`py-1 px-1.5 text-center font-bold transition-all border ${
                    assetCategory === 'all'
                      ? 'bg-[#f5a623] text-black border-[#f5a623]'
                      : 'bg-[#151c28] text-zinc-400 hover:text-white border-[#202c3d]'
                  }`}
                >
                  All ({ALL_300_OTC_ASSETS.length})
                </button>
                <button
                  onClick={() => setAssetCategory('forex')}
                  className={`py-1 px-1.5 text-center font-bold transition-all border ${
                    assetCategory === 'forex'
                      ? 'bg-[#f5a623] text-black border-[#f5a623]'
                      : 'bg-[#151c28] text-zinc-400 hover:text-white border-[#202c3d]'
                  }`}
                >
                  Forex (100)
                </button>
                <button
                  onClick={() => setAssetCategory('crypto')}
                  className={`py-1 px-1.5 text-center font-bold transition-all border ${
                    assetCategory === 'crypto'
                      ? 'bg-[#f5a623] text-black border-[#f5a623]'
                      : 'bg-[#151c28] text-zinc-400 hover:text-white border-[#202c3d]'
                  }`}
                >
                  Crypto (100)
                </button>
                <button
                  onClick={() => setAssetCategory('commodities_stocks')}
                  className={`py-1 px-1.5 text-center font-bold transition-all border ${
                    assetCategory === 'commodities_stocks'
                      ? 'bg-[#f5a623] text-black border-[#f5a623]'
                      : 'bg-[#151c28] text-zinc-400 hover:text-white border-[#202c3d]'
                  }`}
                >
                  Stocks (100)
                </button>
              </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#182232] space-y-0.5">
              {filteredAssets.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs">
                  No OTC assets matching "{searchQuery}"
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const isSelected = config.asset === asset.symbol;
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => handleSelectAsset(asset)}
                      className={`w-full py-2 px-3 text-left flex items-center justify-between hover:bg-[#162132] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#1b2638] border-l-2 border-[#f5a623]' : ''
                      }`}
                    >
                      <div>
                        <div className="font-mono font-bold text-xs text-white flex items-center space-x-1.5">
                          <span>{asset.symbol}</span>
                          {isSelected && (
                            <span className="text-[9px] bg-[#00e676]/20 text-[#00e676] px-1 py-0.2">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate max-w-[260px] sm:max-w-xs">
                          {asset.name}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#00e676]">
                          {asset.payoutDefault}%
                        </span>
                        <span className="block text-[8px] text-zinc-500 uppercase font-mono">
                          {asset.category}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-2 border-t border-[#1f2b3e] bg-[#0a0e16] text-[10px] text-zinc-400 font-mono flex items-center justify-between">
              <span>Showing {filteredAssets.length} of 300 OTC pairs</span>
              <button
                onClick={() => setShowAssetModal(false)}
                className="px-3 py-1 bg-[#1a2334] hover:bg-[#25324b] text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
