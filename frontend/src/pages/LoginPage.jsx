import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShieldOff, FiAlertOctagon, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function SuspendedModal({ onClose, reason }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 30 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="w-full max-w-sm bg-[#0F1525] border-2 border-red-600/70 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.25)] overflow-hidden"
        >
          {/* Red gradient header bar */}
          <div className="w-full h-1.5 bg-gradient-to-r from-red-700 via-red-500 to-rose-400" />

          <div className="p-8 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-red-600/20 blur-2xl scale-150" />
              <div className="relative w-16 h-16 rounded-full bg-red-600/10 border border-red-600/40 flex items-center justify-center">
                <FiShieldOff className="text-red-400 text-3xl" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-white mb-1">Account Suspended</h3>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-red-500 mb-4">
              <FiAlertOctagon className="text-sm" />
              Access Permanently Revoked
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {reason || 'Your account has been suspended due to multiple violations. You are no longer permitted to access this platform.'}
            </p>

            <div className="w-full p-3 bg-red-950/50 border border-red-800/40 rounded-lg text-xs text-red-300 leading-relaxed mb-6">
              If you believe this is a mistake, please contact support at <span className="font-medium text-red-200">support@cybershield.ai</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg bg-red-600/20 border border-red-600/40 text-red-300 font-semibold hover:bg-red-600/30 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [suspendedReason, setSuspendedReason] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      login(data, data.token);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.error === 'account_suspended') {
        setSuspendedReason(errData?.message || 'Your account has been blocked due to low credibility score and policy violations.');
        setSuspended(true);
      } else {
        setError(errData?.error || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {suspended && <SuspendedModal onClose={() => setSuspended(false)} reason={suspendedReason} />}

      <div className="min-h-[80vh] flex items-center justify-center pt-20 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[360px]"
        >
          <div className="auth-terminal relative overflow-hidden">
            <div className="auth-terminal-header">
              <div>
                <p className="auth-terminal-header-title">CYBERSHIELD</p>
                <span className="auth-terminal-header-sub">Secure authentication terminal</span>
              </div>
              <span className="font-mono text-[11px] tracking-wider text-emerald-300">● ONLINE</span>
            </div>

            <div className="auth-terminal-body">
              <h2 className="text-[2rem] font-cyber font-extrabold mb-1 text-center text-white">System Access</h2>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300/80 text-center mb-6">Enter credentials to authenticate</p>

              {justRegistered && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-emerald-500/12 border-2 border-white/70 text-emerald-200 text-xs text-center flex items-center justify-center gap-2"
                >
                  <FiCheckCircle className="text-emerald-300 text-base shrink-0" />
                  Account created successfully. Please log in.
                </motion.div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-500/18 border-2 border-white/75 text-red-200 text-xs text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="auth-terminal-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-terminal-field"
                    placeholder="operator@domain.com"
                  />
                </div>

                <div>
                  <label className="auth-terminal-label">Access Code</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-terminal-field"
                    placeholder="••••••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-[#4f7cff] to-[#00e5ff] text-[#031129] font-raj font-bold tracking-[0.16em] text-[12px] uppercase hover:opacity-95 transition-opacity flex justify-center items-center border-2 border-white/85"
                >
                  {loading ? 'Authenticating...' : 'Authenticate'}
                </button>
              </form>

              <p className="mt-5 text-center text-[10px] uppercase tracking-[0.12em] text-slate-300/75">
                No access credentials?{' '}
                <Link to="/signup" className="text-white hover:text-cyan-200 transition-colors">
                  Request Access
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
