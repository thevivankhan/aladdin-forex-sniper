import React, { useState, useRef, useEffect } from 'react';
import { SessionResult, Currency, ShareLayout, ShareTheme } from '../types';
import { formatCurrency } from '../utils/sniperCore';
import { X, Download, Sparkles, Rocket, Globe, Palette } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionResult[];
  currency: Currency;
  traderName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  sessions,
  currency,
  traderName,
}) => {
  const [layout, setLayout] = useState<ShareLayout>('desktop');
  const [theme, setTheme] = useState<ShareTheme>('standard');
  const [customProfit, setCustomProfit] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute stats
  const totalSessions = sessions.length;
  const wonSessions = sessions.filter((s) => s.profitLoss >= 0).length;
  const winRate = totalSessions > 0 ? Math.round((wonSessions / totalSessions) * 100) : 100;
  const autoProfit = sessions.reduce((acc, s) => acc + s.profitLoss, 0) || 114.82;
  const displayProfit = customProfit !== null ? customProfit : autoProfit;

  const endingBal = sessions.length > 0 ? sessions[sessions.length - 1].endingBalance : 2132.41;
  const initBal = sessions.length > 0 ? sessions[0].accountBal : endingBal;
  const accountGainPercent = initBal > 0 ? ((displayProfit / initBal) * 100).toFixed(2) : '10.78';

  const dateStr = 'OCT 27, 2026';

  // Render to canvas
  const drawCardToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 720;
    let height = 440;
    if (layout === 'mobile') {
      width = 400;
      height = 560;
    } else if (layout === 'pnl_only') {
      width = 900;
      height = 400;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw Background based on Theme
    if (theme === 'standard') {
      // Dark Navy with subtle radar circles
      ctx.fillStyle = '#0f141d';
      ctx.fillRect(0, 0, width, height);

      // Radar concentric rings on right
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 2;
      const centerX = width * 0.85;
      const centerY = height * 0.4;
      [70, 140, 220, 310].forEach((r) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });
    } else if (theme === 'retro_future') {
      // Synthwave gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#190a2c');
      grad.addColorStop(0.5, '#2b103e');
      grad.addColorStop(1, '#0e051a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Neon horizon sun glow
      ctx.fillStyle = 'rgba(245, 166, 35, 0.15)';
      ctx.beginPath();
      ctx.arc(width * 0.75, height * 0.35, 120, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'space_rocket') {
      // Space cosmos
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#060b17');
      grad.addColorStop(0.6, '#0b162c');
      grad.addColorStop(1, '#05070f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Star dots
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const x = (i * 97) % width;
        const y = (i * 73) % height;
        ctx.fillRect(x, y, (i % 2) + 1, (i % 2) + 1);
      }
    } else {
      // Cyber Chibi / Pink neon
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1c081e');
      grad.addColorStop(1, '#0c0410');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Outer card rounded border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Header: PocketSniper Logo (Yellow P square + Text)
    // Logo Icon
    ctx.fillStyle = '#f5a623';
    ctx.fillRect(36, 32, 28, 28);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('P', 44, 52);

    // Logo text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Chakra Petch", sans-serif';
    ctx.fillText('PocketSniper', 74, 53);

    // Date
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, width - 36, 52);
    ctx.textAlign = 'left';

    // "TODAY'S PROFIT"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText("TODAY'S PROFIT", 36, 115);

    // Profit Amount (Huge Green Text)
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 54px monospace';
    ctx.fillText(formatCurrency(displayProfit, currency, true), 36, 175);

    // Trader Identity Row (8-bit avatar + Trader name)
    const avatarY = 220;
    ctx.fillStyle = '#1b3d2f';
    ctx.fillRect(36, avatarY, 44, 44);
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 1;
    ctx.strokeRect(36, avatarY, 44, 44);

    // Mini invader
    ctx.fillStyle = '#00e676';
    ctx.fillRect(44, avatarY + 12, 28, 6);
    ctx.fillRect(48, avatarY + 20, 20, 6);
    ctx.fillRect(42, avatarY + 28, 8, 4);
    ctx.fillRect(66, avatarY + 28, 8, 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(traderName || 'Trader ****', 92, avatarY + 20);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '11px sans-serif';
    ctx.fillText('Sniper ID', 92, avatarY + 38);

    // 3 Metric Cards: SESSION WIN RATE | SESSIONS | ACCOUNT GAIN
    const metricsY = 290;
    const cardW = layout === 'mobile' ? (width - 72) / 3 : 160;
    const cardH = 62;

    const metricsData = [
      { label: 'SESSION WIN RATE', val: `${winRate}%`, color: '#ffffff' },
      { label: 'SESSIONS', val: `${totalSessions || 4}`, color: '#ffffff' },
      { label: 'ACCOUNT GAIN', val: `+${accountGainPercent}%`, color: '#00e676' },
    ];

    metricsData.forEach((m, idx) => {
      const cardX = 36 + idx * (cardW + 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(cardX, metricsY, cardW, cardH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(cardX, metricsY, cardW, cardH);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(m.label, cardX + 10, metricsY + 20);

      ctx.fillStyle = m.color;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(m.val, cardX + 10, metricsY + 48);
    });

    // Theme-specific illustrations (Rocket or Cyber art)
    if (theme === 'space_rocket') {
      // Golden rocket
      const rocketX = width - 150;
      const rocketY = 130;
      ctx.fillStyle = '#f5a623';
      ctx.beginPath();
      ctx.moveTo(rocketX, rocketY);
      ctx.lineTo(rocketX + 25, rocketY + 60);
      ctx.lineTo(rocketX - 25, rocketY + 60);
      ctx.closePath();
      ctx.fill();

      // Flame
      ctx.fillStyle = '#ff3b57';
      ctx.beginPath();
      ctx.moveTo(rocketX - 15, rocketY + 60);
      ctx.lineTo(rocketX, rocketY + 100);
      ctx.lineTo(rocketX + 15, rocketY + 60);
      ctx.closePath();
      ctx.fill();
    }

    // Bottom Footer with QR Code and Pocket Option CTA
    const footerY = height - 60;
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText('Level up your Pocket Option trading.', 36, footerY + 16);

    ctx.fillStyle = '#f5a623';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Get PocketSniper →', 36, footerY + 36);

    // QR Code on right
    const qrSize = 54;
    const qrX = width - qrSize - 36;
    const qrY = height - qrSize - 20;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
    ctx.fillStyle = '#000000';
    // Draw simulated QR matrix
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if ((r + c * 3) % 2 === 0 || (r === 0 && c === 0) || (r === 6 && c === 0) || (r === 0 && c === 6)) {
          ctx.fillRect(qrX + c * (qrSize / 7), qrY + r * (qrSize / 7), qrSize / 7 - 1, qrSize / 7 - 1);
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawCardToCanvas, 50);
    }
  }, [isOpen, layout, theme, displayProfit, traderName, currency]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pocketsniper-profit-${dateStr.toLowerCase().replace(/[\s,]+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal (Square shape with micro curves) */}
      <div className="relative w-full max-w-xl bg-[#12161f] border border-[#232d3d] rounded-[3px] p-5 text-white shadow-2xl z-10 max-h-[90vh] overflow-y-auto font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2634]">
          <h2 className="text-lg font-bold text-white font-['Chakra_Petch',sans-serif]">Share your day</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout Selector */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-zinc-400 mb-2 font-mono">Layout</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setLayout('desktop')}
              className={`py-2 px-3 rounded-[3px] text-xs font-semibold font-mono transition-colors border cursor-pointer ${
                layout === 'desktop'
                  ? 'bg-[#1e2738] border-[#f5a623] text-white'
                  : 'bg-[#151a24] border-[#222b3b] text-zinc-400 hover:text-white'
              }`}
            >
              Desktop (720w)
            </button>
            <button
              onClick={() => setLayout('mobile')}
              className={`py-2 px-3 rounded-[3px] text-xs font-semibold font-mono transition-colors border cursor-pointer ${
                layout === 'mobile'
                  ? 'bg-[#1e2738] border-[#f5a623] text-white'
                  : 'bg-[#151a24] border-[#222b3b] text-zinc-400 hover:text-white'
              }`}
            >
              Mobile (400w)
            </button>
            <button
              onClick={() => setLayout('pnl_only')}
              className={`py-2 px-3 rounded-[3px] text-xs font-semibold font-mono transition-colors border cursor-pointer ${
                layout === 'pnl_only'
                  ? 'bg-[#1e2738] border-[#f5a623] text-white'
                  : 'bg-[#151a24] border-[#222b3b] text-zinc-400 hover:text-white'
              }`}
            >
              PNL only (900w)
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-zinc-400 mb-2 font-mono">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ShareTheme)}
            className="w-full bg-[#151a24] border border-[#232d3d] rounded-[3px] px-3 py-2 text-xs font-mono font-medium text-white outline-none cursor-pointer"
          >
            <option value="standard">Standard (Tactical Dark)</option>
            <option value="retro_future">Retro Future (Synthwave Neon)</option>
            <option value="space_rocket">Space Rocket (Cosmos Mission)</option>
            <option value="cyber_chibi">Cyber Chibi (Angela's Graffiti)</option>
          </select>
        </div>

        {/* Live Canvas Preview */}
        <div className="mt-5 flex justify-center bg-black/40 rounded-[3px] p-3 border border-[#1e2634] overflow-x-auto">
          <canvas
            ref={canvasRef}
            className="rounded-[3px] shadow-2xl max-w-full h-auto"
            style={{ maxHeight: '320px' }}
          />
        </div>

        {/* Download & Close */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleDownload}
            className="w-full bg-[#f5a623] hover:bg-[#ffb020] text-black font-bold py-3 px-4 rounded-[3px] text-xs uppercase tracking-wider font-mono transition-all shadow-[0_4px_16px_rgba(245,166,35,0.3)] active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-mono"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
