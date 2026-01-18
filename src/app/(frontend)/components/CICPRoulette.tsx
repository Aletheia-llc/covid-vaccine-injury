'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

const CONFIG = {
  cicp: {
    chance: 0.003,      // 0.3% = 42/14,046
    name: 'CICP',
    odds: '0.3%',
    degreesWin: 1.08    // 0.3% of 360°
  },
  vicp: {
    chance: 0.48,       // ~48% historical approval
    name: 'VICP',
    odds: '~48%',
    degreesWin: 172.8   // 48% of 360°
  }
};

interface GameState {
  mode: 'cicp' | 'vicp';
  attempts: number;
  wins: number;
  isSpinning: boolean;
  chamberPosition: number;
  lastResult: 'win' | 'lose' | null;
  showResult: boolean;
}

const CICPRoulette: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    mode: 'cicp',
    attempts: 0,
    wins: 0,
    isSpinning: false,
    chamberPosition: 0,
    lastResult: null,
    showResult: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    angle: number;
    spin: number;
  }>>([]);
  const animationRef = useRef<number | null>(null);

  const config = CONFIG[gameState.mode];

  // Confetti animation
  const createConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colors = ['#2d5a3d', '#3d7a52', '#c4a052', '#fff', '#8fcea3'];
    confettiRef.current = [];

    for (let i = 0; i < 100; i++) {
      confettiRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.2 - 0.1
      });
    }

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let stillActive = false;

      confettiRef.current.forEach(piece => {
        if (piece.y < canvas.height + 50) {
          stillActive = true;
          piece.y += piece.speed;
          piece.x += Math.sin(piece.angle) * 1.5;
          piece.angle += piece.spin;

          ctx.save();
          ctx.translate(piece.x, piece.y);
          ctx.rotate(piece.angle);
          ctx.fillStyle = piece.color;
          ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
          ctx.restore();
        }
      });

      if (stillActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  }, []);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const setMode = (mode: 'cicp' | 'vicp') => {
    if (gameState.isSpinning || gameState.mode === mode) return;
    setGameState(prev => ({
      ...prev,
      mode,
      attempts: 0,
      wins: 0,
      lastResult: null,
      showResult: false,
    }));
  };

  const toggleMode = () => {
    if (gameState.isSpinning) return;
    setMode(gameState.mode === 'cicp' ? 'vicp' : 'cicp');
  };

  const pullTrigger = useCallback(() => {
    if (gameState.isSpinning) return;

    setGameState(prev => ({
      ...prev,
      isSpinning: true,
      showResult: false,
    }));

    // Determine result
    const currentConfig = CONFIG[gameState.mode];
    const won = Math.random() < currentConfig.chance;

    // Calculate wheel rotation
    let targetGradientPosition;
    if (won) {
      targetGradientPosition = Math.random() * currentConfig.degreesWin;
    } else {
      targetGradientPosition = currentConfig.degreesWin + Math.random() * (360 - currentConfig.degreesWin);
    }

    const targetRotation = (360 - targetGradientPosition) % 360;
    const currentRotation = gameState.chamberPosition % 360;
    const spinsToAdd = 720 + Math.floor(Math.random() * 2) * 360;

    let rotationNeeded = targetRotation - currentRotation;
    if (rotationNeeded < 0) rotationNeeded += 360;

    const newPosition = gameState.chamberPosition + spinsToAdd + rotationNeeded;

    setGameState(prev => ({
      ...prev,
      chamberPosition: newPosition,
    }));

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        wins: prev.wins + (won ? 1 : 0),
        isSpinning: false,
        lastResult: won ? 'win' : 'lose',
        showResult: true,
      }));

      if (won) {
        createConfetti();
      }
    }, 2000);
  }, [gameState.isSpinning, gameState.chamberPosition, gameState.mode, createConfetti]);

  const rapidFire = useCallback(() => {
    if (gameState.isSpinning) return;

    setGameState(prev => ({
      ...prev,
      isSpinning: true,
      showResult: false,
    }));

    const currentConfig = CONFIG[gameState.mode];
    let rapidWins = 0;

    for (let i = 0; i < 50; i++) {
      if (Math.random() < currentConfig.chance) {
        rapidWins++;
      }
    }

    const newPosition = gameState.chamberPosition + 1800 + Math.random() * 720;

    setGameState(prev => ({
      ...prev,
      chamberPosition: newPosition,
    }));

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        attempts: prev.attempts + 50,
        wins: prev.wins + rapidWins,
        isSpinning: false,
        lastResult: rapidWins > 0 ? 'win' : 'lose',
        showResult: true,
      }));

      if (rapidWins > 0 && gameState.mode === 'vicp') {
        createConfetti();
      }
    }, 2000);
  }, [gameState.isSpinning, gameState.chamberPosition, gameState.mode, createConfetti]);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      attempts: 0,
      wins: 0,
      chamberPosition: 0,
      lastResult: null,
      showResult: false,
    }));
  };

  const shareResult = () => {
    const yourRate = gameState.attempts > 0 ? ((gameState.wins / gameState.attempts) * 100).toFixed(0) : '0';
    let text;

    if (gameState.mode === 'cicp') {
      text = gameState.wins === 0
        ? `I filed ${gameState.attempts} claims in CICP Roulette and was DENIED every time. The real approval rate is just 0.3%. COVID vaccine injuries deserve fair compensation.`
        : `${gameState.wins} of ${gameState.attempts} claims approved in CICP Roulette (${yourRate}%). The real rate is 0.3%. Americans deserve better.`;
    } else {
      text = `In VICP Roulette: ${gameState.wins} of ${gameState.attempts} approved (${yourRate}%). VICP works at ~48%. Why don&apos;t COVID vaccine injuries get the same fair treatment?`;
    }

    text += ' https://covidvaccineinjury.us #CICPReform';

    if (navigator.share) {
      navigator.share({ text });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const approvalRate = gameState.attempts > 0
    ? ((gameState.wins / gameState.attempts) * 100).toFixed(1)
    : '0.0';

  const getResultMessage = () => {
    if (!gameState.showResult || !gameState.lastResult) return null;

    if (gameState.mode === 'cicp') {
      if (gameState.lastResult === 'win') {
        return (
          <>
            <strong>🎉 APPROVED!</strong><br />
            You beat the 0.3% odds. Only 42 real Americans have done this.
          </>
        );
      } else {
        const messages = [
          "Join the other 14,004 Americans still waiting.",
          "No lawyer. No appeal. No recourse.",
          "The 1-year deadline means most never even file.",
          "Try the VICP toggle to see what fair looks like."
        ];
        return (
          <>
            <strong>❌ DENIED.</strong> {messages[Math.floor(Math.random() * messages.length)]}
          </>
        );
      }
    } else {
      if (gameState.lastResult === 'win') {
        return (
          <>
            <strong>✅ APPROVED!</strong><br />
            With ~48% odds, this is what fair compensation looks like.
          </>
        );
      } else {
        return (
          <>
            <strong>❌ DENIED.</strong><br />
            Even at ~48%, not everyone wins—but you had a real chance and can appeal.
          </>
        );
      }
    }
  };

  const getInsight = () => {
    if (gameState.mode === 'cicp') {
      if (gameState.attempts >= 20 && gameState.wins === 0) {
        return <><strong>{gameState.attempts} claims, 0 approved.</strong> You&apos;d need ~333 attempts to statistically expect one approval. Real claimants only get one chance.</>;
      } else if (gameState.attempts >= 10 && gameState.wins === 0) {
        return <><strong>Still denied after {gameState.attempts} tries.</strong> In reality, there&apos;s no court, no lawyers, and a 1-year deadline.</>;
      } else if (gameState.attempts >= 5 && gameState.wins === 0) {
        return <><strong>0 for {gameState.attempts}.</strong> The CICP was designed for emergencies, not justice.</>;
      }
    } else {
      if (gameState.attempts >= 5) {
        const yourRate = ((gameState.wins / gameState.attempts) * 100).toFixed(0);
        return <><strong>Your rate: {yourRate}%</strong> — VICP provides lawyers, a special court, and real due process. COVID injuries deserve the same.</>;
      }
    }
    return null;
  };

  const insight = getInsight();

  return (
    <>
      <canvas ref={canvasRef} className="confetti-canvas" />
      <div className={`cicp-roulette-v2 ${gameState.mode === 'vicp' ? 'vicp-mode' : ''}`}>
        <style jsx>{`
          .confetti-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
          }

          .cicp-roulette-v2 {
            font-family: 'DM Sans', system-ui, sans-serif;
            background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px;
            max-width: 520px;
            width: 100%;
            text-align: center;
            color: white;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
            transition: all 0.5s ease;
          }

          .cicp-roulette-v2.vicp-mode {
            background: linear-gradient(135deg, #0d2118 0%, #162e22 100%);
            border-color: rgba(45, 90, 61, 0.3);
          }

          .mode-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 32px;
            padding: 16px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
          }

          .mode-label {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            border: none;
            background: transparent;
          }

          .mode-label.cicp { color: #a63344; }
          .mode-label.vicp { color: #3d7a52; }
          .mode-label.active { background: rgba(255, 255, 255, 0.1); }

          .toggle-switch {
            position: relative;
            width: 64px;
            height: 32px;
            background: #8b2635;
            border-radius: 100px;
            cursor: pointer;
            transition: background 0.3s ease;
            border: none;
          }

          .toggle-switch.vicp { background: #2d5a3d; }

          .toggle-switch::after {
            content: '';
            position: absolute;
            top: 4px;
            left: 4px;
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .toggle-switch.vicp::after { transform: translateX(32px); }

          .game-title {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #fff;
          }

          .game-subtitle {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 8px;
          }

          .current-odds-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 24px;
            transition: all 0.3s ease;
          }

          .current-odds-badge.cicp {
            background: rgba(139, 38, 53, 0.2);
            border: 1px solid rgba(139, 38, 53, 0.4);
            color: #e8a0a8;
          }

          .current-odds-badge.vicp {
            background: rgba(45, 90, 61, 0.2);
            border: 1px solid rgba(45, 90, 61, 0.4);
            color: #8fcea3;
          }

          .chamber-container {
            position: relative;
            width: 220px;
            height: 220px;
            margin: 0 auto 32px;
          }

          .chamber {
            width: 220px;
            height: 220px;
            border-radius: 50%;
            border: 4px solid #c4a052;
            box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(196, 160, 82, 0.3);
            transition: transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99);
            position: relative;
          }

          .chamber.cicp {
            background: conic-gradient(#2d5a3d 0deg 1.08deg, #8b2635 1.08deg 360deg);
          }

          .chamber.vicp {
            background: conic-gradient(#2d5a3d 0deg 172.8deg, #8b2635 172.8deg 360deg);
          }

          .chamber::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border-radius: 50%;
            border: 2px dashed rgba(255, 255, 255, 0.1);
          }

          .chamber::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            background: #0d1b2a;
            border-radius: 50%;
            border: 3px solid #c4a052;
            transition: background 0.3s ease;
          }

          .vicp-mode .chamber::after { background: #0d2118; }

          .chamber-pointer {
            position: absolute;
            top: -14px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 14px solid transparent;
            border-right: 14px solid transparent;
            border-top: 24px solid #c4a052;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            z-index: 10;
          }

          .odds-explainer {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-bottom: 24px;
            font-size: 12px;
          }

          .odds-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .odds-swatch {
            width: 16px;
            height: 16px;
            border-radius: 4px;
          }

          .odds-swatch.denied { background: #8b2635; }
          .odds-swatch.approved { background: #2d5a3d; }

          .stats-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }

          .stat-box {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.3s ease;
            border: 1px solid transparent;
          }

          .stat-box.active { transform: scale(1.02); }
          .stat-box.cicp.active {
            background: rgba(139, 38, 53, 0.15);
            border-color: rgba(139, 38, 53, 0.3);
          }
          .stat-box.vicp.active {
            background: rgba(45, 90, 61, 0.15);
            border-color: rgba(45, 90, 61, 0.3);
          }

          .stat-box-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 8px;
          }

          .stat-box-rate {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .stat-box.cicp .stat-box-rate { color: #a63344; }
          .stat-box.vicp .stat-box-rate { color: #3d7a52; }

          .stat-box-detail {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
          }

          .your-stats {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }

          .your-stats-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 12px;
          }

          .your-stats-row {
            display: flex;
            justify-content: space-around;
          }

          .your-stat { text-align: center; }

          .your-stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #fff;
            transition: all 0.3s ease;
          }

          .your-stat-value.danger { color: #a63344; }
          .your-stat-value.success { color: #3d7a52; }

          .your-stat-label {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .trigger-btn {
            color: white;
            border: none;
            padding: 16px 48px;
            font-size: 18px;
            font-weight: 700;
            border-radius: 100px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.3s ease;
          }

          .trigger-btn.cicp {
            background: linear-gradient(135deg, #8b2635 0%, #6b1d29 100%);
            box-shadow: 0 8px 24px rgba(139, 38, 53, 0.4);
          }

          .trigger-btn.vicp {
            background: linear-gradient(135deg, #2d5a3d 0%, #1e4029 100%);
            box-shadow: 0 8px 24px rgba(45, 90, 61, 0.4);
          }

          .trigger-btn:hover:not(:disabled) { transform: translateY(-2px); }
          .trigger-btn:disabled { opacity: 0.6; cursor: not-allowed; }

          .result-message {
            margin-top: 24px;
            padding: 16px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            line-height: 1.5;
            animation: fadeInUp 0.5s ease;
          }

          .result-message.lose {
            background: rgba(139, 38, 53, 0.2);
            border: 1px solid rgba(139, 38, 53, 0.3);
            color: #e8a0a8;
          }

          .result-message.win {
            background: rgba(45, 90, 61, 0.2);
            border: 1px solid rgba(45, 90, 61, 0.3);
            color: #8fcea3;
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .action-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 24px;
            flex-wrap: wrap;
          }

          .secondary-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 100px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .secondary-btn:hover { background: rgba(255, 255, 255, 0.2); }

          .share-btn {
            background: linear-gradient(135deg, #c4a052 0%, #a08042 100%);
            color: #0d1b2a;
            border: none;
          }

          .share-btn:hover {
            background: linear-gradient(135deg, #d4b062 0%, #b09052 100%);
          }

          .insight-box {
            margin-top: 24px;
            padding: 16px;
            border-radius: 12px;
            text-align: left;
            font-size: 14px;
            line-height: 1.6;
            animation: fadeInUp 0.5s ease;
          }

          .insight-box.cicp {
            background: rgba(139, 38, 53, 0.1);
            border: 1px solid rgba(139, 38, 53, 0.2);
            color: #e8a0a8;
          }

          .insight-box.vicp {
            background: rgba(45, 90, 61, 0.1);
            border: 1px solid rgba(45, 90, 61, 0.2);
            color: #8fcea3;
          }

          .cta-box {
            margin-top: 24px;
            padding: 20px;
            background: rgba(196, 160, 82, 0.1);
            border: 1px solid rgba(196, 160, 82, 0.2);
            border-radius: 12px;
          }

          .cta-text {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 16px;
            line-height: 1.5;
          }

          .cta-btn {
            display: inline-block;
            background: linear-gradient(135deg, #c4a052 0%, #a08042 100%);
            color: #0d1b2a;
            padding: 12px 32px;
            border-radius: 100px;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
          }

          .cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(196, 160, 82, 0.3);
          }

          @media (max-width: 480px) {
            .cicp-roulette-v2 { padding: 24px; }
            .chamber-container { width: 180px; height: 180px; }
            .chamber { width: 180px; height: 180px; }
            .stats-comparison { gap: 8px; }
            .stat-box { padding: 12px; }
            .stat-box-rate { font-size: 22px; }
          }
        `}</style>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-label cicp ${gameState.mode === 'cicp' ? 'active' : ''}`}
            onClick={() => setMode('cicp')}
          >
            CICP
          </button>
          <button
            className={`toggle-switch ${gameState.mode === 'vicp' ? 'vicp' : ''}`}
            onClick={toggleMode}
            aria-label="Toggle between CICP and VICP"
          />
          <button
            className={`mode-label vicp ${gameState.mode === 'vicp' ? 'active' : ''}`}
            onClick={() => setMode('vicp')}
          >
            VICP
          </button>
        </div>

        <h2 className="game-title">{config.name} Roulette</h2>
        <p className="game-subtitle">Experience the compensation odds firsthand</p>

        <div className={`current-odds-badge ${gameState.mode}`}>
          {config.odds} Chance of Approval
        </div>

        <div className="chamber-container">
          <div className="chamber-pointer" />
          <div
            className={`chamber ${gameState.mode}`}
            style={{ transform: `rotate(${gameState.chamberPosition}deg)` }}
          />
        </div>

        {/* Odds Legend */}
        <div className="odds-explainer">
          <div className="odds-item">
            <div className="odds-swatch denied" />
            <span>Denied</span>
          </div>
          <div className="odds-item">
            <div className="odds-swatch approved" />
            <span>Approved</span>
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="stats-comparison">
          <div className={`stat-box cicp ${gameState.mode === 'cicp' ? 'active' : ''}`}>
            <div className="stat-box-title">CICP (COVID)</div>
            <div className="stat-box-rate">0.3%</div>
            <div className="stat-box-detail">42 of 14,046 compensated</div>
          </div>
          <div className={`stat-box vicp ${gameState.mode === 'vicp' ? 'active' : ''}`}>
            <div className="stat-box-title">VICP (Other Vaccines)</div>
            <div className="stat-box-rate">~48%</div>
            <div className="stat-box-detail">Fair process with lawyers</div>
          </div>
        </div>

        {/* Your Stats */}
        <div className="your-stats">
          <div className="your-stats-title">Your Results</div>
          <div className="your-stats-row">
            <div className="your-stat">
              <div className="your-stat-value">{gameState.attempts}</div>
              <div className="your-stat-label">Claims</div>
            </div>
            <div className="your-stat">
              <div className={`your-stat-value ${gameState.wins > 0 ? 'success' : 'danger'}`}>
                {gameState.wins}
              </div>
              <div className="your-stat-label">Approved</div>
            </div>
            <div className="your-stat">
              <div className="your-stat-value">{approvalRate}%</div>
              <div className="your-stat-label">Your Rate</div>
            </div>
          </div>
        </div>

        <button
          className={`trigger-btn ${gameState.mode}`}
          onClick={pullTrigger}
          disabled={gameState.isSpinning}
        >
          {gameState.isSpinning ? 'Processing...' : gameState.attempts === 0 ? 'File a Claim' : 'Try Again'}
        </button>

        {gameState.showResult && gameState.lastResult && (
          <div className={`result-message ${gameState.lastResult}`}>
            {getResultMessage()}
          </div>
        )}

        {gameState.attempts >= 3 && (
          <div className="action-buttons">
            <button className="secondary-btn" onClick={resetGame}>Reset</button>
            <button className="secondary-btn" onClick={rapidFire}>⚡ Try 50x</button>
            <button className="secondary-btn share-btn" onClick={shareResult}>Share</button>
          </div>
        )}

        {insight && (
          <div className={`insight-box ${gameState.mode}`}>
            {insight}
          </div>
        )}

        <div className="cta-box">
          <p className="cta-text">
            COVID vaccine injuries deserve the same fair treatment as other vaccines.
            Help us transfer claims from CICP to VICP.
          </p>
          <Link href="/#action" className="cta-btn">Take Action</Link>
        </div>
      </div>
    </>
  );
};

export default CICPRoulette;
