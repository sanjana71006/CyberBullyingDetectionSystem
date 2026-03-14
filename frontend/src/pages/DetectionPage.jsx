import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertCircle, FiZap, FiEdit3, FiArrowRight,
  FiMic, FiSquare, FiUploadCloud, FiMessageSquare,
  FiRefreshCw, FiVolume2, FiCpu, FiImage,
} from 'react-icons/fi';
import { analyzeText, analyzeVoice, analyzeVoiceText, saveAnalysis } from '../utils/api';
import ResultCard from '../components/ResultCard';

const sampleText = 'You are so dumb and worthless, nobody likes you.';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});

// ─── Web Speech API hook ────────────────────────────────────────────────────
function useWebSpeech() {
  const recognitionRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeechListening, setIsSpeechListening] = useState(false);
  const [transcript, setTranscript] = useState('');       // confirmed final text
  const [interimText, setInterimText] = useState('');    // live in-progress words
  const [speechError, setSpeechError] = useState('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (event) => {
      let finalBuffer = '';
      let interimBuffer = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalBuffer += chunk;
        } else {
          interimBuffer += chunk;
        }
      }
      if (finalBuffer) setTranscript((prev) => (prev + ' ' + finalBuffer).trim());
      setInterimText(interimBuffer);
    };

    recog.onerror = (e) => {
      const msgs = {
        'not-allowed':   'Microphone access denied. Please allow permissions in your browser.',
        'no-speech':     'No speech detected. Please speak more clearly.',
        'audio-capture': 'Microphone unavailable. Check your device settings.',
        'network':       'Network error during speech recognition.',
      };
      setSpeechError(msgs[e.error] || `Recognition error: ${e.error}`);
      setIsSpeechListening(false);
    };

    recog.onend = () => { setIsSpeechListening(false); setInterimText(''); };
    recognitionRef.current = recog;
  }, []);

  const startListening = useCallback(() => {
    setTranscript('');
    setInterimText('');
    setSpeechError('');
    try {
      recognitionRef.current?.start();
      setIsSpeechListening(true);
    } catch {
      setSpeechError('Could not start microphone. Check browser permissions.');
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsSpeechListening(false);
    setInterimText('');
  }, []);

  return { isSupported, isSpeechListening, transcript, interimText, speechError,
           startListening, stopListening, setTranscript };
}

// ─── Copy-to-clipboard helper ────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy transcript"
      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-violet-300 border border-white/10 hover:border-violet-500/30 rounded-lg px-2.5 py-1.5 transition-all"
    >
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  );
}

function WaveformVisualizer({ isActive, color = '#8B5CF6' }) {
  const bars = 22;
  return (
    <div className="flex items-center justify-center gap-[3px] h-14">
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ background: color }}
          animate={isActive
            ? { height: [8, Math.random() * 40 + 16, 8], opacity: [0.5, 1, 0.5] }
            : { height: 8, opacity: 0.3 }
          }
          transition={{ duration: 0.45 + i * 0.02, repeat: Infinity, repeatType: 'mirror', delay: i * 0.04 }}
        />
      ))}
    </div>
  );
}

