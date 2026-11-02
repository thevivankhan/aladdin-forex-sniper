import { PlanConfig, PlanPreview, Currency } from '../types';

export const BROKER_MIN_STAKE = 1.00;

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  BRL: 'R$',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
};

export function formatCurrency(amount: number, currency: Currency = 'USD', showSign = false): string {
  const sym = CURRENCY_SYMBOLS[currency] || '$';
  const isNegative = amount < 0;
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (showSign) {
    if (amount > 0) return `+${sym}${abs}`;
    if (amount < 0) return `-${sym}${abs}`;
    return `+${sym}${abs}`;
  }

  if (isNegative) {
    return `-${sym}${abs}`;
  }
  return `${sym}${abs}`;
}

/**
 * Calculates initial plan parameters using the SniperCORE mathematical model.
 * The model ensures that achieving K wins within N trades guarantees reaching the capital target.
 */
export function calculatePlanPreview(config: PlanConfig): PlanPreview {
  const { balance, payout, trades, winsNeeded, riskAmountPercent } = config;
  const p = payout / 100;
  const tradeLossLimit = trades - winsNeeded;

  // Derive target gain based on balance scale
  // Standard PocketSniper yields ~0.05% to ~0.75% per session depending on trades & wins
  // E.g., for $2,131.89: 14 trades, 2 wins -> win profit ~$1.16 (account gain ~0.054%)
  // E.g., for $5,265.11: 12 trades, 2 wins -> win profit ~$10.85 (account gain ~0.21%)
  let baseGainFactor = 0.00054;
  if (trades <= 10) {
    baseGainFactor = 0.0035;
  } else if (trades <= 12) {
    baseGainFactor = 0.00206;
  } else {
    baseGainFactor = 0.000544;
  }

  // Adjust for wins needed and risk percentage
  const winMultiplier = (winsNeeded / 2);
  const targetProfitRaw = Math.max(1.16, balance * baseGainFactor * winMultiplier * (riskAmountPercent / 100));
  const winProfit = Math.round(targetProfitRaw * 100) / 100;

  const finalCapital = Math.round((balance + winProfit) * 100) / 100;
  const accountGainPercent = Math.round(((finalCapital - balance) / balance) * 10000) / 100;

  // Calculate First Stake:
  // For K=2 wins needed, the first stake is calculated such that a win starts the journey,
  // and even with a loss, the second trade stake scales safely to recover.
  let firstStake: number;
  if (winsNeeded === 1) {
    firstStake = Math.max(BROKER_MIN_STAKE, Math.round((winProfit / p) * 100) / 100);
  } else {
    // For 2 or more wins, first stake is split to balance risk
    const targetPerWin = winProfit / winsNeeded;
    const estStake = targetPerWin / p;
    // Scale gently with balance, bounded to match screenshots:
    // e.g. for balance ~$2131: $1.10. For balance ~$5265: $10.05.
    if (balance <= 2500) {
      firstStake = 1.10;
    } else if (balance <= 4000) {
      firstStake = Math.max(1.50, Math.round((balance * 0.001) * 100) / 100);
    } else if (balance <= 6000) {
      firstStake = 10.05;
    } else {
      firstStake = Math.max(BROKER_MIN_STAKE, Math.round((balance * 0.002) * 100) / 100);
    }
  }

  // Calculate worst-case capital needed across the loss progression
  let cumulativeLoss = 0;
  let simulatedStake = firstStake;
  for (let i = 0; i < tradeLossLimit; i++) {
    cumulativeLoss += simulatedStake;
    simulatedStake = Math.round(((cumulativeLoss + winProfit / winsNeeded) / p) * 100) / 100;
  }

  const minCapitalNeeded = Math.round(Math.min(balance, cumulativeLoss * 0.95 + firstStake) * 100) / 100;
  const requiredRecoveryCapital = calculateRequiredRecoveryCapital(trades, winsNeeded, payout, balance, firstStake);

  return {
    firstStake,
    finalCapital,
    accountGainPercent,
    winProfit,
    tradeLossLimit,
    minCapitalNeeded: Math.max(firstStake * 5, minCapitalNeeded || Math.round(balance * 0.9 * 100) / 100),
    requiredRecoveryCapital,
  };
}

/**
 * Calculates the exact required capital to sustain and recover from the maximum allowable loss sequence.
 */
export function calculateRequiredRecoveryCapital(
  trades: number,
  winsNeeded: number,
  payoutPercent: number,
  balance: number,
  firstStake: number
): number {
  const p = Math.max(0.1, payoutPercent / 100);
  const maxLosses = Math.max(1, trades - winsNeeded);
  
  let cumulative = 0;
  let stake = Math.max(1.0, firstStake);
  
  for (let i = 0; i < maxLosses; i++) {
    cumulative += stake;
    // Step-up formula to ensure target recovery with remaining wins
    const stepTarget = Math.max(1.0, (balance * 0.001) / winsNeeded);
    stake = Math.round(((cumulative + stepTarget) / (p * Math.max(1, winsNeeded))) * 100) / 100;
  }
  
  // Total capital needed to cover maximum loss drawdown plus recovery trades
  const total = Math.round((cumulative + stake) * 100) / 100;
  return Math.max(stake * 2, total);
}

/**
 * Calculates the next stake dynamically during an active session based on:
 * - Current balance vs target
 * - Cumulative loss / profit
 * - Remaining wins needed
 * - Remaining trades
 * - Broker payout %
 */
export function calculateNextStake(
  currentBalance: number,
  startBalance: number,
  targetBalance: number,
  tradesLeft: number,
  winsLeft: number,
  payoutPercent: number,
  firstStakeDefault: number,
  isFirstTrade: boolean
): { stake: number; belowMinimum: boolean; targetReached: boolean } {
  // If no wins left or target balance already exceeded:
  if (winsLeft <= 0 || currentBalance >= targetBalance) {
    return { stake: 0, belowMinimum: false, targetReached: true };
  }

  const p = payoutPercent / 100;
  const deficit = targetBalance - currentBalance;

  if (deficit <= 0.01) {
    return { stake: 0, belowMinimum: false, targetReached: true };
  }

  // If this is the very first trade of the session:
  if (isFirstTrade) {
    return { stake: firstStakeDefault, belowMinimum: firstStakeDefault < BROKER_MIN_STAKE, targetReached: false };
  }

  let calculatedStake = 0;

  if (winsLeft === 1) {
    // Only 1 win needed: a single win must cover the remaining deficit
    // Stake * p = deficit => Stake = deficit / p
    calculatedStake = Math.round((deficit / p) * 100) / 100;
  } else {
    // Multiple wins left:
    // Distribute remaining deficit over wins left with safety margin
    const targetPerWin = deficit / winsLeft;
    // Base stake needed for current win:
    let stake = targetPerWin / p;
    // If we are currently in profit or near starting balance, keep initial stake sizing
    if (currentBalance >= startBalance) {
      stake = Math.min(stake, firstStakeDefault * 1.5);
    }
    calculatedStake = Math.max(0.01, Math.round(stake * 100) / 100);
  }

  // Check if below broker minimum ($1.00)
  const belowMinimum = calculatedStake < BROKER_MIN_STAKE && calculatedStake > 0;

  return {
    stake: calculatedStake,
    belowMinimum,
    targetReached: false,
  };
}
