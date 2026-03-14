import Message from '../models/Message.js';

// Shared analytics computation helper (accepts a MongoDB filter)
async function buildAnalytics(filter = {}) {
  const allMessages = await Message.find(filter).sort({ timestamp: -1 });
  const totalMessages = allMessages.length;
  const cyberbullyingCount = allMessages.filter(m => m.prediction === 1).length;
  const avgToxicity = totalMessages
    ? allMessages.reduce((s, m) => s + (m.toxicityScore || 0), 0) / totalMessages
    : 0;

  const timelineMap = new Map();
  for (const m of allMessages) {
    const date = new Date(m.timestamp).toISOString().split('T')[0];
    timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
  }
  const timeline = Array.from(timelineMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const toxicityDistribution = [
    { bucket: '0 - 20%', count: 0 },
    { bucket: '21 - 40%', count: 0 },
    { bucket: '41 - 60%', count: 0 },
    { bucket: '61 - 80%', count: 0 },
    { bucket: '81 - 100%', count: 0 },
  ];
  allMessages.forEach(m => {
    const idx = Math.min(4, Math.floor(Math.min(1, Math.max(0, m.toxicityScore || 0)) * 5));
    toxicityDistribution[idx].count += 1;
  });

  const clusterVisualization = { lowRisk: [], warning: [], severe: [] };
  allMessages.forEach(m => {
    const toxicity = Math.min(1, Math.max(0, m.toxicityScore || 0));
    const confidence = Math.min(1, Math.max(0, m.confidence || 0));
    const cluster =
      toxicity >= 0.7 || (m.prediction === 1 && toxicity >= 0.55) ? 'severe' :
      toxicity >= 0.35 || m.prediction === 1 ? 'warning' : 'lowRisk';
    clusterVisualization[cluster].push({
      id: String(m._id),
      x: Math.round(toxicity * 100),
      y: Math.round(confidence * 100),
      prediction: m.prediction,
      text: m.text.slice(0, 90),
    });
  });

  return {
    summary: {
      totalMessages,
      cyberbullyingCount,
      avgToxicity,
      detectionRate: totalMessages ? cyberbullyingCount / totalMessages : 0,
    },
    timeline,
    predictionDistribution: [
      { name: 'Safe', value: totalMessages - cyberbullyingCount },
      { name: 'Cyberbullying', value: cyberbullyingCount },
    ],
    toxicityDistribution,
    clusterVisualization,
    recentMessages: allMessages.slice(0, 12),
  };
}

// GET /api/analytics  ← user-scoped (filtered by senderId)
export async function getAnalytics(req, res) {
  try {
    const userFilter = req.user ? { senderId: req.user._id } : {};
    const data = await buildAnalytics(userFilter);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Analytics error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
}

// GET /api/analytics/admin  ← platform-wide (all messages, admin only)
export async function getAdminAnalytics(req, res) {
  try {
    const data = await buildAnalytics({});
    return res.status(200).json(data);
  } catch (error) {
    console.error('Admin analytics error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch admin analytics.' });
  }
}
