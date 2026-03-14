import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity, FiShield, FiTrendingUp, FiMessageCircle,
  FiAlertOctagon, FiCheckCircle, FiAlertTriangle, FiClock
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
});

const TOXICITY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#7c3aed'];
const PIE_COLORS = ['#10b981', '#f43f5e'];
const CLUSTER_COLORS = { lowRisk: '#10b981', warning: '#f59e0b', severe: '#f43f5e' };

function StatCard({ icon: Icon, label, value, color = 'text-white', sub }) {
  return (
    <div className="enterprise-card p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`text-sm ${color}`} />
        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className={`text-3xl font-black tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

const CustomScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-w-xs text-xs shadow-xl">
      <p className="text-slate-400 italic mb-1 line-clamp-2">"{d.text}..."</p>
      <p>Toxicity: <span className="text-pink-400 font-bold">{d.x}%</span></p>
      <p>Confidence: <span className="text-blue-400 font-bold">{d.y}%</span></p>
      <p>Prediction: <span className={d.prediction === 1 ? 'text-red-400' : 'text-emerald-400'} style={{fontWeight:'bold'}}>
        {d.prediction === 1 ? 'Cyberbullying' : 'Safe'}
      </span></p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/social/stats'),
          axios.get('http://localhost:5000/api/analytics'),
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentScore = user?.credibilityScore ?? 100;

  const safetyBreakdown = stats ? [
    { name: 'Safe',    count: stats.safeMessages,    color: '#10b981' },
    { name: 'Warned',  count: stats.warnedMessages,  color: '#f59e0b' },
    { name: 'Blocked', count: stats.blockedMessages,  color: '#f43f5e' },
  ] : [];

  const scatterData = analytics
    ? [
        ...(analytics.clusterVisualization?.lowRisk  || []).map(p => ({ ...p, cluster: 'lowRisk' })),
        ...(analytics.clusterVisualization?.warning  || []).map(p => ({ ...p, cluster: 'warning' })),
        ...(analytics.clusterVisualization?.severe   || []).map(p => ({ ...p, cluster: 'severe' })),
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-20 space-y-12">

      {/* ────── PERSONAL ACTIVITY SECTION ────── */}
      <section>
        <motion.div {...fadeUp()} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-2">
              Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Analytics</span>
            </h1>
            <p className="text-slate-400">Track your communication safety, credibility trends, and community impact.</p>
          </div>
          <div className="enterprise-card px-6 py-4 flex items-center gap-4 border-white/10">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xl border-2 border-slate-700">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">Welcome back,</p>
              <p className="text-lg font-bold text-white">{user?.username}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Credibility card */}
          <motion.div {...fadeUp(0.1)} className="enterprise-card p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="text-blue-400" />
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Current Credibility</h3>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className={`text-6xl font-black ${currentScore > 75 ? 'text-emerald-400' : currentScore > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {currentScore}
                </span>
                <span className="text-xl text-slate-500 font-medium mb-1">/ 100</span>
              </div>
            </div>
            <div className="mt-8">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  className={`h-full rounded-full ${currentScore > 75 ? 'bg-emerald-400' : currentScore > 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                {currentScore > 75 ? 'Excellent standing! Your communications are positive.' : 'Warning: Credibility dropping. Review community guidelines.'}
              </p>
            </div>
          </motion.div>

          {/* Credibility trend */}
          <motion.div {...fadeUp(0.2)} className="enterprise-card p-6 lg:col-span-2 h-[280px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-neon-purple" />
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">7-Day Credibility Trend</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              {loading ? <div className="h-full flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading...</div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.credibilityHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#cGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Platform Activity */}
          <motion.div {...fadeUp(0.3)} className="enterprise-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <FiActivity className="text-emerald-400" />
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Platform Activity</h3>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-slate-800/50 rounded-xl animate-pulse"/>)}</div>
            ) : (
              <div className="flex flex-col gap-3">
                {[['Total Posts', stats?.postsCount ?? 0], ['Comments Made', stats?.commentsCount ?? 0], ['Messages Sent', stats?.messagesCount ?? 0]].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
                    <span className="text-sm text-slate-300">{label}</span>
                    <span className="text-xl font-bold text-white tabular-nums">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Message Safety Breakdown */}
          <motion.div {...fadeUp(0.4)} className="enterprise-card p-6 lg:col-span-2 h-[280px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <FiMessageCircle className="text-pink-400" />
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Message Safety Breakdown</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              {loading ? <div className="h-full flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading...</div>
              : safetyBreakdown.every(s=>s.count===0) ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <span className="text-4xl mb-3">✅</span>
                  <p className="text-sm">No messages yet — start a conversation!</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safetyBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" stroke="#475569" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="name" type="category" stroke="#475569" tick={{fill:'#f8fafc',fontSize:13,fontWeight:500}} axisLine={false} tickLine={false}/>
                    <Tooltip cursor={{fill:'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor:'#0f172a',borderColor:'#1e293b',borderRadius:'8px'}}/>
                    <Bar dataKey="count" radius={[0,4,4,0]} barSize={32}>
                      {safetyBreakdown.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────── MODERATION INTELLIGENCE SECTION ────── */}
      <section>
        <motion.div {...fadeUp(0)}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-neon-blue px-2 py-0.5 bg-neon-blue/10 rounded">Analytics Dashboard</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-100 mb-1">
            Moderation <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-pink-400">Intelligence</span>
          </h2>
          <p className="text-slate-400 mb-8">Understand trends and detect patterns from AI analysis.</p>
        </motion.div>

        {/* Stat row */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i=><div key={i} className="h-28 bg-slate-800/50 rounded-2xl animate-pulse"/>)}
          </div>
        ) : (
          <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FiMessageCircle} label="Total Messages" value={analytics?.summary?.totalMessages ?? 0} color="text-blue-400" sub="Analyzed by AI"/>
            <StatCard icon={FiAlertOctagon}  label="Violations Detected" value={analytics?.summary?.cyberbullyingCount ?? 0} color="text-rose-400" sub="Cyberbullying flags"/>
            <StatCard icon={FiAlertTriangle} label="Avg Toxicity" value={`${Math.round((analytics?.summary?.avgToxicity ?? 0) * 100)}%`} color="text-amber-400" sub="Across all messages"/>
            <StatCard icon={FiCheckCircle}   label="Detection Rate" value={`${Math.round((analytics?.summary?.detectionRate ?? 0) * 100)}%`} color="text-emerald-400" sub="Bullying caught"/>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Messages Over Time */}
          <motion.div {...fadeUp(0.1)} className="enterprise-card p-6 h-[280px] flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Messages Over Time</h3>
            <div className="flex-1 min-h-0">
              {loading ? <div className="h-full animate-pulse bg-slate-800/50 rounded-xl"/> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.timeline || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                    <XAxis dataKey="date" stroke="#475569" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis stroke="#475569" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{backgroundColor:'#0f172a',borderColor:'#1e293b',borderRadius:'8px'}} itemStyle={{color:'#38bdf8'}}/>
                    <Area type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2.5} fill="url(#tGrad)"/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Prediction Distribution Pie */}
          <motion.div {...fadeUp(0.15)} className="enterprise-card p-6 h-[280px] flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Prediction Distribution</h3>
            <div className="flex-1 min-h-0">
              {loading ? <div className="h-full animate-pulse bg-slate-800/50 rounded-xl"/> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics?.predictionDistribution || []} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#475569' }}
                    >
                      {(analytics?.predictionDistribution || []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor:'#0f172a',borderColor:'#1e293b',borderRadius:'8px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Toxicity Distribution */}
          <motion.div {...fadeUp(0.2)} className="enterprise-card p-6 h-[280px] flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Toxicity Distribution</h3>
            <div className="flex-1 min-h-0">
              {loading ? <div className="h-full animate-pulse bg-slate-800/50 rounded-xl"/> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.toxicityDistribution || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                    <XAxis dataKey="bucket" stroke="#475569" tick={{fill:'#94a3b8',fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis stroke="#475569" tick={{fill:'#94a3b8',fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{backgroundColor:'#0f172a',borderColor:'#1e293b',borderRadius:'8px'}}/>
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {(analytics?.toxicityDistribution || []).map((_,i) => (
                        <Cell key={i} fill={TOXICITY_COLORS[i]}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Message Clusters - Scatter plot */}
          <motion.div {...fadeUp(0.25)} className="enterprise-card p-6 h-[280px] flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Message Clusters (Toxicity vs Confidence)</h3>
            <div className="flex-1 min-h-0">
              {loading ? <div className="h-full animate-pulse bg-slate-800/50 rounded-xl"/> : (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis type="number" dataKey="x" domain={[0,100]} name="Toxicity" unit="%" stroke="#475569" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis type="number" dataKey="y" domain={[0,100]} name="Confidence" unit="%" stroke="#475569" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                    <ZAxis range={[40, 40]}/>
                    <Tooltip content={<CustomScatterTooltip />}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'11px'}}/>
                    {Object.entries(CLUSTER_COLORS).map(([cluster, color]) => (
                      <Scatter
                        key={cluster}
                        name={cluster === 'lowRisk' ? 'Low Risk' : cluster === 'warning' ? 'Warning' : 'Severe'}
                        data={scatterData.filter(d => d.cluster === cluster)}
                        fill={color}
                        fillOpacity={0.8}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Analyzed Messages Table */}
        <motion.div {...fadeUp(0.3)} className="enterprise-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <FiClock className="text-slate-400" />
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Recent Analyzed Messages</h3>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="h-10 bg-slate-800/50 rounded animate-pulse"/>)}</div>
          ) : !analytics?.recentMessages?.length ? (
            <div className="p-12 text-center text-slate-500">No messages analyzed yet. Use the Detection tool!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 border-b border-white/5">
                    <th className="p-4 font-semibold">Text</th>
                    <th className="p-4 font-semibold">Prediction</th>
                    <th className="p-4 font-semibold">Confidence</th>
                    <th className="p-4 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {analytics.recentMessages.map((msg) => (
                    <tr key={msg._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-slate-300 max-w-xs">
                        <p className="truncate">{msg.text}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                          msg.prediction === 1
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {msg.prediction === 1 ? <FiAlertOctagon/> : <FiCheckCircle/>}
                          {msg.prediction === 1 ? 'Cyberbullying' : 'Safe'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-blue-400">{Math.round((msg.confidence || 0) * 100)}%</td>
                      <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(msg.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
