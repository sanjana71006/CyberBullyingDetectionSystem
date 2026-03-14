import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function StatCounter({ label, value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const [inView,  setInView]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start    = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(easeOutExpo(t) * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(11,17,32,0.92)',
        border: '1px solid rgba(79,124,255,0.18)',
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
        padding: '1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #4F7CFF, #00E5FF, #9B5CFF)',
      }} />

      {/* Scanline */}
      <div className="scanline-overlay" style={{ opacity: 0.35 }} />

      <p style={{
        fontFamily: 'Orbitron, monospace', fontWeight: 900,
        fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
        background: 'linear-gradient(135deg, #00E5FF, #4F7CFF)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        tabularNums: 'tabular-nums',
        position: 'relative',
      }}>
        {display.toLocaleString()}{suffix}
      </p>
      <p style={{
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
        fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase',
        color: 'rgba(159,180,255,0.45)', marginTop: '0.4rem',
        position: 'relative',
      }}>
        {label}
      </p>

      {/* Corner accent */}
      <div style={{
        position: 'absolute', bottom: '8px', right: '10px',
        fontFamily: 'Share Tech Mono, monospace', fontSize: '0.5rem',
        color: 'rgba(0,229,255,0.2)', letterSpacing: '0.05em',
      }}>●</div>
    </motion.div>
  );
}
