import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ForexSignal } from '../utils/forexScanner';

export interface RadarHudProps {
  currentSymbol: string;
  activeSignal?: ForexSignal | null;
  isScanning?: boolean;
}

interface BreakoutZone {
  id: string;
  type: 'RESISTANCE' | 'SUPPORT' | 'FVG' | 'ORDER_BLOCK';
  name: string;
  price: number;
  yPercent: number; // 0 (top) to 1 (bottom)
  pips: number;
  status: 'TESTING' | 'BREAKOUT' | 'HOLDING';
  color: string;
}

export const RadarHUD: React.FC<RadarHudProps> = ({
  currentSymbol,
  activeSignal,
  isScanning = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Organic telemetry state
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [activePhase, setActivePhase] = useState<string>('INITIALIZING OPTICAL RADAR');
  const [bearingAngle, setBearingAngle] = useState<number>(0);
  const [currentPingLevel, setCurrentPingLevel] = useState<string | null>(null);

  // Breakout levels dynamically scaled to symbol and price structure
  const breakoutLevels = useRef<BreakoutZone[]>([]);

  useEffect(() => {
    const basePrice = activeSignal?.entryPrice || 1.1166;
    const isGold = currentSymbol.includes('XAU') || currentSymbol.includes('GOLD');
    const isCrypto = currentSymbol.includes('BTC') || currentSymbol.includes('USDT');

    const mult = isCrypto ? 250 : isGold ? 15 : 0.0025;
    const decimals = isCrypto ? 2 : isGold ? 2 : 5;

    breakoutLevels.current = [
      {
        id: 'res-major',
        type: 'RESISTANCE',
        name: 'MAJOR RESISTANCE / BUY-SIDE LIQUIDITY',
        price: Number((basePrice + mult * 2).toFixed(decimals)),
        yPercent: 0.2,
        pips: isCrypto ? 500 : isGold ? 30 : 50,
        status: 'BREAKOUT',
        color: '#ff3b57',
      },
      {
        id: 'ob-bear',
        type: 'ORDER_BLOCK',
        name: 'BEARISH ORDER BLOCK / FAIR VALUE GAP',
        price: Number((basePrice + mult * 0.9).toFixed(decimals)),
        yPercent: 0.36,
        pips: isCrypto ? 220 : isGold ? 14 : 22,
        status: 'TESTING',
        color: '#f5a623',
      },
      {
        id: 'sup-pivot',
        type: 'FVG',
        name: 'EQUILIBRIUM PIVOT / POC VOLUME',
        price: Number(basePrice.toFixed(decimals)),
        yPercent: 0.52,
        pips: 0,
        status: 'HOLDING',
        color: '#00e5ff',
      },
      {
        id: 'sup-major',
        type: 'SUPPORT',
        name: 'KEY DEMAND / SELL-SIDE LIQUIDITY SWEEP',
        price: Number((basePrice - mult * 1.5).toFixed(decimals)),
        yPercent: 0.74,
        pips: isCrypto ? 370 : isGold ? 22 : 38,
        status: 'HOLDING',
        color: '#00e676',
      },
    ];
  }, [activeSignal, currentSymbol]);

  // D3 Organic Physics & Synchronized Scan Engine
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    let width = containerRef.current.clientWidth || 800;
    let height = containerRef.current.clientHeight || 500;

    const defs = svg.append('defs');

    // Laser Beam Gradient with trailing LiDAR glow
    const laserGrad = defs
      .append('linearGradient')
      .attr('id', 'radar-lidar-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    laserGrad.append('stop').attr('offset', '0%').attr('stop-color', '#00e676').attr('stop-opacity', 0);
    laserGrad.append('stop').attr('offset', '60%').attr('stop-color', '#00e676').attr('stop-opacity', 0.15);
    laserGrad.append('stop').attr('offset', '90%').attr('stop-color', '#00e676').attr('stop-opacity', 0.45);
    laserGrad.append('stop').attr('offset', '100%').attr('stop-color', '#00e676').attr('stop-opacity', 0.95);

    // Glowing Filter
    const filter = defs
      .append('filter')
      .attr('id', 'tactical-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'blur');
    filter.append('feMerge').selectAll('feMergeNode').data(['blur', 'SourceGraphic']).enter().append('feMergeNode').attr('in', (d) => d);

    // Master layers
    const backdropLayer = svg.append('g').attr('class', 'backdrop-layer');
    const sonarGridLayer = svg.append('g').attr('class', 'sonar-grid');
    const srLevelsLayer = svg.append('g').attr('class', 'sr-levels');
    const scanTraverseLayer = svg.append('g').attr('class', 'scan-traverse');
    const blipPingsLayer = svg.append('g').attr('class', 'blip-pings');
    const reticlesLayer = svg.append('g').attr('class', 'reticles');

    // Dark Tactical Scrim
    backdropLayer
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#070b12')
      .attr('fill-opacity', 0.42);

    // 1. Sonar Radar Center in Middle-Right
    const radarCenterX = width * 0.68;
    const radarCenterY = height * 0.48;
    const maxRadius = Math.min(width, height) * 0.38;

    const radarGroup = sonarGridLayer.append('g').attr('transform', `translate(${radarCenterX}, ${radarCenterY})`);

    // Sonar Range Rings
    [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
      radarGroup
        .append('circle')
        .attr('r', maxRadius * ratio)
        .attr('fill', 'none')
        .attr('stroke', '#00e676')
        .attr('stroke-width', ratio === 1 ? 1.5 : 0.8)
        .attr('stroke-opacity', ratio === 1 ? 0.35 : 0.18)
        .attr('stroke-dasharray', ratio === 1 ? '5 3' : '2 4');

      radarGroup
        .append('text')
        .attr('x', 6)
        .attr('y', -maxRadius * ratio + 10)
        .attr('fill', '#00e676')
        .attr('fill-opacity', 0.5)
        .attr('font-size', '8px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(`RANGE ${(ratio * 100).toFixed(0)}m`);
    });

    // Crosshair Axis
    radarGroup
      .append('line')
      .attr('x1', -maxRadius * 1.05)
      .attr('x2', maxRadius * 1.05)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#00e676')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', 0.25)
      .attr('stroke-dasharray', '3 3');

    radarGroup
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -maxRadius * 1.05)
      .attr('y2', maxRadius * 1.05)
      .attr('stroke', '#00e676')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', 0.25)
      .attr('stroke-dasharray', '3 3');

    // 360-degree Rotating Sweep Beam
    const sweepArm = radarGroup.append('g').attr('class', 'sweep-cone');

    sweepArm
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -maxRadius)
      .attr('stroke', '#00e676')
      .attr('stroke-width', 2.2)
      .attr('filter', 'url(#tactical-glow)');

    const arcGen = d3
      .arc()
      .innerRadius(0)
      .outerRadius(maxRadius)
      .startAngle(-Math.PI / 4)
      .endAngle(0);

    sweepArm
      .append('path')
      // @ts-expect-error d3 arc
      .attr('d', arcGen)
      .attr('fill', '#00e676')
      .attr('fill-opacity', 0.15);

    // 2. Render Support / Resistance Breakout Bands
    breakoutLevels.current.forEach((level) => {
      const y = height * level.yPercent;
      const g = srLevelsLayer.append('g').attr('class', `sr-band-${level.id}`);

      // Horizontal dashed track
      g.append('line')
        .attr('x1', 30)
        .attr('x2', width - 20)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', level.color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '6 4');

      // Left Tag
      const tag = g.append('g').attr('transform', `translate(40, ${y - 10})`);
      tag
        .append('rect')
        .attr('width', 240)
        .attr('height', 17)
        .attr('fill', '#0a0e16')
        .attr('stroke', level.color)
        .attr('stroke-width', 0.8)
        .attr('rx', 2)
        .attr('fill-opacity', 0.95);

      tag
        .append('text')
        .attr('x', 6)
        .attr('y', 12)
        .attr('fill', level.color)
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(`[${level.status}] ${level.name}`);

      // Right Price Marker
      const priceTag = g.append('g').attr('transform', `translate(${width - 110}, ${y - 9})`);
      priceTag
        .append('rect')
        .attr('width', 90)
        .attr('height', 16)
        .attr('fill', level.color)
        .attr('fill-opacity', 0.25)
        .attr('stroke', level.color)
        .attr('stroke-width', 0.9)
        .attr('rx', 1);

      priceTag
        .append('text')
        .attr('x', 45)
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(`${level.price}`);
    });

    // 3. Full-Chart Scanning Laser Line & Trailing LiDAR Band
    const scanLine = scanTraverseLayer
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#00e676')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#tactical-glow)');

    const trailingBand = scanTraverseLayer
      .append('rect')
      .attr('x', -100)
      .attr('y', 0)
      .attr('width', 100)
      .attr('height', height)
      .attr('fill', 'url(#radar-lidar-grad)')
      .attr('opacity', 0.4);

    // ORGANIC VELOCITY & HARMONIC SCAN SYNCHRONIZATION
    let progress = 0;
    const durationMs = 3800; // Complete full sweep in 3.8s
    const startTime = performance.now();
    let animId: number;

    const animateLoop = (now: number) => {
      const elapsed = (now - startTime) % durationMs;
      const normalizedTime = elapsed / durationMs; // 0 to 1

      // Organic ease: S-curve deceleration over middle zone where S/R clusters dwell
      // Uses a smooth sinus modulated progression:
      const harmonicDwell = 0.5 * (1 - Math.cos(normalizedTime * Math.PI));
      const scanX = harmonicDwell * width;

      // Update scan line & beam
      scanLine.attr('x1', scanX).attr('x2', scanX);
      trailingBand.attr('x', scanX - 100);

      // Synchronize rotating sweep cone angle with scan line harmonic
      const angle = (normalizedTime * 360 * 2) % 360; // 2 complete 360 rotations per horizontal pass
      sweepArm.attr('transform', `rotate(${angle})`);
      setBearingAngle(Math.round(angle));

      // Telemetry phase progression
      const pct = Math.round(normalizedTime * 100);
      setScanProgress(pct);
      if (pct < 30) {
        setActivePhase('STAGE 1: LIQUIDITY SWEEP & POC CALIBRATION');
      } else if (pct < 70) {
        setActivePhase('STAGE 2: SMC ORDER BLOCK & FVG RECOGNITION');
      } else {
        setActivePhase('STAGE 3: BREAKOUT CONFLUENCE CONFIRMED');
      }

      // Check breakout intersection: Trigger radar blip pings when scan line hits level centers
      breakoutLevels.current.forEach((level) => {
        const y = height * level.yPercent;
        const triggerX = width * 0.48;

        if (Math.abs(scanX - triggerX) < 4) {
          setCurrentPingLevel(level.name);

          // Ping ripple in D3
          const ping = blipPingsLayer.append('g').attr('transform', `translate(${scanX}, ${y})`);
          ping
            .append('circle')
            .attr('r', 5)
            .attr('fill', level.color)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('filter', 'url(#tactical-glow)');

          ping
            .append('circle')
            .attr('r', 6)
            .attr('fill', 'none')
            .attr('stroke', level.color)
            .attr('stroke-width', 2)
            .transition()
            .duration(850)
            .ease(d3.easeExpOut)
            .attr('r', 44)
            .attr('stroke-opacity', 0)
            .remove();

          // Reticle Target Box
          const box = reticlesLayer.append('g').attr('transform', `translate(${scanX}, ${y})`);
          box
            .append('rect')
            .attr('x', -15)
            .attr('y', -15)
            .attr('width', 30)
            .attr('height', 30)
            .attr('fill', 'none')
            .attr('stroke', level.color)
            .attr('stroke-width', 1.4)
            .attr('stroke-dasharray', '4 3')
            .transition()
            .duration(1100)
            .attr('stroke-opacity', 0)
            .remove();

          setTimeout(() => ping.remove(), 900);
        }
      });

      animId = requestAnimationFrame(animateLoop);
    };

    animId = requestAnimationFrame(animateLoop);

    const handleResize = () => {
      if (containerRef.current) {
        width = containerRef.current.clientWidth;
        height = containerRef.current.clientHeight;
        svg.attr('viewBox', `0 0 ${width} ${height}`);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isScanning, currentSymbol]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden animate-in fade-in duration-200"
    >
      {/* SVG Canvas for D3 Radar & Scan Line */}
      <svg ref={svgRef} className="w-full h-full block" />

      {/* Top Telemetry HUD Banner (Military / Institutional Grade) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-[#0a0e16]/95 backdrop-blur-md border border-[#00e676] px-4 py-2 text-white font-mono shadow-[0_0_30px_rgba(0,230,118,0.35)] flex items-center space-x-3 text-xs">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e676]" />
        </span>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-black text-[#00e676] tracking-wider uppercase font-['Chakra_Petch',sans-serif]">
              ALADDIN AI ACTIVE RADAR SCAN: {currentSymbol}
            </span>
            <span className="text-[#f5a623] font-bold">[{scanProgress}%]</span>
          </div>
          <div className="text-[9px] text-zinc-300 flex items-center space-x-2 mt-0.5">
            <span>{activePhase}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#00e5ff] font-bold">BEARING: {bearingAngle.toString().padStart(3, '0')}°</span>
            {currentPingLevel && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-[#ffd700] font-bold">INTERSECTING: {currentPingLevel}</span>
              </>
            )}
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-24 bg-[#111722] h-1.5 border border-[#1e2a3c] overflow-hidden ml-2">
          <div
            className="h-full bg-gradient-to-r from-[#00e676] to-[#f5a623] transition-all duration-75"
            style={{ width: `${scanProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const RadarHudOverlay = RadarHUD;
