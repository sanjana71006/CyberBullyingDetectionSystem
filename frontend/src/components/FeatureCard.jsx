import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      style={{
        background: 'rgba(11,17,32,0.92)',
        border: '1px solid rgba(79,124,255,0.18)',
        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        padding: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      whileHover={{
        boxShadow: '0 0 30px rgba(0,229,255,0.1)',
      }}
      className="group"
    >
      {/* Scanline overlay */}
      <div className="scanline-overlay" style={{ opacity: 0.4 }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)',
        transform: 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'transform 0.4s ease',
      }}
        className="group-hover:!scale-x-100"
      />

      {/* Module ID tag */}
      <div style={{
        position: 'absolute', top: '10px', right: '14px',
        fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem',
        color: 'rgba(79,124,255,0.3)', letterSpacing: '0.1em',
      }}>
        MOD-{String(index + 1).padStart(2, '0')}
      </div>

      {/* Icon */}
      <div style={{
        width: '48px', height: '48px',
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        background: 'linear-gradient(135deg, rgba(79,124,255,0.15), rgba(0,229,255,0.08))',
        border: '1px solid rgba(0,229,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.25rem',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
        className="group-hover:!border-[rgba(0,229,255,0.5)] group-hover:!shadow-[0_0_15px_rgba(0,229,255,0.2)]"
      >
        {Icon && <Icon style={{ color: '#00E5FF', fontSize: '20px' }} />}
      </div>

      {/* Content */}
      <h3 style={{
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
        fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#E6F1FF', marginBottom: '0.6rem',
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.83rem', color: 'rgba(159,180,255,0.55)', lineHeight: 1.7,
      }}>
        {description}
      </p>

      {/* Bottom data line */}
      <div style={{
        marginTop: '1.25rem', height: '1px',
        background: 'linear-gradient(90deg, rgba(79,124,255,0.2), rgba(0,229,255,0.2), transparent)',
        transform: 'scaleX(0.3)', transformOrigin: 'left',
        transition: 'transform 0.4s ease',
      }}
        className="group-hover:!scale-x-100"
      />
    </motion.div>
  );
}
