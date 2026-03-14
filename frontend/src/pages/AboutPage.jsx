import { motion } from 'framer-motion';
import { FiDatabase, FiCpu, FiAlertOctagon, FiShield, FiUsers, FiTarget, FiTrendingUp, FiActivity, FiGlobe, FiSmile, FiMic } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: 'easeOut' },
});

const datasets = [
  { name: 'Jigsaw Toxic Comment Dataset',   source: 'Google / Kaggle', size: '~160k comments' },
  { name: 'Cyberbullying Twitter Dataset',   source: 'Academic Research', size: '~47k tweets' },
  { name: 'Hate Speech Dataset',             source: 'Kaggle',         size: '~24k samples' },
];

const pipeline = [
  { icon: FiDatabase, step: '01', title: 'Data Ingestion',     desc: 'Raw text collected from diverse social media datasets across platforms.' },
  { icon: FiCpu,      step: '02', title: 'TF-IDF Vectorization', desc: 'Text transformed into numerical feature vectors using term frequency analysis.' },
  { icon: FiTarget,   step: '03', title: 'ML Classification',  desc: 'Logistic Regression and SVM models classify each message in milliseconds.' },
  { icon: FiShield,   step: '04', title: 'Result Delivery',    desc: 'Verdict, confidence score, and flagged terms returned to the moderator.' },
];

const team = [
  { name: 'ML Engineering',   desc: 'Built the NLP pipeline and trained classification models using real-world datasets.',   icon: FiCpu },
  { name: 'Product Design',   desc: 'Designed the detection UX for fast, intuitive content moderation workflows.',           icon: FiUsers },
  { name: 'Safety Research',  desc: 'Researched cyberbullying patterns and curated training data from multiple sources.',    icon: FiAlertOctagon },
];

const datasetStats = [
  { name: 'Non-Toxic', value: 155445, color: '#3b82f6' },
  { name: 'Cyberbullying', value: 76428, color: '#ec4899' },
];

const modelComparison = [
  { name: 'Logistic Reg', accuracy: 91 },
  { name: 'SVM', accuracy: 93 },
  { name: 'Stacking Ens.', accuracy: 94 },
];

