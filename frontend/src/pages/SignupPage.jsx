import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        role,
      });
      // Account created — redirect to login. Do NOT auto-login.
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { registered: true } }), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
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
              <span className="auth-terminal-header-sub">New operator registration</span>
            </div>
            <span className="font-mono text-[11px] tracking-wider text-emerald-300">● OPEN</span>
          </div>

          <div className="auth-terminal-body">
            <h2 className="text-[2rem] font-cyber font-extrabold mb-1 text-center text-white">Request Access</h2>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300/80 text-center mb-6">Create your operator account</p>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-emerald-500/12 border-2 border-white/70 text-emerald-200 text-xs text-center flex items-center justify-center gap-2"
              >
                <FiCheckCircle className="text-emerald-300 text-base shrink-0" />
                Account created. Redirecting to login...
              </motion.div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/18 border-2 border-white/75 text-red-200 text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="auth-terminal-label">Operator Callsign</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-terminal-field"
                  placeholder="Unique username"
                />
              </div>

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

              <div>
                <label className="auth-terminal-label">Clearance Level</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="auth-terminal-field appearance-none"
                >
                  <option value="user">General Operator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-[#8052f0] to-[#4f7cff] text-[#ecf0ff] font-raj font-bold tracking-[0.16em] text-[12px] uppercase hover:opacity-95 transition-opacity flex justify-center items-center border-2 border-white/85"
              >
                {loading ? 'Provisioning...' : 'Register Operator'}
              </button>
            </form>

            <p className="mt-5 text-center text-[10px] uppercase tracking-[0.12em] text-slate-300/75">
              Already have credentials?{' '}
              <Link to="/login" className="text-white hover:text-cyan-200 transition-colors">
                Authenticate
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
