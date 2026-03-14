import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getNavItems = () => {
    if (!user) {
      return [
        { label: 'Home',      to: '/' },
        { label: 'Detection', to: '/detect' },
        { label: 'About',     to: '/about' },
      ];
    }
    if (user.role === 'admin') {
      return [
        { label: 'Admin HQ',  to: '/admin' },
        { label: 'Community', to: '/feed' },
        { label: 'Chat',      to: '/chat' },
      ];
    }
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Feed',      to: '/feed' },
      { label: 'Chat',      to: '/chat' },
      { label: 'Profile',   to: '/profile' },
      { label: 'Detection', to: '/detect' },
    ];
  };

  const currentNavItems = getNavItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled
          ? 'rgba(2, 8, 20, 0.97)'
          : 'rgba(2, 6, 23, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '2px solid rgba(255,255,255,0.68)' : '2px solid rgba(255,255,255,0.45)',
        boxShadow: scrolled ? '0 0 30px rgba(0,229,255,0.06), 0 4px 0 rgba(0,229,255,0.12)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #00E5FF, #4F7CFF, #9B5CFF, transparent)',
      }} />

      <nav className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between" style={{ height: '64px' }}>

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 group" id="nav-logo" style={{ textDecoration: 'none' }}>
          <img
            src="/Logo.jpeg"
            alt="CyberShield logo"
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'cover',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 0 20px rgba(0,229,255,0.35)',
              transition: 'box-shadow 0.3s ease',
            }}
            className="group-hover:shadow-[0_0_30px_rgba(0,229,255,0.7)]"
          />

          <div>
            <div style={{
              fontFamily: 'Orbitron, monospace',
              fontWeight: 900,
              fontSize: '1.1rem',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}>
              <span style={{ color: '#E6F1FF' }}>CYBER</span>
              <span style={{ color: '#00E5FF' }}>SHIELD</span>
            </div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.55rem',
              color: 'rgba(0,229,255,0.5)',
              letterSpacing: '0.2em',
            }}>
              AI DEFENSE SYSTEM
            </div>
          </div>
        </Link>

        {/* ── Status indicators (desktop) ── */}
        <div className="hidden md:flex items-center gap-4">
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem',
            color: '#00E573', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%', background: '#00E573',
              boxShadow: '0 0 6px #00E573',
              animation: 'cyber-pulse 2s infinite',
            }} />
            SYSTEM ONLINE
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem',
            color: '#FFD700', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            <FiAlertTriangle style={{ fontSize: '10px' }} />
            THREAT: LOW
          </div>
          <div style={{
            width: '1px', height: '20px',
            background: 'rgba(79,124,255,0.25)',
          }} />
        </div>

        {/* ── Nav links ── */}
        <div className="hidden md:flex items-center gap-1">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              id={`nav-${item.label.toLowerCase()}`}
              style={({ isActive }) => ({
                padding: '0.45rem 1rem',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: isActive ? '#00E5FF' : 'rgba(159,180,255,0.7)',
                background: isActive ? 'rgba(0,229,255,0.08)' : 'transparent',
                borderBottom: isActive ? '1px solid rgba(0,229,255,0.5)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
              })}
              className="hover:!text-[#00E5FF] hover:!bg-[rgba(0,229,255,0.06)]"
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* ── Auth CTA ── */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(159,180,255,0.7)', textDecoration: 'none',
                padding: '0.4rem 0.75rem',
                transition: 'color 0.2s',
              }}
                className="hover:!text-[#00E5FF]"
              >
                Log In
              </Link>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                Access System
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem',
                color: 'rgba(159,180,255,0.8)',
              }}>
                <FiActivity style={{ color: '#00E5FF', fontSize: '12px' }} />
                <span>{user.username.toUpperCase()}</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,59,92,0.6)', padding: '0.4rem',
                  transition: 'color 0.2s',
                }}
                className="hover:!text-[#FF3B5C]"
                title="Disconnect"
              >
                <FiLogOut style={{ fontSize: '16px' }} />
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          id="nav-mobile-toggle"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(159,180,255,0.7)', padding: '0.5rem',
          }}
          className="md:hidden hover:!text-[#00E5FF]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX style={{ fontSize: '20px' }} /> : <FiMenu style={{ fontSize: '20px' }} />}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(2, 8, 20, 0.98)',
              borderTop: '2px solid rgba(255,255,255,0.55)',
              borderBottom: '2px solid rgba(255,255,255,0.55)',
              backdropFilter: 'blur(20px)',
            }}
            className="md:hidden px-6 py-4 space-y-1"
          >
            {currentNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center',
                  padding: '0.6rem 0.75rem',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                  fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  color: isActive ? '#00E5FF' : 'rgba(159,180,255,0.7)',
                  background: isActive ? 'rgba(0,229,255,0.07)' : 'transparent',
                  borderLeft: isActive ? '2px solid #00E5FF' : '2px solid transparent',
                  transition: 'all 0.2s',
                })}
              >
                {item.label}
              </NavLink>
            ))}
            <div style={{ paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} style={{ padding: '0.5rem 0.75rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(159,180,255,0.7)', textDecoration: 'none' }}>
                    Log In
                  </Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                    Access System
                  </Link>
                </>
              ) : (
                <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 0.75rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF3B5C', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiLogOut /> Disconnect
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
