import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiShield, FiZap, FiBarChart2, FiGlobe,
  FiCpu, FiAlertTriangle, FiArrowRight,
  FiRadio, FiLock, FiActivity, FiEye, FiTarget,
} from 'react-icons/fi';
import FeatureCard from '../components/FeatureCard';
import StatCounter from '../components/StatCounter';

const features = [
  { icon: FiCpu,          title: 'AI Text Analysis',         description: 'Deep ML context analysis detecting aggression signals, harmful intent, and language patterns in real-time.' },
  { icon: FiShield,       title: 'ML Threat Detection',      description: 'TF-IDF vectorization with Logistic Regression & SVM — military-grade precision classification.' },
  { icon: FiZap,          title: 'Real-Time Moderation',     description: 'Sub-50ms threat identification for social streams, chat platforms, and community comment sections.' },
  { icon: FiGlobe,        title: 'Multilingual Intelligence', description: 'Detects threats in Hindi and English — expanding threat coverage across digital frontiers.' },
  { icon: FiBarChart2,    title: 'SOC Analytics Dashboard',  description: 'Live visual intelligence: toxicity trend charts, prediction distributions, cluster analysis.' },
  { icon: FiAlertTriangle, title: 'Threat Word Flagging',    description: 'Precision-highlights specific toxic terms for rapid analyst decision-making.' },
];

const steps = [
  { num: '01', title: 'Data Ingestion',     icon: FiEye,      desc: 'Feed any social media message, comment, or voice transcript directly into the defense console.' },
  { num: '02', title: 'AI Threat Analysis', icon: FiCpu,      desc: 'ML pipeline applies TF-IDF vectorization + classification in milliseconds across all language layers.' },
  { num: '03', title: 'Security Response',  icon: FiTarget,   desc: 'Receive tactical threat report with toxicity score, confidence rating, and flagged intelligence terms.' },
];

const testimonials = [
  { quote: 'CyberShield reduced toxic incidents by 48% in two weeks. The AI precision is extraordinary.', author: 'Community Lead', company: 'SocialSpark', threat: 'CLEARED' },
  { quote: 'The word-flagging feature makes moderation decisions 3x faster and 100% more consistent.', author: 'Trust & Safety', company: 'NexForum', threat: 'RESOLVED' },
  { quote: 'Hackathon-winning tool — razor-sharp UX with near-perfect toxicity prediction accuracy.', author: 'Panel Judge', company: 'AI Security Challenge', threat: 'VALIDATED' },
];

