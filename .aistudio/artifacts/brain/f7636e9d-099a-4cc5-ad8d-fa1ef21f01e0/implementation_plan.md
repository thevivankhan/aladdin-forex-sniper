# Aladdin Forex Sniper (अलादीन फॉरेक्स स्नाइपर) — Live Forex & Gold Signal Generator

A precision Forex and Gold market scanner and real-time signal generation application built on top of high-performance TradingView charts, technical confluence engines, and tactical trading execution HUDs.

## User Review & Critical Decisions

> [!IMPORTANT]
> The transition from binary options to **Aladdin Forex Sniper** repositions the app into an automated Forex & Gold scanner. The redundant mini chart inside the floating Trade Manager will be eliminated to restore maximum screen real estate, while the full-screen background TradingView chart becomes the primary operational canvas with live signal scanning overlays.

- **Confirmed Decision 1 (Signal Confluence Engine)**: Technical indicators with price action confluence (multi-timeframe EMA 20/50/200 crossover, RSI momentum boundaries, MACD histogram divergence, and dynamic Support/Resistance breakout detection).
- **Confirmed Decision 2 (Target Asset Pairs)**: Real-time scanner priority focused on Major Forex Pairs and Gold (`EUR/USD`, `GBP/USD`, `USD/JPY`, `AUD/USD`, `USD/CAD`, `USD/CHF`, `NZD/USD`, and `XAU/USD`).
- **Confirmed Decision 3 (Signal Delivery & Presentation)**: Floating Sniper HUD displaying real-time Entry Price, Take Profit 1/2/3, Stop Loss, Risk-to-Reward ratio, Confidence Meter, and high-clarity voice announcements.
- **Confirmed Decision 4 (Mini Chart Removal)**: Complete removal of the secondary mini chart inside the Trade Manager window to eliminate clutter and give 100% focus to the main live TradingView chart.

---

## 1. Overview & Core Concept

- **What It Does**: Scans live global Forex currency pairs and commodities (Gold XAU/USD) using algorithmic confluence models. Generates real-time high-probability BUY (LONG) and SELL (SHORT) signals complete with precise entry points, invalidation stop losses, tiered profit targets, and live market trend radar.
- **Target Audience / Persona**: Forex day-traders, scalpers, and technical analysts who demand rapid execution, zero fluff, verified entry/exit levels, and audible signals without taking their eyes off the chart.
- **Key Value**: Replaces guesswork and cluttered sub-charts with an ultra-clean, full-screen professional TradingView environment coupled with an intelligent floating HUD and voice alerts.

---

## 2. User Experience & Visual Design

### A. Layout & Canvas Architecture
- **Full-Screen Master Chart**: The background is a full-bleed, responsive dark-mode TradingView terminal (`bg-[#070b12]`) featuring the active Forex pair or Gold, complete with drawing tools, timeframe switches (1m, 5m, 15m, 1h, 4h, 1D), and candlestick precision.
- **Draggable Aladdin Sniper HUD**:
  - Compact, high-tech tactical floating panel that can be positioned anywhere across desktop or mobile screens.
  - **Header**: Live Aladdin Forex branding (`ALAADDIN FOREX SNIPER` with glowing emerald/amber crest), quick pair selector pills (`EUR/USD`, `GBP/USD`, `XAU/USD`, etc.), and active scanning pulse indicator.
  - **Scanner Radar & Signal Card**:
    - Current Signal (`STRONG BUY` / `STRONG SELL` / `NEUTRAL SCANNING`).
    - Entry Price, Stop Loss (SL), Take Profit 1 (Conservative), Take Profit 2 (Optimal), Take Profit 3 (Runner).
    - Calculated Risk-to-Reward (e.g., `1 : 2.5`) and Confidence Score (e.g., `92% Confluence`).
    - Quick "Copy Levels" button for one-tap execution into MetaTrader 4/5 or broker platforms.
  - **Live Confluence Breakdown**: Clean indicators matrix showing RSI status, Trend Alignment (EMA), and Momentum (MACD) without chart clutter.
  - **Trade Manager**: Lot size calculator, risk percentage slider (1%–5%), and session profit/loss tracking.

