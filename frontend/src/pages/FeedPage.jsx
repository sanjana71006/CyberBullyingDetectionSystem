import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  FiMessageSquare, FiSend, FiAlertTriangle, FiShield,
  FiChevronDown, FiChevronUp, FiAlertOctagon
} from 'react-icons/fi';
import axios from 'axios';

// ── Toxicity Warning Banner ─────────────────────────────────────────────────
function ToxicCommentBanner({ msg, words, score, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className="mt-3 p-4 bg-red-950/60 border border-red-600/40 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <FiAlertOctagon className="text-red-400 text-lg mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-red-300 font-semibold text-sm mb-1">Comment Blocked — Cyberbullying Detected</p>
          <p className="text-red-400/80 text-xs leading-relaxed mb-2">{msg}</p>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-red-500/70 uppercase font-semibold tracking-wider">Toxicity:</span>
            <span className="text-[10px] font-bold text-red-300">{Math.round(score * 100)}%</span>
            {words?.length > 0 && (
              <>
                <span className="text-[10px] text-red-500/70 uppercase font-semibold tracking-wider ml-2">Flagged:</span>
                {words.map(w => (
                  <span key={w} className="text-[10px] px-1.5 py-0.5 bg-red-800/40 border border-red-700/30 rounded text-red-300 font-mono">
                    {w}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
        <button onClick={onDismiss} className="text-red-500/60 hover:text-red-400 text-xs ml-2 shrink-0">✕</button>
      </div>
    </motion.div>
  );
}

// ── Single Post Card with inline comments ───────────────────────────────────
function PostCard({ post, currentUser, updateUser }) {
  const [comments, setComments]         = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState('');
  const [commentsLoaded, setLoaded]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [toxicError, setToxicError]     = useState(null); // { msg, words, score }

  const loadComments = useCallback(async () => {
    if (commentsLoaded) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/social/posts/${post._id}/comments`);
      setComments(data);
      setLoaded(true);
    } catch { /* ignore */ }
  }, [post._id, commentsLoaded]);

  const toggleComments = async () => {
    if (!showComments) await loadComments();
    setShowComments(v => !v);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    setToxicError(null);

    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/social/posts/${post._id}/comments`,
        { content: commentText }
      );
      setComments(prev => [...prev, data]);
      setCommentText('');
      // Safe comment → credibility +1
      if (updateUser) {
        updateUser({ credibilityScore: Math.min(100, (currentUser?.credibilityScore || 100) + 1) });
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setToxicError({
          msg: err.response.data.error,
          words: err.response.data.abusiveWords || [],
          score: err.response.data.toxicityScore || 0,
        });
        // Reflect credibility drop locally
        if (updateUser) {
          updateUser({ credibilityScore: Math.max(0, (currentUser?.credibilityScore || 100) - 10) });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl border border-white/5"
    >
      {/* Post header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue/40 to-neon-purple/40 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
            {post.author?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-white">{post.author?.username}</span>
            <span className="ml-2 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
              Score: {post.author?.credibilityScore}
            </span>
          </div>
        </div>
        <span className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Post body */}
      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{post.content}</p>

      {/* Comment toggle */}
      <button
        onClick={toggleComments}
        className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-neon-blue transition-colors"
      >
        <FiMessageSquare />
        {commentsLoaded ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
        {showComments ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            {/* Comment list */}
            {comments.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {comments.map(c => (
                  <div key={c._id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 mt-0.5">
                      {c.author?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-slate-900/50 rounded-xl px-3 py-2 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">{c.author?.username}</span>
                        <span className="text-[10px] text-slate-600">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-snug">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-xs mb-4 text-center py-4">No comments yet. Be the first!</p>
            )}

            {/* Toxicity blocked banner */}
            <AnimatePresence>
              {toxicError && (
                <ToxicCommentBanner
                  msg={toxicError.msg}
                  words={toxicError.words}
                  score={toxicError.score}
                  onDismiss={() => setToxicError(null)}
                />
              )}
            </AnimatePresence>

            {/* Comment input */}
            <form onSubmit={handleSubmitComment} className="flex gap-2 mt-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  rows={1}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(e); } }}
                  placeholder="Write a comment… (will be checked for cyberbullying)"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue/60 transition-colors resize-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-slate-700">
                  <FiShield className="text-emerald-800" /> AI-checked
                </div>
              </div>
              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="p-2.5 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple text-white hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <FiSend className="text-base" />
                )}
              </button>
            </form>

            <p className="mt-2 text-[10px] text-slate-700 flex items-center gap-1">
              <FiAlertTriangle className="text-amber-900" />
              All comments are scanned for cyberbullying. Violations reduce your credibility score.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Feed Page ──────────────────────────────────────────────────────────
export default function FeedPage() {
  const { user, updateUser } = useAuth();
  const [posts, setPosts]     = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/social/posts');
      setPosts(data);
    } catch { setError('Failed to load posts'); }
    finally { setLoading(false); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/social/posts', { content: newPost });
      setPosts([data, ...posts]);
      setNewPost('');
      if (updateUser) updateUser({ credibilityScore: Math.min(100, (user?.credibilityScore || 100) + 1) });
    } catch (err) {
      if (err.response?.status === 403) {
        setError(`⚠️ Post Blocked: ${err.response.data.error} Toxicity Score: ${(err.response.data.toxicityScore * 100).toFixed(0)}%`);
        if (updateUser) updateUser({ credibilityScore: Math.max(0, (user?.credibilityScore || 100) - 10) });
      } else {
        setError('Failed to create post');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-24 px-4 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            Community Feed
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-full">
            <FiShield className="text-emerald-500" />
            AI-Moderated
          </div>
        </div>

        {/* ── Create Post ── */}
        <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/5">
          <form onSubmit={handleCreatePost}>
            <textarea
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white focus:outline-none focus:border-neon-blue transition-colors resize-none"
              rows="3"
              placeholder="What's on your mind?"
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-slate-400">
                Credibility Score: <span className="text-emerald-400 font-bold">{user?.credibilityScore}</span>
              </span>
              <button
                type="submit"
                disabled={!newPost.trim()}
                className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <FiSend /> Post
              </button>
            </div>
          </form>
        </div>

        {/* Error for post */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3"
            >
              <span className="text-xl">🛑</span>
              <p className="text-sm">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-500/60 hover:text-red-400 text-xs">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Post List ── */}
        {loading ? (
          <div className="text-center text-slate-400 py-12 flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
            Loading posts…
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length === 0 && (
              <p className="text-center text-slate-600 py-12">No posts yet. Be the first to post!</p>
            )}
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                updateUser={updateUser}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
