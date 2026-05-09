import React, { useState, useEffect, useRef } from 'react';
import './Loader.css';

const TERMINAL_LINES = [
  { prefix: '>', text: 'Connecting to FFZone servers...',  delay: 0    },
  { prefix: '>', text: 'Authenticating session...',        delay: 600  },
  { prefix: '>', text: 'Loading tournament data...',       delay: 1300 },
  { prefix: '✓', text: 'Player profile synced.',           delay: 2000 },
  { prefix: '✓', text: 'Battlefield ready.',               delay: 2700 },
];

const GAMING_TIPS = [
  { prefix: 'TIP', text: 'Always check the map before dropping into a zone.' },
  { prefix: 'PRO', text: 'Crouch while shooting for better accuracy.' },
  { prefix: 'TIP', text: 'Loot fast, move faster. Time is your enemy.' },
  { prefix: 'PRO', text: 'High ground always gives you the advantage.' },
  { prefix: 'TIP', text: 'Use headphones — footsteps can save your life.' },
  { prefix: 'PRO', text: 'Manage your ammo. Never run dry mid-fight.' },
];

// ── Detect low-end / mobile device ──────────────────────────────────────────
const isMobile = () => window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

// ── Hex Grid Canvas Background ──────────────────────────────────────────────
const HexGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    const mobile = isMobile();

    // ── Config — lighter on mobile ──
    const HEX_SIZE   = mobile ? 42  : 28;    // bigger hexes = fewer draw calls
    const GAP        = mobile ? 4   : 3;
    const GLOW_CHANCE= mobile ? 0.002 : 0.003;
    const GLOW_SPEED = mobile ? 0.04  : 0.025;
    const USE_SHADOW = !mobile;               // shadowBlur OFF on mobile

    const COLORS = {
      base:        'rgba(0, 245, 255, 0.04)',
      border:      'rgba(0, 245, 255, 0.12)',
      glowFill:    'rgba(0, 245, 255, 0.18)',
      glowBorder:  'rgba(0, 245, 255, 0.9)',
      orangeFill:  'rgba(255, 107, 0, 0.12)',
      orangeBorder:'rgba(255, 107, 0, 0.7)',
    };

    let animId;
    let hexes = [];

    const resize = () => {
      // Cap pixel ratio at 1 on mobile to halve GPU work
      const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      buildGrid();
    };

    // flat-top hexagon points
    const hexPoints = (cx, cy, r) => {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i);
        pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
      }
      return pts;
    };

    const drawHex = (pts, fillColor, strokeColor, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle   = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const buildGrid = () => {
      hexes = [];
      const w  = window.innerWidth;
      const h  = window.innerHeight;
      const r  = HEX_SIZE;
      const dx = (r + GAP) * 2;
      const dy = Math.sqrt(3) * (r + GAP);

      const cols = Math.ceil(w / dx) + 2;
      const rows = Math.ceil(h / dy) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * dx + (row % 2 === 0 ? 0 : dx / 2);
          const cy = row * dy;
          hexes.push({
            cx, cy,
            pts: hexPoints(cx, cy, r - GAP / 2),
            glow:    0,
            glowDir: 1,
            orange:  Math.random() < 0.04,
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      hexes.forEach(hex => {
        // randomly trigger glow
        if (hex.glow === 0 && Math.random() < GLOW_CHANCE) {
          hex.glow    = 0.01;
          hex.glowDir = 1;
        }

        // step glow
        if (hex.glow > 0) {
          hex.glow += hex.glowDir * GLOW_SPEED;
          if (hex.glow >= 1) { hex.glow = 1; hex.glowDir = -1; }
          if (hex.glow <= 0) { hex.glow = 0; hex.glowDir =  1; }
        }

        if (hex.glow > 0) {
          const fill   = hex.orange ? COLORS.orangeFill   : COLORS.glowFill;
          const border = hex.orange ? COLORS.orangeBorder : COLORS.glowBorder;
          drawHex(hex.pts, fill, border, hex.glow * 0.9 + 0.1);

          // shadow glow — desktop only
          if (USE_SHADOW && hex.glow > 0.3) {
            ctx.save();
            ctx.globalAlpha = hex.glow * 0.25;
            ctx.shadowColor = hex.orange ? '#ff6b00' : '#00f5ff';
            ctx.shadowBlur  = 18;
            ctx.beginPath();
            ctx.moveTo(hex.pts[0][0], hex.pts[0][1]);
            for (let i = 1; i < 6; i++) ctx.lineTo(hex.pts[i][0], hex.pts[i][1]);
            ctx.closePath();
            ctx.strokeStyle = hex.orange ? COLORS.orangeBorder : COLORS.glowBorder;
            ctx.lineWidth   = 1.5;
            ctx.stroke();
            ctx.restore();
          }
        } else {
          drawHex(hex.pts, COLORS.base, COLORS.border, 1);
        }
      });

      animId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
};

// ── Main PageLoader ──────────────────────────────────────────────────────────
const PageLoader = () => {
  const [progress, setProgress]         = useState(0);
  const [visibleLines, setVisibleLines] = useState([]);
  const [tipIndex, setTipIndex]         = useState(0);

  // Smooth progress bar 0 → 100 over ~3s
  useEffect(() => {
    const start = performance.now();
    const duration = 3200;
    const tick = (now) => {
      const p = Math.min(((now - start) / duration) * 100, 100);
      setProgress(Math.floor(p));
      if (p < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Reveal terminal lines one by one
  useEffect(() => {
    const timers = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i]);
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Cycle tips
  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex(prev => (prev + 1) % GAMING_TIPS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const currentTip = GAMING_TIPS[tipIndex];

  return (
    <div className="gaming-loader-overlay">

      {/* ── HEX GRID BACKGROUND ── */}
      <HexGrid />

      {/* ── HUD CORNERS ── */}
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* ── CROSSHAIR ── */}
      <div className="crosshair-container">
        <div className="crosshair-ring crosshair-ring-1" />
        <div className="crosshair-ring crosshair-ring-2" />
        <div className="crosshair-ring crosshair-ring-3" />
        <div className="crosshair-arc" />
        <div className="crosshair-arc-reverse" />
        <div className="crosshair-lines">
          <div className="crosshair-line crosshair-line-h" />
          <div className="crosshair-line crosshair-line-v" />
        </div>
        <div className="crosshair-corner crosshair-corner-tl" />
        <div className="crosshair-corner crosshair-corner-tr" />
        <div className="crosshair-corner crosshair-corner-bl" />
        <div className="crosshair-corner crosshair-corner-br" />
        <div className="crosshair-dot" />
      </div>

      {/* ── GLITCH TITLE ── */}
      <div className="glitch-wrapper">
        <div className="glitch-text" data-text="FFZONE">FFZONE</div>
      </div>

      {/* ── NEON PROGRESS BAR ── */}
      <div className="progress-bar-wrap">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          {/* moving shine */}
          <div className="progress-bar-shine" style={{ left: `${progress}%` }} />
        </div>
        <div className="progress-bar-labels">
          <span className="progress-bar-pct">{progress}<span>%</span></span>
          <span className="progress-bar-status">
            {progress < 100 ? 'LOADING...' : 'READY'}
          </span>
        </div>
      </div>

      {/* ── TERMINAL LINES ── */}
      <div className="terminal-box">
        {TERMINAL_LINES.map((line, i) => (
          <div
            key={i}
            className={`terminal-line ${visibleLines.includes(i) ? 'terminal-line--visible' : ''} ${line.prefix === '✓' ? 'terminal-line--ok' : ''}`}
          >
            <span className="terminal-prefix">{line.prefix}</span>
            <span className="terminal-text">{line.text}</span>
            {/* blinking cursor on last visible line */}
            {visibleLines[visibleLines.length - 1] === i && progress < 100 && (
              <span className="terminal-cursor" />
            )}
          </div>
        ))}
      </div>

      {/* ── GAMING TIP ── */}
      <div key={tipIndex} className="gaming-tip">
        <span>{currentTip.prefix}</span> {currentTip.text}
      </div>
    </div>
  );
};

export default PageLoader;