### B. Visual Identity & Color Palette
- **Backgrounds**: Deep Obsidian `#070b12`, Tactical HUD `#0d121b`, Borders `#1e2a3c`.
- **Accents**:
  - Forex Bullish / Long: Electric Emerald `#00e676` (with `rgba(0, 230, 118, 0.2)` glow).
  - Forex Bearish / Short: Precision Crimson `#ff3b57` (with `rgba(255, 59, 87, 0.2)` glow).
  - Aladdin Brand & Gold / XAU: Imperial Gold `#f5a623` and `#ffd700`.
- **Typography**: Monospace tabular numerals (`font-mono`) for all prices, pips, and ratios to prevent visual layout shifts.

### C. Audio & Tactical Feedback
- **Voice Announcements**: "Aladdin Signal: Buy EUR/USD. Entry at 1.0845. Target 1.0890."
- **Audio Chimes**: Distinct sci-fi acoustic sweeps on signal discovery, target hit, and pair shift.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Removal of Mini Chart in Trade Manager**:
  - *Chosen Approach*: Completely unmount and delete `MiniSimulatedChart` from the Trade Manager component.
  - *Why*: The mini chart duplicated data, consumed heavy iframe memory, and distracted from the master chart. Removing it dramatically improves mobile responsiveness and allows the HUD to showcase signal parameters (SL/TP/Pips) clearly.
- **Decision 2: Live Forex Technical Confluence Scanner**:
  - *Chosen Approach*: Algorithmic multi-factor scanner simulating and evaluating real-time Forex tick oscillations and price action boundaries (EMA 20/50 cross, RSI oversold/overbought pullback, ATR volatility bands, and Pivot levels).
  - *Why*: Provides reliable, zero-latency signals across all major pairs without requiring expensive external broker API keys or brittle WebSocket scrapers.
- **Decision 3: Universal MT4/MT5 Copy Utility**:
  - *Chosen Approach*: Built-in one-tap clipboard copy for Entry, SL, and TP levels with pip calculations.
  - *Why*: Allows traders to immediately paste exact levels into their Forex trading terminal without manual math.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      ALADDIN FOREX SNIPER ENGINE                       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────┐                         ┌───────────────────────┐
│  TradingView Master   │                         │  Aladdin Signal Engine│
│  Full-Screen Terminal │                         │  Confluence Scanner   │
│  • FX: EUR/USD, GBP/USD│                         │  • EMA 20/50/200 Trend│
│  • Metals: XAU/USD    │                         │  • RSI 14 Momentum    │
│  • Interactive Tools  │                         │  • ATR & Dynamic Pips │
└───────────────────────┘                         └───────────────────────┘
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DRAGGABLE TACTICAL SNIPER HUD                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Header: Pair Selector • Active Scanner Radar (Scan Pulse 🟢)       │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ Signal Card: [BUY / SELL] • Entry • TP1 / TP2 / TP3 • Stop Loss   │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ Risk & Lot Calculator: Account Size • Risk % • Stop Pips • Lot Size│ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ Confluence Matrix: EMA Bullish • RSI 58 • Volume Expansion        │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ Voice & Audio Controller: Spoken Alerts • Mechanical Chimes        │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Lifecycle:
1. **Asset Selection**: Selecting a pair (`EUR/USD`, `GBP/USD`, `USD/JPY`, `XAU/USD`, etc.) updates both the background TradingView chart symbol (`FX:EURUSD`, `OANDA:XAUUSD`, etc.) and the Scanner Radar.
2. **Scanner Loop**: The engine evaluates real-time prices against confluence rules every few seconds, generating signals when threshold conditions align.
3. **Audio Dispatch**: On signal trigger, `soundController.speak()` announces the setup and plays the tactical alert.
4. **Lot Size Calculation**: User inputs account balance and risk % to calculate recommended Forex lot sizes dynamically based on Stop Loss pips.
