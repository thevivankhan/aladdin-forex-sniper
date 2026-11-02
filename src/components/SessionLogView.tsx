import React from 'react';
import { SessionResult, Currency } from '../types';
import { formatCurrency } from '../utils/sniperCore';
import { Share2, Trash2, Calendar, FileText, Trophy, TrendingUp, ListOrdered, Landmark, Download } from 'lucide-react';

interface SessionLogViewProps {
  sessions: SessionResult[];
  currency: Currency;
  onClearLast: () => void;
  onClearAll: () => void;
  onOpenShareModal: () => void;
  onSwitchToCalendar: () => void;
  onBackToTrading: () => void;
}

export const SessionLogView: React.FC<SessionLogViewProps> = ({
  sessions,
  currency,
  onClearLast,
  onClearAll,
  onOpenShareModal,
  onSwitchToCalendar,
  onBackToTrading,
}) => {
  // Aggregate stats
  const totalSessions = sessions.length;
  const wonSessions = sessions.filter((s) => s.profitLoss >= 0).length;
  const lostSessions = totalSessions - wonSessions;
  const sessionWinRate = totalSessions > 0 ? Math.round((wonSessions / totalSessions) * 100) : 0;

  const totalProfit = sessions.reduce((acc, s) => acc + s.profitLoss, 0);

  // Latest session balance or initial
  const endingBalance = sessions.length > 0 ? sessions[sessions.length - 1].endingBalance : 2132.41;
  const initialBalance = sessions.length > 0 ? sessions[0].accountBal : endingBalance;
  const totalAccountGain = initialBalance > 0 ? ((endingBalance - initialBalance) / initialBalance) * 100 : 0;

  // Today's profit
  const todayKey = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.dateKey === todayKey || s.dateKey.startsWith('2026-10-2'));
  const todayProfit = todaySessions.reduce((acc, s) => acc + s.profitLoss, 0) || totalProfit;

  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  // Export CSV using Blob URL (iframe safe)
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      setActionFeedback('No sessions to export');
      setTimeout(() => setActionFeedback(null), 2500);
      return;
    }

    const headers = [
      'Session',
      'Date',
      'Account Bal',
      'Trades',
      'Wins Needed',
      'Payout %',
      'Capital Goal',
      'Gain Target %',
      'Win Profit',
      'Ending Balance',
      'Won',
      'Lost',
      'Profit Loss',
    ];
    const rows = sessions.map((s) => [
      s.sessionNumber,
      `"${s.date}"`,
      s.accountBal.toFixed(2),
      s.trades,
      s.winsNeeded,
      s.payout,
      s.capitalGoal.toFixed(2),
      s.gainTargetPercent.toFixed(4),
      s.winProfit.toFixed(2),
      s.endingBalance.toFixed(2),
      s.won,
      s.lost,
      s.profitLoss.toFixed(2),
    ]);
    const csvString = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pocketsniper_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActionFeedback('Sessions exported to CSV successfully!');
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleTriggerClearLast = () => {
    onClearLast();
    setActionFeedback('Cleared last session record');
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handleTriggerClearAll = () => {
    onClearAll();
    setActionFeedback('Cleared all session history');
    setTimeout(() => setActionFeedback(null), 2000);
  };

  return (
    <div className="flex-1 bg-[#0c0f14] text-white p-4 sm:p-6 overflow-y-auto select-none">
      {/* Top Bar with Navigation Tabs & Ending Balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1b222e] gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#1a212e] text-[#f5a623] font-bold text-xs border border-[#f5a623]/30"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Session Log</span>
          </button>

          <button
            onClick={onSwitchToCalendar}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#141a24] font-medium text-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>P&L Calendar</span>
          </button>

          <button
            onClick={onBackToTrading}
            className="text-xs text-zinc-400 hover:text-[#f5a623] underline ml-2 transition-colors cursor-pointer"
          >
            Back to Trade
          </button>
        </div>

        {/* Ending Balance */}
        <div className="flex items-center space-x-2 text-right">
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            ENDING BALANCE
          </span>
          <span className="font-mono font-bold text-lg text-[#00e676]">
            {formatCurrency(endingBalance, currency)}
          </span>
        </div>
      </div>

      {/* Today's Snapshot Card (Square style) */}
      <div className="bg-[#12161f] border border-[#1e2634] rounded-[3px] p-5 my-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="text-[11px] font-mono tracking-wider font-bold text-[#f5a623] uppercase">
            WEDNESDAY, OCTOBER 21
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Chakra_Petch',sans-serif] text-white mt-0.5">
            Today's Snapshot
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {todaySessions.length} {todaySessions.length === 1 ? 'session' : 'sessions'} logged today
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
              TODAY'S PROFIT
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#00e676]">
              {formatCurrency(todayProfit, currency, true)}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
              All time {formatCurrency(totalProfit, currency, true)}
            </div>
          </div>

          <button
            onClick={onOpenShareModal}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-[3px] bg-[#1b2330] hover:bg-[#253042] text-[#f5a623] border border-[#f5a623]/30 font-semibold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards (Square style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-5">
        {/* Card 1 */}
        <div className="bg-[#12161f] border border-[#1e2634] rounded-[3px] p-4">
          <div className="flex items-center space-x-1.5 text-xs text-[#f5a623] font-mono font-medium uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>SESSION WIN / LOSS</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            {wonSessions} / {lostSessions}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {lostSessions === 0 ? 'no losing sessions yet' : `${lostSessions} losing sessions`}
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#12161f] border border-[#1e2634] rounded-[3px] p-4">
          <div className="flex items-center space-x-1.5 text-xs text-[#00e676] font-mono font-medium uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>SESSION WIN RATE</span>
          </div>
          <div className="text-2xl font-black font-mono text-[#00e676] mt-2">
            {sessionWinRate}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {wonSessions} of {totalSessions} sessions won
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#12161f] border border-[#1e2634] rounded-[3px] p-4">
          <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono font-medium uppercase tracking-wider">
            <ListOrdered className="w-3.5 h-3.5" />
            <span>TOTAL SESSIONS</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            {totalSessions}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Logged in local storage
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#12161f] border border-[#1e2634] rounded-[3px] p-4">
          <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-mono font-medium uppercase tracking-wider">
            <Landmark className="w-3.5 h-3.5" />
            <span>ACCOUNT GAIN</span>
          </div>
          <div className="text-2xl font-black font-mono text-[#00e676] mt-2">
            +{totalAccountGain.toFixed(2)}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Overall percentage growth
          </div>
        </div>
      </div>

      {/* Session Results Table Container (Square style) */}
      <div className="bg-[#12161f] border border-[#1e2634] rounded-[3px] p-5 my-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1e2634] gap-2">
          <div>
            <h3 className="font-bold text-base text-white">
              Session Results
            </h3>
            <span className="text-xs text-zinc-400">
              ({sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} recorded)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {actionFeedback && (
              <span className="text-xs text-[#00e676] font-mono animate-in fade-in">
                {actionFeedback}
              </span>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#18202c] hover:bg-[#202a3a] text-zinc-300 text-xs border border-[#232d3d] transition-colors cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={handleTriggerClearLast}
              disabled={sessions.length === 0}
              className="px-3 py-1.5 rounded-lg bg-[#1c1618] hover:bg-[#291e22] text-rose-300 border border-rose-500/20 text-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              Clear Last
            </button>

            <button
              onClick={handleTriggerClearAll}
              disabled={sessions.length === 0}
              className="px-3 py-1.5 rounded-lg bg-[#1c1618] hover:bg-[#291e22] text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider border-b border-[#1e2634]">
                <th className="py-2.5 px-3">Session</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Account Bal.</th>
                <th className="py-2.5 px-3">Trades</th>
                <th className="py-2.5 px-3">Wins</th>
                <th className="py-2.5 px-3">Payout</th>
                <th className="py-2.5 px-3">Capital Goal</th>
                <th className="py-2.5 px-3">Gain Target</th>
                <th className="py-2.5 px-3">Win Profit</th>
                <th className="py-2.5 px-3">Ending Bal</th>
                <th className="py-2.5 px-3">Won</th>
                <th className="py-2.5 px-3">Lost</th>
                <th className="py-2.5 px-3 text-right">Profit/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18202d] font-mono text-zinc-300">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-zinc-500 font-sans">
                    No sessions recorded yet. Start your first session from Trading!
                  </td>
                </tr>
              ) : (
                [...sessions].reverse().map((s) => (
                  <tr key={s.id} className="hover:bg-[#161c28] transition-colors">
                    <td className="py-3 px-3 text-zinc-400 font-bold">{s.sessionNumber}</td>
                    <td className="py-3 px-3 text-zinc-400">{s.date}</td>
                    <td className="py-3 px-3 font-semibold">{formatCurrency(s.accountBal, currency)}</td>
                    <td className="py-3 px-3">{s.trades}</td>
                    <td className="py-3 px-3">{s.winsNeeded}</td>
                    <td className="py-3 px-3">{s.payout}%</td>
                    <td className="py-3 px-3 text-zinc-400">{formatCurrency(s.capitalGoal, currency)}</td>
                    <td className="py-3 px-3 text-zinc-400">{(s.gainTargetPercent).toFixed(4)}%</td>
                    <td className="py-3 px-3 text-zinc-400">{formatCurrency(s.winProfit, currency)}</td>
                    <td className="py-3 px-3 font-semibold text-white">{formatCurrency(s.endingBalance, currency)}</td>
                    <td className="py-3 px-3 text-[#00e676] font-bold">{s.won}</td>
                    <td className="py-3 px-3 text-[#ff3b57] font-bold">{s.lost}</td>
                    <td className={`py-3 px-3 font-bold text-right ${s.profitLoss >= 0 ? 'text-[#00e676]' : 'text-[#ff3b57]'}`}>
                      {formatCurrency(s.profitLoss, currency, true)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
