import { Link } from 'react-router-dom';
import { FiShield, FiGithub, FiTwitter, FiLinkedin, FiMail, FiActivity } from 'react-icons/fi';

const footerLinks = {
  'Platform': [
    { label: 'Detection Console', to: '/detect' },
    { label: 'Analytics Dashboard', to: '/dashboard' },
    { label: 'About CyberShield', to: '/about' },
  ],
  'Intelligence': [
    { label: 'TF-IDF NLP Engine', to: '/about' },
    { label: 'ML Classification', to: '/about' },
    { label: 'Real-Time Analysis', to: '/detect' },
  ],
  'Datasets': [
    { label: 'Jigsaw Dataset', to: '/about' },
    { label: 'Twitter Dataset', to: '/about' },
    { label: 'Hate Speech Data', to: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(2, 8, 20, 0.98)',
      borderTop: '2px solid rgba(255,255,255,0.58)',
      marginTop: '6rem',
      position: 'relative',
    }}>
      {/* Top neon separator */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #00E5FF, #4F7CFF, #9B5CFF, transparent)',
        marginBottom: 0,
      }} />

      {/* Scan line animation */}
      <div className="scanline-overlay" style={{ opacity: 0.5 }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12" style={{ paddingTop: '3.5rem', paddingBottom: '2rem', position: 'relative' }}>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div style={{ minWidth: '200px' }}>
            <Link to="/" id="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #4F7CFF, #00E5FF)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0,229,255,0.3)',
              }}>
                <FiShield style={{ color: '#fff', fontSize: '16px' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1rem', color: '#E6F1FF' }}>
                  CYBER<span style={{ color: '#00E5FF' }}>SHIELD</span>
                </div>
              </div>
            </Link>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(159,180,255,0.5)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              AI-powered cyberbullying detection platform keeping digital communities safer through machine learning intelligence.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { icon: FiGithub,   href: '#', label: 'GitHub' },
                { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
                { icon: FiTwitter,  href: '#', label: 'Twitter' },
                { icon: FiMail,     href: '#', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  style={{
                    width: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.6)',
                    color: 'rgba(159,180,255,0.5)',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    background: 'rgba(11,17,32,0.6)',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  className="hover:!border-[#00E5FF] hover:!text-[#00E5FF] hover:!shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                >
                  <Icon style={{ fontSize: '13px' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#4F7CFF', marginBottom: '1rem',
                borderLeft: '2px solid #00E5FF', paddingLeft: '0.5rem',
              }}>
                {section}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                      color: 'rgba(159,180,255,0.55)', textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                      className="hover:!text-[#00E5FF]"
                    >
                      <span style={{ color: 'rgba(0,229,255,0.3)', marginRight: '0.4rem', fontFamily: 'Share Tech Mono, monospace' }}>›</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* System Status Bar */}
        <div style={{
          background: 'rgba(2,8,20,0.9)',
          border: '2px solid rgba(255,255,255,0.62)',
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          padding: '0.75rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: '#00E573', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em' }}>
              ● SYSTEM STATUS: SECURE
            </span>
          </div>
          <span style={{ color: 'rgba(79,124,255,0.3)', fontFamily: 'Share Tech Mono, monospace' }}>|</span>
          <span style={{ color: '#FFD700', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em' }}>
            ⚡ THREAT LEVEL: LOW
          </span>
          <span style={{ color: 'rgba(79,124,255,0.3)', fontFamily: 'Share Tech Mono, monospace' }}>|</span>
          <span style={{ color: '#00E5FF', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiActivity style={{ fontSize: '10px', animation: 'cyber-pulse 2s infinite' }} />
            AI MONITORING: ACTIVE
          </span>
          <span style={{ color: 'rgba(79,124,255,0.3)', fontFamily: 'Share Tech Mono, monospace' }}>|</span>
          <span style={{ color: 'rgba(159,180,255,0.4)', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.08em', marginLeft: 'auto' }}>
            NODE-7 · CYBERSHIELD-AI-v2.1
          </span>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '2px solid rgba(255,255,255,0.38)',
          paddingTop: '1.25rem',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        }}>
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(159,180,255,0.3)', letterSpacing: '0.08em' }}>
            © {new Date().getFullYear()} CYBERSHIELD · ALL RIGHTS RESERVED
          </p>
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(159,180,255,0.3)', letterSpacing: '0.08em' }}>
            BUILT WITH AI · PROTECTING DIGITAL COMMUNITIES
          </p>
        </div>
      </div>
    </footer>
  );
}
