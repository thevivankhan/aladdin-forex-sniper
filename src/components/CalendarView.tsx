import React, { useState } from 'react';
import { SessionResult, Currency } from '../types';
import { formatCurrency } from '../utils/sniperCore';
import { ChevronLeft, ChevronRight, FileText, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';

interface CalendarViewProps {
  sessions: SessionResult[];
  currency: Currency;
  onSwitchToSessionLog: () => void;
  onBackToTrading: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  currency,
  onSwitchToSessionLog,
  onBackToTrading,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-based: 9 = October
  const [selectedDay, setSelectedDay] = useState<string | null>('2026-10-23');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Group sessions by day string "YYYY-MM-DD"
  const sessionsByDay: Record<string, SessionResult[]> = {};
  sessions.forEach((s) => {
    const key = s.dateKey;
    if (!sessionsByDay[key]) {
      sessionsByDay[key] = [];
    }
    sessionsByDay[key].push(s);
  });

  // Calculate Month Total stats
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  let monthProfit = 0;
  let tradedDaysSet = new Set<string>();
  let monthWonSessions = 0;
  let monthTotalSessions = 0;

  sessions.forEach((s) => {
    if (s.dateKey.startsWith(monthPrefix)) {
      monthProfit += s.profitLoss;
      tradedDaysSet.add(s.dateKey);
      monthTotalSessions++;
      if (s.profitLoss >= 0) monthWonSessions++;
    }
  });

  const monthWinRate = monthTotalSessions > 0 ? Math.round((monthWonSessions / monthTotalSessions) * 100) : 100;
  const daysTraded = tradedDaysSet.size;

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Create grid cells (7 columns)
  const cells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    cells.push({
      dayNum,
      isCurrentMonth: false,
      dateKey: `${currentMonth === 0 ? currentYear - 1 : currentYear}-${String(
        currentMonth === 0 ? 12 : currentMonth
      ).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      dayNum: i,
      isCurrentMonth: true,
      dateKey: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
    });
  }

  // Next month leading days to complete row
  const remaining = 35 - cells.length;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        dateKey: `${currentMonth === 11 ? currentYear + 1 : currentYear}-${String(
          currentMonth === 11 ? 1 : currentMonth + 2
        ).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }
  }

  const selectedSessions = selectedDay ? sessionsByDay[selectedDay] || [] : [];
  const selectedDayTotalProfit = selectedSessions.reduce((acc, s) => acc + s.profitLoss, 0);

  return (
    <div className="flex-1 bg-[#0c0f14] text-white p-4 sm:p-6 overflow-y-auto select-none">
      {/* Top Bar with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1b222e] gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onSwitchToSessionLog}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#141a24] font-medium text-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Session Log</span>
          </button>

          <button
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#1a212e] text-[#f5a623] font-bold text-xs border border-[#f5a623]/30"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>P&L Calendar</span>
          </button>

          <button
            onClick={onBackToTrading}
            className="text-xs text-zinc-400 hover:text-[#f5a623] underline ml-2 transition-colors cursor-pointer"
          >
            Back to Trade
          </button>
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          Interactive Trading Calendar
        </div>
      </div>

      <div className="max-w-4xl mx-auto my-6">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black font-['Chakra_Petch',sans-serif] text-white">
          P&L Calendar
        </h1>

        {/* Month & Year Navigation Row */}
        <div className="flex items-center space-x-3 my-4">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg bg-[#141a24] hover:bg-[#1f2737] border border-[#232d3d] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
              className="bg-[#141a24] border border-[#232d3d] hover:border-zinc-500 rounded-lg px-3 py-1.5 text-sm font-semibold text-white outline-none cursor-pointer"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
              className="bg-[#141a24] border border-[#232d3d] hover:border-zinc-500 rounded-lg px-3 py-1.5 text-sm font-semibold text-white outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg bg-[#141a24] hover:bg-[#1f2737] border border-[#232d3d] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month Total Banner (Square style) */}
        <div className="bg-[#12161f] border border-[#1e2634] rounded-[3px] p-5 mb-6 shadow-md">
          <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
            Month total
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-[#00e676] mt-1">
            {formatCurrency(monthProfit, currency, true)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {daysTraded} {daysTraded === 1 ? 'day' : 'days'} traded · {monthWinRate}% win rate
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-zinc-400 mb-2">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>

        {/* Calendar Grid (Square tiles with micro curves) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
          {cells.map((cell, idx) => {
            const daySessions = sessionsByDay[cell.dateKey] || [];
            const hasSessions = daySessions.length > 0;
            const dayProfit = daySessions.reduce((acc, s) => acc + s.profitLoss, 0);
            const isProfit = dayProfit >= 0;
            const wonSessionsCount = daySessions.filter((s) => s.profitLoss >= 0).length;
            const lostSessionsCount = daySessions.length - wonSessionsCount;
            const isSelected = selectedDay === cell.dateKey;

            return (
              <div
                key={idx}
                onClick={() => hasSessions && setSelectedDay(cell.dateKey)}
                className={`min-h-[80px] sm:min-h-[96px] p-2 rounded-[3px] border flex flex-col justify-between transition-all select-none ${
                  !cell.isCurrentMonth
                    ? 'bg-[#10131a]/40 border-[#181d28]/60 text-zinc-600 opacity-40'
                    : hasSessions
                    ? isProfit
                      ? 'bg-[#0a231b] border-[#00e676]/40 hover:border-[#00e676] shadow-[0_0_12px_rgba(0,230,118,0.12)] cursor-pointer'
                      : 'bg-[#261318] border-[#ff3b57]/40 hover:border-[#ff3b57] shadow-[0_0_12px_rgba(255,59,87,0.12)] cursor-pointer'
                    : 'bg-[#131720] border-[#1e2533] text-zinc-400 hover:border-zinc-700'
                } ${isSelected ? 'ring-2 ring-[#f5a623] scale-[1.02]' : ''}`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${cell.isCurrentMonth ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {cell.dayNum}
                  </span>
                  {hasSessions && (
                    <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-black/40 text-zinc-400">
                      {daySessions.length}s
                    </span>
                  )}
                </div>

                {/* Day Profit / Sessions */}
                {hasSessions && cell.isCurrentMonth ? (
                  <div className="mt-1">
                    <div
                      className={`text-xs sm:text-sm font-black font-mono tracking-tight leading-tight ${
                        isProfit ? 'text-[#00e676]' : 'text-[#ff3b57]'
                      }`}
                    >
                      {formatCurrency(dayProfit, currency, true)}
                    </div>
                    <div className="text-[9px] text-zinc-400 hidden sm:block mt-0.5 leading-tight">
                      {wonSessionsCount}W · {lostSessionsCount}L
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Day Details Panel */}
        {selectedDay && selectedSessions.length > 0 && (
          <div className="mt-8 bg-[#12161f] border border-[#1e2634] rounded-2xl p-5 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2634]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#f5a623] uppercase font-bold">
                  Day Breakdown
                </span>
                <h3 className="text-lg font-bold font-['Chakra_Petch',sans-serif] text-white">
                  {selectedDay}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-zinc-400">Total Profit</div>
                <div
                  className={`text-xl font-mono font-black ${
                    selectedDayTotalProfit >= 0 ? 'text-[#00e676]' : 'text-[#ff3b57]'
                  }`}
                >
                  {formatCurrency(selectedDayTotalProfit, currency, true)}
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {selectedSessions.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#161c28] border border-[#1e2634]"
                >
                  <div>
                    <div className="text-xs font-bold text-white">
                      Session #{s.sessionNumber} ({s.date.split(' ')[2] || 'Time'})
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Won: {s.won} | Lost: {s.lost} | Target: {formatCurrency(s.capitalGoal, currency)}
                    </div>
                  </div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      s.profitLoss >= 0 ? 'text-[#00e676]' : 'text-[#ff3b57]'
                    }`}
                  >
                    {formatCurrency(s.profitLoss, currency, true)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
