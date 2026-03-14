import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiAlertTriangle, FiActivity, FiUserX, FiCheckCircle,
  FiBarChart2, FiFilter, FiChevronDown
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import axios from 'axios';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, delay, ease: 'easeOut' },
});

const TOXICITY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#7c3aed'];
const PIE_COLORS = ['#10b981', '#f43f5e'];

// ── Filter Bar ───────────────────────────────────────────────
function FilterBar({ statusFilter, setStatusFilter, sortOrder, setSortOrder }) {
  return (
    <div className="flex flex-wrap gap-3 mb-5 items-center">
      <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
        <FiFilter className="text-slate-400" /> Filters
      </span>

      {/* Status filter */}
      <div className="flex bg-slate-900/70 border border-white/10 rounded-lg overflow-hidden text-xs font-semibold">
        {[
          { value: 'all',       label: 'All Users' },
          { value: 'active',    label: 'Active' },
          { value: 'suspended', label: 'Suspended' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-2 transition-colors ${
              statusFilter === value
                ? 'bg-neon-blue/20 text-neon-blue'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort order */}
      <div className="relative">
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="appearance-none bg-slate-900/70 border border-white/10 rounded-lg px-4 py-2 text-xs font-semibold text-slate-300 pr-8 focus:outline-none focus:border-neon-blue/50 cursor-pointer"
        >
          <option value="newest">Registered: Newest First</option>
          <option value="oldest">Registered: Oldest First</option>
          <option value="score_desc">Credibility: High to Low</option>
          <option value="score_asc">Credibility: Low to High</option>
          <option value="violations_desc">Violations: Most First</option>
        </select>
        <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs" />
      </div>
    </div>
  );
}

// ── Analytics Charts Panel ───────────────────────────────────
function AnalyticsPanel({ analytics, loading }) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 bg-slate-800/40 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analytics) return <p className="text-slate-500 text-center py-16">No analytics data available.</p>;

  const scatterAll = [
    ...(analytics.clusterVisualization?.lowRisk  || []).map(p => ({ ...p, cluster: 'Low Risk'  })),
    ...(analytics.clusterVisualization?.warning  || []).map(p => ({ ...p, cluster: 'Warning'   })),
    ...(analytics.clusterVisualization?.severe   || []).map(p => ({ ...p, cluster: 'Severe'    })),
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages',    value: analytics.summary.totalMessages,                color: 'text-blue-400' },
          { label: 'Violations',        value: analytics.summary.cyberbullyingCount,             color: 'text-rose-400' },
          { label: 'Avg Toxicity',      value: `${Math.round(analytics.summary.avgToxicity*100)}%`, color: 'text-amber-400' },
          { label: 'Detection Rate',    value: `${Math.round(analytics.summary.detectionRate*100)}%`, color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="enterprise-card p-5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">{label}</p>
            <p className={`text-3xl font-black tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Messages Over Time */}
        <div className="enterprise-card p-5 h-[260px] flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Messages Over Time (Platform-Wide)</p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="tGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                <XAxis dataKey="date" stroke="#475569" tick={{ fill:'#64748b', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <YAxis stroke="#475569" tick={{ fill:'#64748b', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ backgroundColor:'#0f172a', borderColor:'#1e293b', borderRadius:'8px' }} itemStyle={{ color:'#38bdf8' }}/>
                <Area type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2.5} fill="url(#tGrad2)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Distribution */}
        <div className="enterprise-card p-5 h-[260px] flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Prediction Distribution</p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.predictionDistribution}
                  cx="50%" cy="50%" outerRadius={85} innerRadius={45}
                  dataKey="value" paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#475569' }}
                >
                  {analytics.predictionDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor:'#0f172a', borderColor:'#1e293b', borderRadius:'8px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Toxicity Distribution */}
        <div className="enterprise-card p-5 h-[260px] flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Toxicity Distribution</p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.toxicityDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                <XAxis dataKey="bucket" stroke="#475569" tick={{ fill:'#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <YAxis stroke="#475569" tick={{ fill:'#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ backgroundColor:'#0f172a', borderColor:'#1e293b', borderRadius:'8px' }}/>
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {analytics.toxicityDistribution.map((_, i) => (
                    <Cell key={i} fill={TOXICITY_COLORS[i]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Analyzed Messages mini-table */}
        <div className="enterprise-card p-5 h-[260px] flex flex-col overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Recent Flagged Messages</p>
          <div className="flex-1 overflow-y-auto space-y-2">
            {analytics.recentMessages.filter(m => m.prediction === 1).slice(0, 8).length === 0 ? (
              <p className="text-slate-500 text-sm text-center pt-8">No flagged messages yet.</p>
            ) : (
              analytics.recentMessages.filter(m => m.prediction === 1).slice(0, 8).map(msg => (
                <div key={msg._id} className="flex items-start justify-between gap-2 p-3 bg-slate-900/50 rounded-xl border border-white/5 text-xs">
                  <p className="text-slate-300 truncate flex-1">{msg.text}</p>
                  <span className="shrink-0 text-rose-400 font-bold">{Math.round((msg.toxicityScore || 0) * 100)}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab]       = useState('users');
  const [users, setUsers]               = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [analytics, setAnalytics]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [analyticsLoading, setAL]       = useState(true);
  const [error, setError]               = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder]       = useState('newest');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users'),
        axios.get('http://localhost:5000/api/admin/logs'),
      ]);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch GLOBAL analytics (platform-wide, admin only)
  useEffect(() => {
    if (activeTab === 'analytics') {
      setAL(true);
      const token = localStorage.getItem('token');
      axios.get('http://localhost:5000/api/analytics/admin', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => setAnalytics(r.data))
        .catch(err => {
          console.error('Analytics fetch failed:', err.response?.status, err.response?.data);
          setAnalytics(null);
        })
        .finally(() => setAL(false));
    }
  }, [activeTab]);

  const handleSuspend = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/suspend`, { reason: 'Admin Manual Suspension' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to suspend user');
    }
  };

  // Apply filters + sort
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (statusFilter === 'active')    list = list.filter(u => !u.isSuspended);
    if (statusFilter === 'suspended') list = list.filter(u =>  u.isSuspended);

    switch (sortOrder) {
      case 'newest':         list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest':         list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'score_desc':     list.sort((a, b) => b.credibilityScore - a.credibilityScore); break;
      case 'score_asc':      list.sort((a, b) => a.credibilityScore - b.credibilityScore); break;
      case 'violations_desc':list.sort((a, b) => (b.violationsCount || 0) - (a.violationsCount || 0)); break;
    }
    return list;
  }, [users, statusFilter, sortOrder]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 text-center">
      <div className="inline-flex items-center gap-3 text-neon-blue">
        <span className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading admin dashboard...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 text-center text-red-400">
      <FiAlertTriangle className="text-4xl mx-auto mb-4" />
      <p>{error}</p>
    </div>
  );

  const TABS = [
    { id: 'users',     label: 'Users Management',   icon: FiUsers      },
    { id: 'logs',      label: 'Moderation Logs',    icon: FiActivity   },
    { id: 'analytics', label: 'Platform Analytics', icon: FiBarChart2  },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-20 space-y-8">
      <motion.div {...fadeUp()}>
        <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-2">
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-emerald-400">HQ</span>
        </h1>
        <p className="text-slate-400">Manage users, monitor moderation logs, and view platform-wide intelligence.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50 overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
              activeTab === id
                ? 'text-neon-blue border-b-2 border-neon-blue'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <motion.div key="users" {...fadeUp()}>
            <FilterBar
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              sortOrder={sortOrder}       setSortOrder={setSortOrder}
            />

            {/* Result count */}
            <p className="text-xs text-slate-500 mb-3">
              Showing <span className="text-slate-300 font-semibold">{filteredUsers.length}</span> of {users.length} users
            </p>

            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-white/5 text-xs uppercase tracking-wider text-slate-400">
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Credibility</th>
                      <th className="p-4 font-semibold">Activity</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-500">No users match the selected filters.</td></tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className={`hover:bg-white/[0.02] transition-colors ${u.isSuspended ? 'opacity-60' : ''}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${u.isSuspended ? 'bg-red-900/40 border border-red-700/30' : 'bg-slate-800'}`}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{u.username}</p>
                                <p className="text-xs text-slate-500">{u.email}</p>
                                <p className="text-[10px] text-slate-600 mt-0.5">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg border ${
                              u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>{u.role}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3 w-48">
                              <span className={`font-bold tabular-nums text-sm ${u.credibilityScore > 75 ? 'text-emerald-400' : u.credibilityScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {u.credibilityScore}
                              </span>
                              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${u.credibilityScore > 75 ? 'bg-emerald-400' : u.credibilityScore > 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                  style={{ width: `${u.credibilityScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                              <span className="flex items-center justify-between w-24">Posts: <span className="font-semibold text-slate-200">{u.postsCount || 0}</span></span>
                              <span className="flex items-center justify-between w-24">Comments: <span className="font-semibold text-slate-200">{u.commentsCount || 0}</span></span>
                              <span className="flex items-center justify-between w-24">Violations: <span className={`font-semibold ${u.violationsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{u.violationsCount || 0}</span></span>
                            </div>
                          </td>
                          <td className="p-4">
                            {u.isSuspended ? (
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400"><FiUserX /> Suspended</span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400"><FiCheckCircle /> Active</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleSuspend(u._id)}
                              disabled={u.isSuspended || u.role === 'admin'}
                              className="px-4 py-1.5 text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {u.isSuspended ? 'Suspended' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── LOGS TAB ── */}
        {activeTab === 'logs' && (
          <motion.div key="logs" {...fadeUp()}>
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-white/5 text-xs uppercase tracking-wider text-slate-400">
                      <th className="p-4 font-semibold">Time</th>
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold">Action Taken</th>
                      <th className="p-4 font-semibold">Reason / Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500">No moderation logs available.</td></tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-xs text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="p-4">
                            <p className="font-medium text-white">{log.user?.username}</p>
                            <p className="text-xs text-slate-500">{log.user?.email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg border inline-flex items-center gap-1.5 ${
                              log.actionTaken.includes('Suspended') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                              <FiAlertTriangle /> {log.actionTaken}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-300 max-w-sm">
                            <p className="mb-1">{log.reason}</p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <motion.div key="analytics" {...fadeUp()}>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-100 mb-1">
                Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-pink-400">Analytics</span>
              </h2>
              <p className="text-sm text-slate-400">Platform-wide intelligence across all users and messages.</p>
            </div>
            <AnalyticsPanel analytics={analytics} loading={analyticsLoading} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
