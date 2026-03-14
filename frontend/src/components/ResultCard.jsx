import { motion } from 'framer-motion';
import { FiAlertOctagon, FiCheckCircle, FiPercent, FiAlertTriangle, FiEdit3 } from 'react-icons/fi';

function HighlightedText({ text, abusiveWords = [] }) {
  if (!abusiveWords.length) return <span>{text}</span>;

  const pattern = new RegExp(`(${abusiveWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        abusiveWords.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="bg-pink-500/25 text-pink-300 rounded px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function ResultCard({ result, originalText }) {
  if (!result) return null;

  const isBullying = result.prediction === 1;
  const confidence = Math.round((result.confidence || 0) * 100);
  const toxicity   = Math.round((result.toxicityScore || 0) * 100);

  const getConfidenceExplanation = (conf) => {
    if (conf >= 95) return "The AI is extremely confident. The text shows unmistakable, unambiguous signals that strongly match its training data.";
    if (conf >= 85) return "The AI is highly confident. Clear and consistent linguistic patterns leave very little room for doubt.";
    if (conf >= 70) return "The AI is fairly confident. The text contains identifiable patterns, though minor ambiguity is present.";
    if (conf >= 55) return "The AI has moderate certainty. Some signals are mixed — the phrasing may carry dual meanings or implicit tone.";
    if (conf >= 40) return "The AI is uncertain. The message may rely on sarcasm, subtle context, or phrasing that is hard to classify definitively.";
    return "The AI has low confidence. The text is highly ambiguous — consider reviewing manually before acting on this result.";
  };

  const getToxicityExplanation = (tox, bullying) => {
    if (tox >= 85) return "Extremely toxic. The message contains severe, explicit abusive language or direct threats causing significant harm.";
    if (tox >= 65) return "Highly toxic. Multiple strong abusive terms or explicitly hostile phrasing were detected.";
    if (tox >= 45) return "Moderately toxic. The content contains noticeably harmful or aggressive language that could distress the recipient.";
    if (tox >= 25) return "Mildly toxic. Some elements may be hurtful or disrespectful depending on context, though not overtly abusive.";
    if (bullying) return "Borderline. Classified as potentially harmful but lacks explicit slurs — context and tone play a key role here.";
    return "Minimal toxicity. The message appears generally safe with little to no harmful content detected.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="enterprise-card overflow-hidden"
    >
      {/* Verdict Banner */}
      <div className={`px-6 py-4 flex items-center gap-3 ${
        isBullying
          ? 'bg-gradient-to-r from-pink-600/20 to-red-600/10 border-b border-pink-500/20'
          : 'bg-gradient-to-r from-green-600/15 to-emerald-600/10 border-b border-green-500/20'
      }`}>
        {isBullying
          ? <FiAlertOctagon className="text-pink-400 text-xl flex-shrink-0" />
          : <FiCheckCircle  className="text-green-400 text-xl flex-shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            {result.sttSource != null ? 'Voice Analysis Result' : 'Text Analysis Result'}
          </p>
          <h3 className={`text-lg font-bold ${isBullying ? 'text-pink-300' : 'text-green-300'}`}>
            {isBullying ? 'Cyberbullying Detected' : 'Content Appears Safe'}
          </h3>
        </div>

        {/* Language badge */}
        {result.language && (
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md flex-shrink-0 flex items-center gap-1 ${
            result.language === 'hindi'
              ? 'bg-orange-500/15 text-orange-300 border border-orange-500/25'
              : 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
          }`}>
            {result.language === 'hindi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
          </span>
        )}

        {/* STT source badge for voice results */}
        {result.sttSource && (
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/20 flex-shrink-0">
            {result.sttSource === 'web_speech' ? '🎙 Web Speech' : result.sttSource === 'whisper' ? '🤖 Whisper AI' : '⚠ No STT'}
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Confidence */}
          <div className="enterprise-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiPercent className="text-blue-400 text-sm" />
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Confidence</p>
            </div>
            <p className="text-2xl font-black text-slate-100">{confidence}%</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              />
            </div>
          </div>

          {/* Toxicity */}
          <div className="enterprise-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiAlertTriangle className={`text-sm ${toxicity > 50 ? 'text-pink-400' : 'text-amber-400'}`} />
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Toxicity Score</p>
            </div>
            <p className={`text-2xl font-black ${toxicity > 50 ? 'text-pink-300' : 'text-amber-300'}`}>
              {toxicity}%
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${toxicity}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className={`h-full rounded-full ${
                  toxicity > 50
                    ? 'bg-gradient-to-r from-pink-500 to-red-500'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Score Explanations */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="text-[11px] text-slate-500 leading-relaxed px-1">
            <strong className="text-slate-400">What this means:</strong> {getConfidenceExplanation(confidence)}
          </div>
          <div className="text-[11px] text-slate-500 leading-relaxed px-1">
            <strong className="text-slate-400">What this means:</strong> {getToxicityExplanation(toxicity, isBullying)}
          </div>
        </div>

        {/* Highlighted text or Transcription */}
        {(originalText || result.transcription) && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-2">
              {result.sttSource != null ? 'Detected Speech' : 'Analyzed Text'}
            </p>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-300 leading-relaxed">
              <HighlightedText text={result.transcription || originalText} abusiveWords={result.abusiveWords || []} />
            </div>
          </div>
        )}
        
        {/* Voice Insights Panel */}
        {result.sttSource != null && result.emotion && (
          <div className="mt-4 border-t border-white/[0.06] pt-5">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Voice Insights Panel
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               <div className="bg-[#131629] border border-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Speaker Emotion</div>
                  <div className={`font-bold capitalize ${
                    ["anger", "disgust"].includes(result.emotion) ? 'text-pink-400' : 
                    ["joy", "neutral"].includes(result.emotion) ? 'text-emerald-400' : 
                    'text-amber-400'
                  }`}>
                    {result.emotion}
                  </div>
               </div>
               
               <div className="bg-[#131629] border border-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Emotion Confidence</div>
                  <div className="text-slate-300 font-mono font-medium">
                    {Math.round((result.emotionConfidence || 0) * 100)}%
                  </div>
               </div>
               
               <div className="col-span-2 md:col-span-1 bg-[#131629] border border-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tone Aggression</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                       <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.round((result.aggressionScore || 0) * 100)}%`}}></div>
                    </div>
                    <span className="text-xs text-slate-300 font-mono">{Math.round((result.aggressionScore || 0) * 100)}%</span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Abusive words */}
        {result.abusiveWords?.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-2">
              Flagged Terms ({result.abusiveWords.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {result.abusiveWords.map((w) => (
                <span
                  key={w}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/20"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Message Rewrite Suggestion */}
        {isBullying && result.suggestedRewrite && (
          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center gap-2">
              <FiEdit3 className="text-emerald-400" />
              Suggested Rewrite
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-200 leading-relaxed italic flex items-start gap-3">
              <span className="text-xl leading-none">"</span>
              <span className="mt-1">{result.suggestedRewrite}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              * Choosing neutral phrasing helps maintain a safe and welcoming community.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
