import { SessionResult, AppSettings, PlanConfig, Mode } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'pocketsniper_sessions_v1',
  SETTINGS: 'pocketsniper_settings_v1',
  PLAN_CONFIG: 'pocketsniper_plan_v1',
  MODE: 'pocketsniper_mode_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  licenseKey: 'TEST••••Y-1',
  celebrationTheme: 'Sparkles',
  sounds: true,
  hideIdNumber: true,
  miniLog: true,
  dynamicStaking: true,
  autoContinue: true,
  testMode: false,
  whopAffiliateLink: 'https://whop.com/pocketsniper',
  brokerLink: 'https://pocket-friends.co/r/mphdnyllo5',
  traderName: 'Trader ****',
  sniperId: 'Sniper ID',
};

export const DEFAULT_PLAN_CONFIG: PlanConfig = {
  balance: 2131.89,
  currency: 'USD',
  payout: 92,
  trades: 14,
  winsNeeded: 2,
  riskAmountPercent: 100,
  asset: 'BTC/USD OTC',
};

// Seed authentic session data matching the screenshots (October 2026 dates)
export const SEED_SESSIONS: SessionResult[] = [
  {
    id: 'sess-1',
    sessionNumber: 1,
    date: 'Oct 21, 2026 08:43',
    dateKey: '2026-10-21',
    accountBal: 2131.89,
    trades: 14,
    winsNeeded: 2,
    payout: 92,
    capitalGoal: 2133.05,
    gainTargetPercent: 0.0544,
    winProfit: 1.16,
    endingBalance: 2132.41,
    won: 1,
    lost: 2,
    profitLoss: 0.52,
    status: 'WIN',
    steps: [
      { step: 1, stake: 1.10, result: 'LOSS', balanceAfter: 2130.79 },
      { step: 2, stake: 2.12, result: 'LOSS', balanceAfter: 2128.67 },
      { step: 3, stake: 4.06, result: 'WIN', balanceAfter: 2132.41, payoutUsed: 92 },
    ],
  },
  {
    id: 'sess-2',
    sessionNumber: 2,
    date: 'Oct 23, 2026 14:15',
    dateKey: '2026-10-23',
    accountBal: 2132.41,
    trades: 14,
    winsNeeded: 2,
    payout: 92,
    capitalGoal: 2143.26,
    gainTargetPercent: 0.51,
    winProfit: 10.85,
    endingBalance: 2143.29,
    won: 2,
    lost: 1,
    profitLoss: 10.88,
    status: 'WIN',
    steps: [
      { step: 1, stake: 1.10, result: 'LOSS', balanceAfter: 2131.31 },
      { step: 2, stake: 2.12, result: 'WIN', balanceAfter: 2133.26, payoutUsed: 92 },
      { step: 3, stake: 10.05, result: 'WIN', balanceAfter: 2143.29, payoutUsed: 92 },
    ],
  },
  {
    id: 'sess-3',
    sessionNumber: 3,
    date: 'Oct 23, 2026 16:30',
    dateKey: '2026-10-23',
    accountBal: 2143.29,
    trades: 12,
    winsNeeded: 2,
    payout: 92,
    capitalGoal: 2154.14,
    gainTargetPercent: 0.51,
    winProfit: 10.85,
    endingBalance: 2154.14,
    won: 2,
    lost: 0,
    profitLoss: 10.85,
    status: 'WIN',
    steps: [
      { step: 1, stake: 10.05, result: 'WIN', balanceAfter: 2149.54, payoutUsed: 92 },
      { step: 2, stake: 5.00, result: 'WIN', balanceAfter: 2154.14, payoutUsed: 92 },
    ],
  },
  {
    id: 'sess-4',
    sessionNumber: 4,
    date: 'Oct 26, 2026 08:47',
    dateKey: '2026-10-26',
    accountBal: 2149.61,
    trades: 14,
    winsNeeded: 2,
    payout: 92,
    capitalGoal: 2150.78,
    gainTargetPercent: 0.0544,
    winProfit: 1.17,
    endingBalance: 2150.63,
    won: 1,
    lost: 0,
    profitLoss: 1.02,
    status: 'WIN',
    steps: [
      { step: 1, stake: 1.11, result: 'WIN', balanceAfter: 2150.63, payoutUsed: 92 },
    ],
  },
  {
    id: 'sess-5',
    sessionNumber: 5,
    date: 'Oct 26, 2026 09:40',
    dateKey: '2026-10-26',
    accountBal: 2150.63,
    trades: 14,
    winsNeeded: 2,
    payout: 92,
    capitalGoal: 2151.80,
    gainTargetPercent: 0.0544,
    winProfit: 1.17,
    endingBalance: 2151.80,
    won: 2,
    lost: 3,
    profitLoss: 1.17,
    status: 'WIN',
    steps: [
      { step: 1, stake: 1.10, result: 'LOSS', balanceAfter: 2149.53 },
      { step: 2, stake: 2.12, result: 'LOSS', balanceAfter: 2147.41 },
      { step: 3, stake: 4.06, result: 'LOSS', balanceAfter: 2143.35 },
      { step: 4, stake: 7.64, result: 'WIN', balanceAfter: 2150.38, payoutUsed: 92 },
      { step: 5, stake: 1.54, result: 'WIN', balanceAfter: 2151.80, payoutUsed: 92 },
    ],
  },
  {
    id: 'sess-6',
    sessionNumber: 6,
    date: 'Oct 27, 2026 11:20',
    dateKey: '2026-10-27',
    accountBal: 5265.11,
    trades: 12,
    winsNeeded: 2,
    payout: 92,
    capitalGoal: 5275.96,
    gainTargetPercent: 0.21,
    winProfit: 10.85,
    endingBalance: 5275.96,
    won: 2,
    lost: 2,
    profitLoss: 10.85,
    status: 'WIN',
    steps: [
      { step: 1, stake: 10.05, result: 'LOSS', balanceAfter: 5255.06 },
      { step: 2, stake: 19.34, result: 'WIN', balanceAfter: 5272.85, payoutUsed: 92 },
      { step: 3, stake: 3.66, result: 'LOSS', balanceAfter: 5269.19 },
      { step: 4, stake: 7.36, result: 'WIN', balanceAfter: 5275.96, payoutUsed: 92 },
    ],
  },
];

export function getSavedSessions(): SessionResult[] {
  if (typeof window === 'undefined') return SEED_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(SEED_SESSIONS));
      return SEED_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_SESSIONS;
  }
}

export function saveSessions(sessions: SessionResult[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

export function getSavedSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getSavedPlanConfig(): PlanConfig {
  if (typeof window === 'undefined') return DEFAULT_PLAN_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAN_CONFIG);
    if (!raw) return DEFAULT_PLAN_CONFIG;
    return { ...DEFAULT_PLAN_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLAN_CONFIG;
  }
}

export function savePlanConfig(config: PlanConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLAN_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save plan config:', e);
  }
}

export function getSavedMode(): Mode {
  if (typeof window === 'undefined') return 'REAL';
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODE);
    return (raw === 'DEMO' ? 'DEMO' : 'REAL');
  } catch {
    return 'REAL';
  }
}

export function saveMode(mode: Mode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  } catch (e) {
    console.error('Failed to save mode:', e);
  }
}
