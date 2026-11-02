export type Mode = 'REAL' | 'DEMO';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'BRL' | 'CAD' | 'AUD' | 'JPY';

export interface PlanConfig {
  balance: number;
  currency: Currency;
  payout: number;
  trades: number;
  winsNeeded: number;
  riskAmountPercent: number;
  asset: string;
}

export interface PlanPreview {
  firstStake: number;
  finalCapital: number;
  accountGainPercent: number;
  winProfit: number;
  tradeLossLimit: number;
  minCapitalNeeded: number;
  requiredRecoveryCapital: number;
}

export interface TradeStep {
  step: number;
  stake: number;
  result?: 'WIN' | 'LOSS';
  balanceAfter?: number;
  payoutUsed?: number;
  timestamp?: number;
}

export interface ForexPosition {
  id: string;
  pairId: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  timeframe: string;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  lotSize: number;
  pips: number;
  pnl: number;
  status: 'OPEN' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'CLOSED';
  openedAt: number;
  closedAt?: number;
}

export interface ForexJournalRecord {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  timeframe: string;
  entryPrice: number;
  exitPrice: number;
  pips: number;
  pnl: number;
  lotSize: number;
  outcome: 'WIN' | 'LOSS' | 'BREAKEVEN';
  reason: string;
  timestamp: number;
  dateFormatted: string;
}

export interface SessionResult {
  id: string;
  sessionNumber: number;
  date: string;
  dateKey: string;
  accountBal: number;
  trades: number;
  winsNeeded: number;
  payout: number;
  capitalGoal: number;
  gainTargetPercent: number;
  winProfit: number;
  endingBalance: number;
  won: number;
  lost: number;
  profitLoss: number;
  status: 'WIN' | 'LOSS' | 'MANUAL_EXIT';
  steps: TradeStep[];
}

export interface AppSettings {
  licenseKey: string;
  celebrationTheme: 'Sparkles' | 'Retro Future';
  sounds: boolean;
  hideIdNumber: boolean;
  miniLog: boolean;
  dynamicStaking: boolean;
  autoContinue: boolean;
  testMode: boolean;
  whopAffiliateLink: string;
  brokerLink: string;
  traderName: string;
  sniperId: string;
  riskPercent?: number;
  defaultLotSize?: number;
}

export type ActiveView = 'trading' | 'session_log' | 'pnl_calendar' | 'settings' | 'help';

export type AppLayoutMode = 'floating_overlay' | 'widget_focused' | 'web_portal';

export type ShareLayout = 'desktop' | 'mobile' | 'pnl_only';
export type ShareTheme = 'standard' | 'retro_future' | 'space_rocket' | 'cyber_chibi';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ActiveBrokerTrade {
  id: string;
  direction: 'BUY' | 'SELL';
  stake: number;
  entryPrice: number;
  payout: number;
  durationSeconds: number;
  remainingSeconds: number;
  timestamp: number;
}