// ─── Risk badge ──────────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  if (score >= 0.65) return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
      🔴 Severe Risk
    </span>
  );
  if (score >= 0.35) return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
      🟡 Moderate Risk
    </span>
  );
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      🟢 Safe
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DetectionPage() {
  const [inputType, setInputType] = useState('text');

  // ── Text mode state ──
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [liveResult, setLiveResult] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  // ── Voice mode state ──
  const [voiceMode, setVoiceMode] = useState('web'); // 'web' | 'upload'
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [voiceFile, setVoiceFile] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isMediaRecording, setIsMediaRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [processingStep, setProcessingStep] = useState(''); // feedback during analysis

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Web Speech API
  const {
    isSupported: speechSupported,
    isSpeechListening,
    transcript,
    interimText,
    speechError,
    startListening,
    stopListening,
    setTranscript,
  } = useWebSpeech();

  // ── Live text debounce ──
  useEffect(() => {
    if (inputType !== 'text') return;
    const h = setTimeout(async () => {
      if (!text.trim()) { setLiveResult(null); return; }
      setLiveLoading(true);
      try { setLiveResult(await analyzeText(text)); } catch { /* silent */ }
      finally { setLiveLoading(false); }
    }, 650);
    return () => clearTimeout(h);
  }, [text, inputType]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ── MediaRecorder (for upload path only) ──
  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setVoiceFile(null);
      };
      mediaRecorderRef.current.start();
      setIsMediaRecording(true);
      setRecordingTime(0);
      setVoiceError('');
      setResult(null);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch {
      setVoiceError('Microphone access denied or unavailable. Check your browser permissions.');
    }
  };

  const stopMediaRecording = () => {
    if (mediaRecorderRef.current && isMediaRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsMediaRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setVoiceError('Please upload a valid audio file (.mp3, .wav, .webm, .ogg)');
      return;
    }
    setVoiceFile(file);
    setAudioBlob(null);
    setAudioUrl(URL.createObjectURL(file));
    setRecordingTime(0);
    setResult(null);
    setVoiceError('');
  };

  const clearVoice = () => {
    setAudioBlob(null);
    setVoiceFile(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setResult(null);
    setVoiceError('');
    setProcessingStep('');
    if (isMediaRecording) stopMediaRecording();
    if (isSpeechListening) stopListening();
  };

  const runTextAnalysis = async (textToAnalyze, stepLabel = 'Analyzing text…') => {
    if (!textToAnalyze.trim()) {
      setError('Please enter a message to analyze.');
      return;
    }

    setLoading(true);
    setProcessingStep(stepLabel);
    try {
      const response = await analyzeText(textToAnalyze);
      setResult(response);
      await saveAnalysis({
        text: textToAnalyze,
        prediction: response.prediction,
        confidence: response.confidence,
        toxicityScore: response.toxicityScore,
        abusiveWords: response.abusiveWords,
      }).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze message. Please try again.');
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  const handleImageTextExtraction = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      e.target.value = '';
      return;
    }

    setError('');
    setResult(null);
    setOcrLoading(true);
    setOcrProgress(0);

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));

    try {
      setProcessingStep('Loading OCR engine…');
      const Tesseract = await import('tesseract.js');
      const { createWorker } = Tesseract;

      // Use createWorker so we can load both English and Hindi (Devanagari) language data
      const worker = await createWorker('eng+hin', 1, {
        logger: (message) => {
          if (message.status === 'recognizing text') {
            const progress = Math.round((message.progress || 0) * 100);
            setOcrProgress(progress);
            setProcessingStep(`Extracting text from image… ${progress}%`);
          } else if (message.status === 'loading language traineddata') {
            setProcessingStep('Loading language data…');
          }
        },
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const extractedText = (data?.text || '')
        .replace(/\r/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!extractedText) {
        setError('No readable text found in the image. Try a clearer image.');
        return;
      }

      setText(extractedText);
      await runTextAnalysis(extractedText, 'Analyzing extracted image text…');
    } catch {
      setError('Image text extraction failed. Please try another image.');
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  // ── Analysis runner ──
  const runAnalysis = async () => {
    setError('');
    setVoiceError('');

    if (inputType === 'text') {
      await runTextAnalysis(text);
      return;
    }

    // ── Voice mode ──
    if (voiceMode === 'web') {
      // Path A: Web Speech API provided a transcript
      if (isSpeechListening) stopListening();
      const finalTranscript = transcript.trim();
      if (!finalTranscript) {
        setVoiceError('No speech detected. Please click "🎙 Live Record", speak, then click "Stop & Analyze".');
        return;
      }
      setLoading(true);
      setProcessingStep('Analyzing transcription…');
      try {
        const response = await analyzeVoiceText(finalTranscript);
        setResult(response);
        await saveAnalysis({
          text: finalTranscript,
          prediction: response.prediction,
          confidence: response.confidence,
          toxicityScore: response.toxicityScore,
          abusiveWords: response.abusiveWords,
        }).catch(() => {});
      } catch (err) {
        setVoiceError(err.response?.data?.error || 'Analysis service unavailable. Please try again.');
      } finally {
        setLoading(false);
        setProcessingStep('');
      }
    } else {
      // Path B: Upload audio → server Whisper
      const audioToAnalyze = audioBlob || voiceFile;
      if (!audioToAnalyze) { setVoiceError('Please record or upload an audio file first.'); return; }
      setLoading(true);
      setResult(null);
      setProcessingStep('Uploading audio…');
      try {
        setProcessingStep('Converting speech to text (Whisper AI)…');
        const response = await analyzeVoice(audioToAnalyze, voiceFile?.name);
        if (response.transcription?.startsWith('No speech detected')) {
          setVoiceError('No speech detected in this recording. Please speak clearly and try again.');
        } else {
          setResult(response);
          await saveAnalysis({
            text: response.transcription,
            prediction: response.prediction,
            confidence: response.confidence,
            toxicityScore: response.toxicityScore,
            abusiveWords: response.abusiveWords,
          }).catch(() => {});
        }
      } catch (err) {
        setVoiceError(err.response?.data?.error || 'Voice analysis failed. Check that the ML server is running.');
      } finally {
        setLoading(false);
        setProcessingStep('');
      }
    }
  };

  // ── Voice web mode – combined start/stop ──
  const handleWebSpeechToggle = () => {
    if (isSpeechListening) {
      stopListening();
    } else {
      setResult(null);
      setVoiceError('');
      setProcessingStep('');
      startListening();
    }
  };

  const activeInput = inputType === 'text'
    ? (!!text || !!imagePreview)
    : (voiceMode === 'web' ? !!transcript : !!(audioBlob || voiceFile));
  const displayError = voiceError || speechError || error;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">

      {/* ── Page header ── */}
      <motion.div {...fadeUp()} className="mb-12">
        <span className="section-badge mb-4 inline-flex">
          <FiZap className="text-xs" />
          AI Detection Console
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-100 leading-tight">
          Detect Cyberbullying in{' '}
          <span className="gradient-text">Text &amp; Voice</span>
        </h1>
        <p className="text-slate-500 mt-3 max-w-xl leading-relaxed">
          Paste a message or speak into the mic. CyberShield's AI evaluates toxicity, emotional
          aggression and abusive intent in real time.
        </p>
      </motion.div>

      {/* ── Mode toggle ── */}
      <motion.div {...fadeUp(0.05)} className="mb-6 flex bg-[#131629] p-1.5 rounded-xl border border-white/[0.06] w-fit">
        {[['text', <FiMessageSquare />, 'Text Input'], ['voice', <FiMic />, 'Voice Audio']].map(([val, icon, label]) => (
          <button
            key={val}
            onClick={() => { setInputType(val); setError(''); setVoiceError(''); setResult(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 border ${
              inputType === val
                ? val === 'text'
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-violet-600/20 text-violet-400 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </motion.div>

      {/* ── Two-column grid ── */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT PANEL ── */}
        <motion.div {...fadeUp(0.1)} className="space-y-4">
          <div className="enterprise-card overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-[#131629]">
              {inputType === 'text'
                ? <FiEdit3 className="text-blue-400 text-sm" />
                : <FiMic className="text-violet-400 text-sm" />}
              <span className="text-xs text-slate-500 font-medium">
                {inputType === 'text' ? 'Message Input' : 'Voice Detection'}
              </span>
              {inputType === 'text' && (
                <span className="ml-auto text-xs text-slate-700 font-mono">{text.length} chars</span>
              )}
            </div>

            <div className="p-5 space-y-4">
              <AnimatePresence mode="wait">
                {/* ──────── TEXT MODE ──────── */}
                {inputType === 'text' && (
                  <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="mb-3">
                      <div className="flex items-center flex-wrap gap-2 justify-between mb-2">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={ocrLoading || loading}
                          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider border-2 border-white/70 text-slate-200 hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                          <FiImage /> Extract Text From Image
                        </button>
                        {ocrLoading && (
                          <span className="text-xs text-cyan-300 font-semibold">OCR {ocrProgress}%</span>
                        )}
                      </div>

                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageTextExtraction}
                      />

                      {imagePreview && (
                        <div className="mb-2 p-2 border border-white/20 bg-slate-900/40 rounded-lg">
                          <img src={imagePreview} alt="Uploaded for OCR" className="max-h-40 w-auto object-contain mx-auto" />
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500">
                        Upload an image or screenshot. Text will be extracted and analyzed automatically.
                      </p>
                    </div>

                    <textarea
                      id="message"
                      rows={9}
                      value={text}
                      onChange={(e) => { setText(e.target.value); setError(''); setResult(null); }}
                      placeholder="Paste a social media comment, chat message, or any text to analyze…"
                      className="cyber-input w-full"
                    />
                    {text.trim() && (
                      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-slate-900/50 mt-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Toxicity:</span>
                        {liveLoading
                          ? <span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          : liveResult
                            ? <span className={`text-sm font-black ${liveResult.toxicityScore * 100 > 75 ? 'text-pink-400' : liveResult.toxicityScore * 100 > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {Math.round(liveResult.toxicityScore * 100)}%
                              </span>
                            : <span className="text-sm text-slate-500">-</span>
                        }
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ──────── VOICE MODE ──────── */}
                {inputType === 'voice' && (
                  <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

                    {/* Voice sub-mode tabs */}
                    <div className="flex gap-2">
                      {[
                        ['web', <FiMic />, 'Live Record', speechSupported],
                        ['upload', <FiUploadCloud />, 'Upload File', true],
                      ].map(([val, icon, label, available]) => (
                        <button
                          key={val}
                          onClick={() => { setVoiceMode(val); clearVoice(); }}
                          disabled={!available}
                          title={!available ? 'Not supported in this browser' : ''}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                            voiceMode === val
                              ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                              : 'text-slate-500 border-white/5 hover:text-slate-300 hover:border-white/10'
                          } ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>

                    {/* ─ Web Speech mode ─ */}
                    {voiceMode === 'web' && (
                      <div className="flex flex-col gap-4">
                        {!speechSupported && (
                          <div className="text-center px-6 py-5 rounded-xl border border-amber-500/20 bg-amber-500/8 text-sm text-amber-300">
                            <FiAlertCircle className="mx-auto mb-2 text-xl" />
                            Web Speech API is not available in this browser.<br />
                            <span className="text-amber-400 font-semibold">Use Chrome or Edge</span>, or switch to
                            "Upload File" mode to use server-side Whisper transcription.
                          </div>
                        )}

                        {speechSupported && (
                          <>
                            {/* Waveform + mic button */}
                            <div className="flex flex-col items-center gap-3 pt-2">
                              <WaveformVisualizer isActive={isSpeechListening} color={isSpeechListening ? '#EC4899' : '#8B5CF6'} />

                              {isSpeechListening && (
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                                  <span className="text-xs text-pink-400 font-semibold tracking-wide uppercase">Listening…</span>
                                </div>
                              )}

                              <button
                                onClick={handleWebSpeechToggle}
                                className={`flex items-center gap-2 px-7 py-3 rounded-full font-semibold transition-all text-sm ${
                                  isSpeechListening
                                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50 hover:bg-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.25)]'
                                    : 'bg-violet-600/20 text-violet-400 border border-violet-500/50 hover:bg-violet-600/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                                }`}
                              >
                                {isSpeechListening
                                  ? <><FiSquare className="text-pink-400" /> Stop Recording</>
                                  : <><FiMic /> {transcript ? 'Record More' : 'Start Recording'}</>
                                }
                              </button>

                              {!isSpeechListening && !transcript && (
                                <p className="text-xs text-slate-600">
                                  Click <span className="text-violet-400">&ldquo;Start Recording&rdquo;</span>, speak clearly, then click <span className="text-violet-400">&ldquo;Stop Recording&rdquo;</span>
                                </p>
                              )}
                            </div>

                            {/* ─ Voice-to-Text live panel ─ */}
                            <div className="border border-white/[0.07] rounded-2xl overflow-hidden bg-[#0b0d1c]">
                              {/* Panel header */}
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#131629]">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Voice → Text</span>
                                  {isSpeechListening && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {transcript && <CopyButton text={transcript} />}
                                  {transcript && (
                                    <button
                                      onClick={() => setTranscript('')}
                                      className="text-[11px] font-semibold text-slate-500 hover:text-pink-400 border border-white/10 hover:border-pink-500/30 rounded-lg px-2.5 py-1.5 transition-all"
                                    >
                                      ✕ Clear
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Live interim text (what you're saying RIGHT NOW) */}
                              <AnimatePresence>
                                {interimText && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-4 py-2.5 border-b border-violet-500/10 bg-violet-500/5"
                                  >
                                    <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider block mb-1">Live caption</span>
                                    <span className="text-sm text-violet-200 italic leading-relaxed">{interimText}…</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Editable final transcript */}
                              <textarea
                                id="voice-transcript"
                                rows={5}
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder={isSpeechListening
                                  ? 'Speaking… words will appear here as you talk.'
                                  : 'Your voice will be transcribed here in real time. You can edit this text before clicking Analyze.'
                                }
                                className="w-full bg-transparent text-slate-200 text-sm leading-relaxed px-4 py-3 outline-none resize-none placeholder:text-slate-700"
                              />

                              {/* Footer: word count */}
                              {(transcript || interimText) && (
                                <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.05] bg-[#0f1120]">
                                  <span className="text-[10px] text-slate-600">
                                    {transcript.trim().split(/\s+/).filter(Boolean).length} words · {transcript.length} chars
                                  </span>
                                  <span className="text-[10px] text-slate-700">
                                    {transcript && !isSpeechListening ? '✓ Ready to analyze' : isSpeechListening ? 'Recording…' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* ─ Upload mode ─ */}
                    {voiceMode === 'upload' && (
                      <div className="flex flex-col items-center gap-5 min-h-[200px] py-4">
                        {audioUrl ? (
                          <div className="flex flex-col items-center gap-3 w-full">
                            <WaveformVisualizer isActive={isMediaRecording} />
                            {!isMediaRecording && (
                              <audio src={audioUrl} controls className="w-full max-w-sm custom-audio" />
                            )}
                            <span className="text-violet-300 font-mono text-lg font-bold">{formatTime(recordingTime)}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 w-full bg-black/20 text-slate-500">
                            <FiVolume2 className="text-3xl mb-3 text-slate-600" />
                            <p className="text-sm">Record or upload an audio file</p>
                            <p className="text-xs text-slate-600 mt-1">Supports .wav .mp3 .webm .ogg (max 10 MB)</p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 flex-wrap justify-center">
                          {isMediaRecording ? (
                            <button onClick={stopMediaRecording} className="flex items-center gap-2 px-5 py-2.5 bg-pink-500/20 text-pink-400 border border-pink-500/40 rounded-full text-sm font-semibold hover:bg-pink-500/30 transition animate-pulse">
                              <FiSquare /> Stop Recording
                            </button>
                          ) : (
                            <button onClick={startMediaRecording} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600/20 text-violet-400 border border-violet-500/40 rounded-full text-sm font-semibold hover:bg-violet-600/30 hover:shadow-[0_0_18px_rgba(139,92,246,0.3)] transition">
                              <FiMic /> Record Audio
                            </button>
                          )}
                          <span className="text-slate-600 font-bold text-xs">OR</span>
                          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-slate-300 rounded-full text-sm font-semibold hover:bg-slate-700 transition">
                            <FiUploadCloud /> Upload Audio
                          </button>
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                        </div>

                        {voiceMode === 'upload' && (audioBlob || voiceFile) && (
                          <p className="text-[11px] text-slate-500 text-center">
                            Audio will be transcribed by <span className="text-violet-400 font-semibold">Whisper AI</span> running on the ML server
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Error banner ── */}
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 text-sm text-pink-300 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-3"
                >
                  <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span>{displayError}</span>
                    {inputType === 'voice' && (
                      <button
                        onClick={() => { setVoiceError(''); setProcessingStep(''); }}
                        className="ml-3 text-xs text-pink-400 underline hover:text-pink-300"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Processing feedback ── */}
              {loading && processingStep && (
                <div className="flex items-center gap-3 text-sm text-violet-300 bg-violet-500/8 border border-violet-500/15 rounded-xl px-4 py-3">
                  <FiCpu className="animate-spin flex-shrink-0" />
                  {processingStep}
                </div>
              )}
              {loading && !processingStep && (
                <div className="flex items-center gap-3 text-sm text-blue-400 bg-blue-500/8 border border-blue-500/15 rounded-xl px-4 py-3">
                  <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  AI scanning message structure and toxicity signals…
                </div>
              )}

              {/* ── Action buttons ── */}
              <div className="flex gap-3 flex-wrap border-t border-white/[0.06] pt-4">
                <button
                  id="btn-analyze"
                  onClick={runAnalysis}
                  disabled={loading || ocrLoading || isMediaRecording}
                  className={`btn-primary flex-1 sm:flex-none ${inputType === 'voice' ? 'from-violet-600 to-fuchsia-600 !shadow-[0_4px_20px_rgba(139,92,246,0.4)]' : ''}`}
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Analyzing…</>
                    : ocrLoading
                      ? <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Extracting…</>
                    : <>{inputType === 'text' ? 'Analyze Message' : isSpeechListening ? 'Stop & Analyze' : 'Analyze Voice'} <FiArrowRight /></>
                  }
                </button>

                {inputType === 'text' && (
                  <button onClick={() => { setText(sampleText); setResult(null); setError(''); }} className="btn-outline">
                    Load Sample
                  </button>
                )}

                {activeInput && (
                  <button
                    onClick={() => {
                      if (inputType === 'text') {
                        setText('');
                        setResult(null);
                        setError('');
                        setOcrProgress(0);
                        if (imagePreview) URL.revokeObjectURL(imagePreview);
                        setImagePreview(null);
                      } else {
                        clearVoice();
                      }
                    }}
                    className="btn-outline"
                  >
                    <FiRefreshCw className="text-sm" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tips card */}
          <div className="enterprise-card p-5">
            <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold mb-3">Detection Tips</p>
            <ul className="space-y-2 text-sm text-slate-500">
              {(inputType === 'text' ? [
                'Works best with complete sentences or phrases',
                'Load a sample to see detection in action',
                'Results include confidence score and flagged terms',
              ] : voiceMode === 'web' ? [
                'Use Chrome or Edge for best Web Speech API support',
                'Speak clearly in a quiet environment',
                'Click "Start Speaking" → speak → "Stop & Analyze"',
              ] : [
                'Upload .wav or .mp3 for best Whisper accuracy',
                'Audio is transcribed server-side using OpenAI Whisper',
                'Max file size: 10 MB',
              ]).map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className={`mt-0.5 flex-shrink-0 ${inputType === 'voice' ? 'text-violet-500' : 'text-blue-500'}`}>→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <motion.div {...fadeUp(0.2)}>
          {result ? (
            <ResultCard result={result} originalText={inputType === 'text' ? text : null} />
          ) : (
            <div className="enterprise-card h-full min-h-[340px] flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <FiZap className="text-blue-400 text-2xl" />
              </div>
              <h3 className="text-slate-400 font-semibold mb-2">Awaiting Analysis</h3>
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                {inputType === 'text'
                  ? 'Submit a message to see AI analysis, toxicity scores and flagged terms here.'
                  : voiceMode === 'web'
                    ? 'Start speaking and click "Stop & Analyze" to see the full voice risk report.'
                    : 'Record or upload audio, then click "Analyze Voice" for the AI risk report.'}
              </p>
              {inputType === 'voice' && (
                <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                  {[
                    ['📝', 'Speech Transcription'],
                    ['😠', 'Emotion Detection'],
                    ['⚠️', 'Toxicity Score'],
                    ['🔴', 'Combined Risk Score'],
                  ].map(([emoji, label]) => (
                    <div key={label} className="flex items-center gap-3 text-xs text-left text-slate-600 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-base">{emoji}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