const futureImprovements = [
  { title: 'Transformer Models', desc: 'Upgrade pipeline to use BERT/RoBERTa for deeper contextual understanding.', icon: FiCpu },
  { title: 'Multilingual Support', desc: 'Expand detection capabilities beyond English to global languages.', icon: FiGlobe },
  { title: 'Sarcasm Detection', desc: 'Implement advanced context windows to differentiate playful sarcasm from hostility.', icon: FiSmile },
  { title: 'Voice Toxicity', desc: 'Integrate Speech-to-Text inference to moderate real-time voice chat.', icon: FiMic },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-20">

      {/* ── Hero ── */}
      <motion.div {...fadeUp()}>
        <span className="section-badge mb-5 inline-flex">About CyberShield</span>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-100 leading-tight mb-5">
              Building Safer{' '}
              <span className="gradient-text">Digital Communities</span>
            </h1>
            <p className="text-slate-400 leading-relaxed mb-4">
              CyberShield is an AI-powered platform focused on detecting harmful text and reducing online harassment at scale. We combine advanced machine learning with intuitive moderation UX to help communities stay safe.
            </p>
            <p className="text-slate-500 leading-relaxed text-sm">
              Cyberbullying is one of the biggest threats in digital communication. Traditional moderation is slow and difficult at scale. CyberShield accelerates threat detection by scoring toxicity, flagging abusive language, and enabling real-time moderation insights.
            </p>
          </div>

          {/* Stats panel */}
          <div className="enterprise-card p-7 space-y-5">
            {[
              { icon: FiDatabase,     label: 'Messages Analyzed',                value: '231K+',   color: 'text-violet-400' },
              { icon: FiAlertOctagon, label: 'Cyberbullying cases detected',    value: '13,952', color: 'text-pink-400' },
              { icon: FiShield,       label: 'Model classification accuracy',   value: '92.31%',     color: 'text-blue-400' },
              { icon: FiCpu,          label: 'Training dataset records',        value: '3',  color: 'text-cyan-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="icon-pill flex-shrink-0">
                  <Icon className={`${color} text-base`} />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-100">{value}</p>
                  <p className="text-xs text-slate-600">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Datasets & Statistics ── */}
      <div>
        <motion.div {...fadeUp()} className="mb-10 text-center max-w-2xl mx-auto">
          <span className="section-badge mb-3 inline-flex">
            <FiDatabase className="text-xs" />
            Training Data
          </span>
          <h2 className="text-3xl font-black text-slate-100">
            Datasets & <span className="gradient-text">Distribution</span>
          </h2>
          <p className="text-slate-400 mt-4 text-sm">
            Our models were trained on a massive, combined corpus of real-world social media interactions.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
          <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {datasets.map((ds, i) => (
              <div key={ds.name} className="enterprise-card p-5">
                <FiDatabase className="text-blue-400 text-lg mb-3" />
                <h3 className="text-sm font-bold text-slate-100 mb-1">{ds.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{ds.source}</p>
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-white/[0.04] text-slate-300 border border-white/10">
                  {ds.size}
                </span>
              </div>
            ))}
            <div className="enterprise-card p-5 bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20">
              <FiActivity className="text-blue-400 text-lg mb-3" />
              <h3 className="text-sm font-bold text-blue-100 mb-1">Total Corpus</h3>
              <p className="text-xs text-blue-300/70 mb-3">Combined Size</p>
              <span className="inline-block px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                231,873 Samples
              </span>
            </div>
          </motion.div>

          {/* Dataset Chart */}
          <motion.div {...fadeUp(0.2)} className="enterprise-card p-6 h-[320px] flex flex-col items-center justify-center">
             <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Class Distribution</h3>
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datasetStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {datasetStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-xs text-slate-400">Cyberbullying (33%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-400">Safe (67%)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── ML Pipeline & Models ── */}
      <div>
        <motion.div {...fadeUp()} className="mb-10 text-center max-w-2xl mx-auto">
          <span className="section-badge mb-3 inline-flex">
            <FiCpu className="text-xs" />
            Technology
          </span>
          <h2 className="text-3xl font-black text-slate-100">
            ML Pipeline & <span className="gradient-text">Models</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {pipeline.map((p, i) => (
            <motion.div key={p.step} {...fadeUp(i * 0.1)} className="enterprise-card p-6">
              <div className="icon-pill mb-4">
                <p.icon className="text-blue-400 text-base" />
              </div>
              <div className="text-3xl font-black gradient-text mb-2 tabular-nums">{p.step}</div>
              <h3 className="text-base font-bold text-slate-100 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Model Comparison */}
        <motion.div {...fadeUp(0.3)} className="enterprise-card p-8 bg-gradient-to-br from-slate-900 to-[#0D0F1E] border-white/[0.08]">
          <div className="flex flex-col md:flex-row items-center justify-between xl:gap-20">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
               <h3 className="text-2xl font-bold text-white mb-3">Model Accuracy <br className="hidden md:block"/>Comparison</h3>
               <p className="text-sm text-slate-400 leading-relaxed">
                 We benchmarked multiple traditional ML algorithms. Our final Stacked Ensemble approach yielded the highest generalization accuracy across the varied validation sets.
               </p>
            </div>
            <div className="w-full md:w-2/3 h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelComparison} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" domain={[85, 100]} stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" stroke="#475569" tick={{fill: '#f8fafc', fontSize: 13, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={32}>
                    {modelComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#ec4899' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Future Improvements ── */}
      <div>
        <motion.div {...fadeUp()} className="mb-10 text-center max-w-2xl mx-auto">
          <span className="section-badge mb-3 inline-flex">
            <FiTrendingUp className="text-xs" />
            Roadmap
          </span>
          <h2 className="text-3xl font-black text-slate-100">
            Future <span className="gradient-text">Improvements</span>
          </h2>
          <p className="text-slate-400 mt-4 text-sm">
            Continuous iteration to expand our defensive capabilities and platform intelligence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {futureImprovements.map((feat, i) => (
            <motion.div key={feat.title} {...fadeUp(i * 0.1)} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="text-pink-400 text-lg" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Team ── */}
      <div>
        <motion.div {...fadeUp()} className="mb-10">
          <span className="section-badge mb-3 inline-flex">
            <FiUsers className="text-xs" />
            Team
          </span>
          <h2 className="text-3xl font-black text-slate-100">
            Built by a <span className="gradient-text">Passionate Team</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {team.map((t, i) => (
            <motion.div key={t.name} {...fadeUp(i * 0.1)} className="enterprise-card p-6">
              <div className="icon-pill mb-4">
                <t.icon className="text-violet-400 text-base" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">{t.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
