import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertOctagon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [violations, setViolations] = useState(0);
  const score = user?.credibilityScore ?? 0;
  const scoreColor = score > 75 ? 'text-emerald-300' : score > 40 ? 'text-yellow-300' : 'text-red-300';
  const scoreBarColor = score > 75 ? 'bg-emerald-400' : score > 40 ? 'bg-yellow-400' : 'bg-red-400';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/auth/profile');
        setViolations(data.violationsCount || 0);
        updateUser({ credibilityScore: data.credibilityScore });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="max-w-[420px] mx-auto pt-24 px-4 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-terminal relative overflow-hidden">
        <div className="auth-terminal-header">
          <div>
            <p className="auth-terminal-header-title">CYBERSHIELD</p>
            <span className="auth-terminal-header-sub">Operator profile terminal</span>
          </div>
          <span className="font-mono text-[11px] tracking-wider text-emerald-300">● ACTIVE</span>
        </div>

        <div className="auth-terminal-body">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-800/90 flex items-center justify-center text-4xl font-black text-white mb-4 border-4 border-white/65">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-4xl font-cyber font-extrabold text-white mb-1">{user?.username}</h1>
            <p className="text-slate-300 mb-7">{user?.email}</p>

            <div className="w-full bg-slate-900/60 p-5 border-2 border-white/70 mb-5 text-center">
              <h3 className="text-sm font-raj font-bold text-slate-300 mb-2 uppercase tracking-[0.14em]">Credibility Score</h3>
              <div className="flex items-end justify-center gap-2">
                <span className={`text-6xl font-black tabular-nums ${scoreColor}`}>{score}</span>
                <span className="text-3xl text-slate-500 font-medium pb-2">/ 100</span>
              </div>

              <div className="w-full bg-slate-800 h-3 mb-2 mt-5 overflow-hidden border border-white/25">
                <div className={`h-3 ${scoreBarColor}`} style={{ width: `${score}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Maintain a high credibility score by keeping your interactions positive and safe.
              </p>
            </div>

            <div className="w-full bg-red-500/8 p-4 border-2 border-white/72 mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/15 border border-white/60 text-red-300">
                  <FiAlertOctagon className="text-lg" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-raj font-bold tracking-[0.1em] uppercase text-slate-200">Policy Violations</h3>
                  <p className="text-[11px] text-slate-400">Recorded abusive language incidents</p>
                </div>
              </div>
              <div className="text-3xl font-black text-red-300 tabular-nums">{violations}</div>
            </div>

            <button
              onClick={logout}
              className="w-full py-3 px-4 border-2 border-white/80 text-red-300 font-raj font-bold tracking-[0.14em] text-xs uppercase hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