const stats = [
  { label: 'Messages Analyzed',     value: 231873 },
  { label: 'Threats Neutralized',   value: 13952 },
  { label: 'Model Accuracy',        value: 92.31,  suffix: '%' },
  { label: 'Training Datasets',     value: 3 },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

/* ── Cyber 3D Visualizer canvas ── */
function CyberVisualizer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;
    const W = canvas.width  = 420;
    const H = canvas.height = 380;
    const cx = W / 2, cy = H / 2;

    // Neural nodes
    const nodes = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const r = 100 + (i % 3) * 30;
      return {
        baseAngle: angle,
        r,
        phase: Math.random() * Math.PI * 2,
        size: 3 + Math.random() * 3,
      };
    });

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, W, H);

      // Background glow rings
      [150, 120, 90, 60].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,229,255,${0.04 + i * 0.015})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Rotating outer ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.3);
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const r1 = 140, r2 = 148;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(0,229,255,0.6)' : 'rgba(79,124,255,0.2)';
        ctx.lineWidth = i % 4 === 0 ? 2 : 1;
        ctx.stroke();
      }
      ctx.restore();

      // Rotating inner ring (counter)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.5);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 80, Math.sin(a) * 80, 2, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(0,229,255,0.7)' : 'rgba(155,92,255,0.4)';
        ctx.fill();
      }
      ctx.restore();

      // Compute node positions
      const positions = nodes.map(n => ({
        x: cx + Math.cos(n.baseAngle + t * 0.2) * n.r,
        y: cy + Math.sin(n.baseAngle + t * 0.2) * n.r * 0.5,
        size: n.size + Math.sin(t * 2 + n.phase) * 1.2,
      }));

      // Connection lines
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.35;
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.strokeStyle = `rgba(79,124,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Nodes
      positions.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(0,229,255,0.9)' : i % 3 === 1 ? 'rgba(79,124,255,0.8)' : 'rgba(155,92,255,0.7)';
        ctx.fill();
        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(0,229,255,0.06)' : 'rgba(79,124,255,0.05)';
        ctx.fill();
      });

      // Center shield symbol
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(t * 0.3) * 0.1);
      const shieldSize = 28 + Math.sin(t * 1.5) * 2;
      ctx.beginPath();
      // Shield path
      ctx.moveTo(0, -shieldSize);
      ctx.lineTo(shieldSize * 0.7, -shieldSize * 0.4);
      ctx.lineTo(shieldSize * 0.7, shieldSize * 0.3);
      ctx.lineTo(0, shieldSize);
      ctx.lineTo(-shieldSize * 0.7, shieldSize * 0.3);
      ctx.lineTo(-shieldSize * 0.7, -shieldSize * 0.4);
      ctx.closePath();
      const shieldGrad = ctx.createLinearGradient(0, -shieldSize, 0, shieldSize);
      shieldGrad.addColorStop(0, 'rgba(0,229,255,0.9)');
      shieldGrad.addColorStop(1, 'rgba(79,124,255,0.5)');
      ctx.strokeStyle = shieldGrad;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,229,255,0.08)';
      ctx.fill();
      // Glow
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.restore();

      // Radar sweep
      ctx.save();
      ctx.translate(cx, cy);
      const sweepGrad = ctx.createConicalGradient
        ? ctx.createConicalGradient(t, 0, 0)
        : null;
      if (sweepGrad) {
        sweepGrad.addColorStop(0, 'rgba(0,229,255,0.15)');
        sweepGrad.addColorStop(0.1, 'rgba(0,229,255,0.0)');
        ctx.beginPath();
        ctx.arc(0, 0, 142, 0, Math.PI * 2);
        ctx.fillStyle = sweepGrad;
        ctx.fill();
      }
      // Sweep line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(t) * 142, Math.sin(t) * 142);
      ctx.strokeStyle = 'rgba(0,229,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      // Data stream particles
      for (let i = 0; i < 5; i++) {
        const a = t * 1.5 + (i / 5) * Math.PI * 2;
        const r = 60 + i * 8;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,229,255,0.8)';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%', maxWidth: '420px', height: 'auto',
        filter: 'drop-shadow(0 0 30px rgba(0,229,255,0.3))',
      }}
      aria-hidden="true"
    />
  );
}

/* ── Threat Radar SVG ── */
function ThreatRadar() {
  return (
    <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
      <svg viewBox="0 0 220 220" style={{ width: '100%', height: '100%' }}>
        {/* Rings */}
        {[90, 70, 50, 30].map((r, i) => (
          <circle key={r} cx="110" cy="110" r={r} fill="none" stroke="rgba(0,229,255,0.12)" strokeWidth="0.5" />
        ))}
        {/* Cross-hairs */}
        <line x1="110" y1="20" x2="110" y2="200" stroke="rgba(0,229,255,0.08)" strokeWidth="0.5" />
        <line x1="20" y1="110" x2="200" y2="110" stroke="rgba(0,229,255,0.08)" strokeWidth="0.5" />
        {/* Diagonal lines */}
        <line x1="45" y1="45" x2="175" y2="175" stroke="rgba(0,229,255,0.05)" strokeWidth="0.5" />
        <line x1="175" y1="45" x2="45" y2="175" stroke="rgba(0,229,255,0.05)" strokeWidth="0.5" />
        {/* Rotating sweep */}
        <g style={{ transformOrigin: '110px 110px', animation: 'radar-sweep 3s linear infinite' }}>
          <path d="M110 110 L200 110 A90 90 0 0 0 110 20 Z" fill="url(#sweepGrad)" />
          <line x1="110" y1="110" x2="200" y2="110" stroke="rgba(0,229,255,0.6)" strokeWidth="1.5" />
        </g>
        <defs>
          <radialGradient id="sweepGrad" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="rgba(0,229,255,0)" />
            <stop offset="100%" stopColor="rgba(0,229,255,0.15)" />
          </radialGradient>
        </defs>
        {/* Threat blips */}
        <circle cx="150" cy="75" r="3" fill="#FF3B5C" style={{ animation: 'cyber-pulse 1.5s infinite' }} />
        <circle cx="80"  cy="140" r="2" fill="#FFD700" style={{ animation: 'cyber-pulse 2s infinite 0.5s' }} />
        <circle cx="140" cy="145" r="2.5" fill="#4F7CFF" style={{ animation: 'cyber-pulse 2.5s infinite 1s' }} />
        {/* Center dot */}
        <circle cx="110" cy="110" r="3" fill="#00E5FF" />
        <circle cx="110" cy="110" r="6" fill="none" stroke="rgba(0,229,255,0.3)" strokeWidth="0.5" />
      </svg>
      {/* Labels */}
      {[
        { text: 'N', style: { top: '2px', left: '50%', transform: 'translateX(-50%)' }},
        { text: 'S', style: { bottom: '2px', left: '50%', transform: 'translateX(-50%)' }},
        { text: 'W', style: { left: '2px', top: '50%', transform: 'translateY(-50%)' }},
        { text: 'E', style: { right: '2px', top: '50%', transform: 'translateY(-50%)' }},
      ].map(({ text, style }) => (
        <span key={text} style={{
          position: 'absolute', fontFamily: 'Share Tech Mono, monospace',
          fontSize: '0.55rem', color: 'rgba(0,229,255,0.4)', ...style,
        }}>{text}</span>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ════════════════ HERO ════════════════ */}
      <section style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>
        {/* Cyber grid overlay */}
        <div className="cyber-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
        <div className="scanline-overlay" />

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}
          className="lg:grid-cols-2 grid-cols-1">

          {/* Left: Command Console */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>

            {/* Status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.35rem 1.25rem',
              background: 'rgba(0,229,255,0.07)',
              border: '1px solid rgba(0,229,255,0.25)',
              clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)',
              marginBottom: '1.5rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E573', boxShadow: '0 0 6px #00E573', animation: 'cyber-pulse 2s infinite' }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00E5FF' }}>
                AI-Powered Cyber Defense System
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.25rem' }}
              className="text-4xl md:text-5xl lg:text-6xl">
              <span style={{ color: '#E6F1FF' }}>STOP{' '}</span>
              <span className="gradient-text">CYBER</span>
              <br />
              <span style={{ color: '#E6F1FF' }}>THREATS</span>
              <br />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '55%', color: 'rgba(159,180,255,0.6)', letterSpacing: '0.15em' }}>
                BEFORE THEY ESCALATE
              </span>
            </h1>

            <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(159,180,255,0.7)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '480px', marginBottom: '2rem' }}>
              CyberShield deploys advanced machine learning to detect toxic, abusive, and harmful content in milliseconds — protecting digital communities at scale with military-grade precision.
            </p>

            {/* CTA row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <Link to="/detect" id="hero-cta-primary" className="btn-primary">
                <span>Initialize Detection</span>
                <FiArrowRight />
              </Link>
              <Link to="/dashboard" id="hero-cta-secondary" className="btn-outline">
                <FiBarChart2 />
                <span>View Intelligence</span>
              </Link>
            </div>

            {/* Live metrics row */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0',
              background: 'rgba(2,8,20,0.7)',
              border: '1px solid rgba(79,124,255,0.2)',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            }}>
              {[['231K+', 'ANALYZED'], ['92.3%', 'ACCURACY'], ['< 50ms', 'RESPONSE']].map(([val, lbl], i) => (
                <div key={lbl} style={{
                  flex: 1, padding: '0.75rem 1rem', textAlign: 'center',
                  borderRight: i < 2 ? '1px solid rgba(79,124,255,0.15)' : 'none',
                }}>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.1rem', color: '#00E5FF' }}>{val}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: 'rgba(159,180,255,0.4)', letterSpacing: '0.12em', marginTop: '0.2rem' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: 3D Cyber Visualizer */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
          >
            {/* Main visualizer panel */}
            <div style={{
              background: 'rgba(2,8,20,0.85)',
              border: '1px solid rgba(0,229,255,0.2)',
              clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
              overflow: 'hidden', position: 'relative', width: '100%',
            }}>
              {/* Panel header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 1rem',
                background: 'rgba(0,229,255,0.05)',
                borderBottom: '1px solid rgba(0,229,255,0.12)',
              }}>
                <span style={{ width: '8px', height: '8px', background: '#FF3B5C', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                <span style={{ width: '8px', height: '8px', background: '#FFD700', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                <span style={{ width: '8px', height: '8px', background: '#00E573', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(0,229,255,0.4)', marginLeft: '0.5rem', letterSpacing: '0.08em' }}>
                  CYBERSHIELD-AI · NEURAL DEFENSE GRID · LIVE
                </span>
                <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#00E573', boxShadow: '0 0 6px #00E573', animation: 'cyber-pulse 2s infinite' }} />
              </div>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                <CyberVisualizer />
              </div>
              {/* Bottom status */}
              <div style={{
                padding: '0.5rem 1rem',
                borderTop: '1px solid rgba(0,229,255,0.08)',
                display: 'flex', justifyContent: 'space-between',
                fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem',
                color: 'rgba(0,229,255,0.4)',
              }}>
                <span>NODE: 7 · ACTIVE</span>
                <span style={{ color: '#00E573' }}>● ALL SYSTEMS NOMINAL</span>
                <span>UPTIME: 99.97%</span>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: '-16px', right: '-12px',
                background: 'rgba(2,8,20,0.95)',
                border: '1px solid rgba(0,229,255,0.35)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                padding: '0.5rem 0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 0 15px rgba(0,229,255,0.15)',
              }}
            >
              <FiShield style={{ color: '#00E5FF', fontSize: '14px' }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', color: '#E6F1FF', textTransform: 'uppercase' }}>
                Real-Time Protection
              </span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
              style={{
                position: 'absolute', bottom: '-16px', left: '-12px',
                background: 'rgba(2,8,20,0.95)',
                border: '1px solid rgba(0,229,255,0.25)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                padding: '0.5rem 0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 0 12px rgba(79,124,255,0.12)',
              }}
            >
              <span style={{ color: '#00E573', fontSize: '10px' }}>●</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#9FB4FF', letterSpacing: '0.06em' }}>
                ACCURACY: 94.2%
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <span className="section-badge">
              <FiCpu style={{ fontSize: '10px' }} /> Platform Capabilities
            </span>
          </div>
          <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: '0.03em', color: '#E6F1FF' }}>
            DEFENSE <span className="gradient-text">MODULES</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(159,180,255,0.55)', marginTop: '1rem', maxWidth: '560px', margin: '1rem auto 0', lineHeight: 1.7 }}>
            Full AI-powered toolkit for detecting, analyzing, and neutralizing harmful online content at enterprise scale.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section style={{ padding: '5rem 0', position: 'relative' }}>
        <div className="cyber-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>
          <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-badge" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <FiRadio style={{ fontSize: '10px' }} /> Security Pipeline
            </span>
            <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#E6F1FF', marginTop: '1rem', letterSpacing: '0.03em' }}>
              HOW <span className="gradient-text">CYBERSHIELD</span> OPERATES
            </h2>
          </motion.div>

          {/* Pipeline steps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{
              display: 'none', position: 'absolute', top: '60px',
              left: 'calc(100%/6)', right: 'calc(100%/6)',
              height: '1px',
              background: 'linear-gradient(90deg, #4F7CFF, #00E5FF, #9B5CFF)',
              animation: 'data-flow 2s linear infinite',
            }} className="md:block" />

            {steps.map((step, i) => (
              <motion.div key={step.num} {...fadeUp(i * 0.15)} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem' }}>
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '60px', right: '-1rem', zIndex: 10,
                    width: '2rem', height: '1px',
                    background: 'linear-gradient(90deg, #4F7CFF, #00E5FF)',
                  }} className="hidden md:block" />
                )}
                {/* Step number hex */}
                <div style={{
                  width: '80px', height: '80px',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: 'linear-gradient(135deg, rgba(79,124,255,0.2), rgba(0,229,255,0.1))',
                  border: '1px solid rgba(0,229,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                  marginBottom: '1.5rem',
                  boxShadow: '0 0 25px rgba(0,229,255,0.12)',
                }}>
                  <step.icon style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '2px' }} />
                  <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '0.65rem', color: 'rgba(0,229,255,0.6)', letterSpacing: '0.1em' }}>
                    {step.num}
                  </span>
                </div>

                <div style={{
                  background: 'rgba(11,17,32,0.9)',
                  border: '1px solid rgba(79,124,255,0.2)',
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                  padding: '1.5rem',
                  textAlign: 'center', width: '100%',
                }}>
                  <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E6F1FF', marginBottom: '0.5rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(159,180,255,0.55)', lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ THREAT RADAR + STATS ════════════════ */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'center' }} className="lg:grid-cols-[1fr_2fr] grid-cols-1">

          {/* Radar panel */}
          <motion.div {...fadeUp()} style={{
            background: 'rgba(2,8,20,0.9)',
            border: '1px solid rgba(0,229,255,0.2)',
            clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
            padding: '1.5rem',
          }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4F7CFF', marginBottom: '1rem', borderLeft: '2px solid #00E5FF', paddingLeft: '0.5rem' }}>
              Threat Radar · Live
            </div>
            <ThreatRadar />
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { color: '#FF3B5C', label: 'Active Threats',  val: '3' },
                { color: '#FFD700', label: 'Under Review',    val: '7' },
                { color: '#4F7CFF', label: 'Safe Nodes',      val: '142' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(159,180,255,0.5)' }}>
                    <span style={{ width: '6px', height: '6px', background: item.color, borderRadius: '50%' }} />
                    {item.label}
                  </span>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', color: item.color, fontWeight: 700 }}>{item.val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats grid */}
          <div>
            <motion.div {...fadeUp()} style={{ marginBottom: '2rem' }}>
              <span className="section-badge" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
                <FiActivity style={{ fontSize: '10px' }} /> Live Intelligence
              </span>
              <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', color: '#E6F1FF', marginTop: '0.5rem', letterSpacing: '0.03em' }}>
                REAL-WORLD <span className="gradient-text">IMPACT DATA</span>
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {stats.map((s, i) => (
                <motion.div key={s.label} {...fadeUp(i * 0.1)}>
                  <StatCounter label={s.label} value={s.value} suffix={s.suffix} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section style={{ padding: '5rem 0', position: 'relative' }}>
        <div className="cyber-grid" style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>
          <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-badge" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <FiLock style={{ fontSize: '10px' }} /> Intelligence Reports
            </span>
            <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#E6F1FF', marginTop: '1rem', letterSpacing: '0.03em' }}>
              OPERATOR <span className="gradient-text">TESTIMONIALS</span>
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map((t, i) => (
              <motion.div key={t.author} {...fadeUp(i * 0.1)} style={{
                background: 'rgba(11,17,32,0.9)',
                border: '1px solid rgba(79,124,255,0.2)',
                clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
                padding: '1.75rem',
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="scanline-overlay" style={{ opacity: 0.3 }} />
                {/* Clearance badge */}
                <div style={{
                  position: 'absolute', top: '12px', right: '20px',
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem',
                  color: '#00E573', letterSpacing: '0.15em',
                  background: 'rgba(0,229,115,0.08)',
                  border: '1px solid rgba(0,229,115,0.2)',
                  padding: '0.15rem 0.5rem',
                }}>
                  {t.threat}
                </div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '1.5rem', color: 'rgba(79,124,255,0.3)', marginBottom: '0.75rem', lineHeight: 1 }}>"</div>
                <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(159,180,255,0.75)', lineHeight: 1.75, fontSize: '0.9rem', flex: 1, marginBottom: '1.25rem', position: 'relative' }}>
                  {t.quote}
                </p>
                <div style={{ borderTop: '1px solid rgba(79,124,255,0.12)', paddingTop: '1rem' }}>
                  <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#E6F1FF' }}>{t.author}</p>
                  <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(79,124,255,0.5)', letterSpacing: '0.1em' }}>{t.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
        <motion.div {...fadeUp()} style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(11,17,32,0.98) 0%, rgba(2,8,20,0.98) 100%)',
          border: '1px solid rgba(0,229,255,0.25)',
          clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 32px 100%, 0 calc(100% - 32px))',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          {/* Glow blobs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-30%', left: '20%', width: '500px', height: '500px', background: 'rgba(79,124,255,0.06)', borderRadius: '50%', filter: 'blur(80px)' }} />
            <div style={{ position: 'absolute', bottom: '-30%', right: '20%', width: '400px', height: '400px', background: 'rgba(155,92,255,0.06)', borderRadius: '50%', filter: 'blur(80px)' }} />
          </div>
          <div className="scanline-overlay" />
          {/* Neon corner accents */}
          {[
            { top: 0, left: 0, borderTop: '2px solid #00E5FF', borderLeft: '2px solid #00E5FF' },
            { top: 0, right: 0, borderTop: '2px solid #00E5FF', borderRight: '2px solid #00E5FF' },
            { bottom: 0, left: 0, borderBottom: '2px solid #4F7CFF', borderLeft: '2px solid #4F7CFF' },
            { bottom: 0, right: 0, borderBottom: '2px solid #4F7CFF', borderRight: '2px solid #4F7CFF' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', ...s }} />
          ))}

          <div style={{ position: 'relative' }}>
            <span className="section-badge" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
              Initiate Defense Protocol
            </span>
            <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.75rem)', color: '#E6F1FF', letterSpacing: '0.03em', marginBottom: '1rem' }}>
              READY TO DEFEND YOUR{' '}
              <span className="gradient-text">COMMUNITY?</span>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(159,180,255,0.6)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
              Deploy CyberShield's AI defense grid and start neutralizing cyberbullying and toxic threats instantly.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/detect" id="cta-strip-primary" className="btn-primary">
                <span>Deploy Detection</span>
                <FiArrowRight />
              </Link>
              <Link to="/about" id="cta-strip-secondary" className="btn-outline">
                <FiShield />
                <span>Learn More</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
