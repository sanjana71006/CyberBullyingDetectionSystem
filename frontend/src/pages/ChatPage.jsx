import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiSend, FiAlertTriangle, FiUser, FiInfo, FiEdit2, FiCheckCircle } from 'react-icons/fi';

export default function ChatPage() {
  const { user, updateUser } = useAuth();
  const [socket, setSocket]       = useState(null);
  const [users, setUsers]         = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [inputText, setInputText] = useState('');
  const [warning, setWarning]     = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch contacts
  useEffect(() => {
    axios.get('http://localhost:5000/api/social/users')
      .then(({ data }) => setUsers(data))
      .catch(err => console.error('Failed to fetch users', err));
  }, [user]);

  // Connect Socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('http://localhost:5000', { auth: { token } });
    setSocket(newSocket);

    newSocket.on('receive_message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id?.toString() === msg._id?.toString())) return prev;
        return [...prev, msg];
      });
    });

    newSocket.on('warning', (data) => {
      setWarning(data);
      updateUser({ credibilityScore: Math.max(0, user.credibilityScore - 10) });
    });

    return () => newSocket.close();
  }, [updateUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !socket) return;

    const tempMessage = {
      _id: Date.now().toString(),
      senderId: user._id,
      receiverId: activeChat._id,
      text: inputText,
      timestamp: new Date().toISOString(),
      isTemp: true,
    };

    setMessages(prev => [...prev, tempMessage]);

    socket.emit('send_message', { receiverId: activeChat._id, text: inputText }, (response) => {
      if (response.status === 'sent') {
        setMessages(prev => prev.map(m => m._id === tempMessage._id ? response.message : m));
        updateUser({ credibilityScore: Math.min(100, user.credibilityScore + 1) });
      } else if (response.status === 'blocked') {
        setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
      }
    });

    setInputText('');
  };

  // "Use This" fills the input with the dynamic suggested rewrite
  const handleUseRewrite = () => {
    if (warning?.suggestedRewrite) setInputText(warning.suggestedRewrite);
    setWarning(null);
  };

  return (
    <div className="max-w-6xl mx-auto pt-20 px-4 pb-8 h-screen flex flex-col">
      <h1 className="text-3xl font-cyber font-extrabold mb-4 text-white tracking-wide">
        Messages
      </h1>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* ── Contacts Sidebar ── */}
        <div className="w-1/3 auth-terminal overflow-y-auto flex flex-col">
          <div className="auth-terminal-header">
            <div>
              <p className="auth-terminal-header-title">CONTACTS</p>
              <span className="auth-terminal-header-sub">Operator directory</span>
            </div>
            <span className="font-mono text-[11px] tracking-wider text-emerald-300">● LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {users.length === 0 ? (
              <p className="text-slate-500 text-sm text-center p-4">No contacts found.</p>
            ) : (
              users.map((u) => (
                <button
                  key={u._id}
                  onClick={async () => {
                    setActiveChat(u);
                    try {
                      const { data } = await axios.get(`http://localhost:5000/api/social/messages/${u._id}`);
                      setMessages(data);
                    } catch { setMessages([]); }
                  }}
                  className={`w-full text-left p-3 flex items-center transition-colors border-2 ${
                    activeChat?._id === u._id
                      ? 'bg-white/10 border-white/85'
                      : 'border-white/35 hover:bg-slate-800/70 hover:border-white/70'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700/90 flex flex-shrink-0 items-center justify-center text-white mr-3 font-semibold border-2 border-white/60">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{u.username}</p>
                    <p className="text-xs text-slate-400">Score: <span className={u.credibilityScore > 50 ? 'text-emerald-400' : 'text-red-400'}>{u.credibilityScore}</span></p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="flex-1 auth-terminal flex flex-col overflow-hidden relative">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="auth-terminal-header bg-slate-900/45">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white mr-3 font-semibold border-2 border-white/60">
                    {activeChat.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">{activeChat.username}</h3>
                    <p className="text-xs text-emerald-300 uppercase tracking-[0.14em]">Online</p>
                  </div>
                </div>
                <span className="font-mono text-[11px] tracking-wider text-cyan-200">Secure Channel</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/25">
                <div className="bg-white/5 border-2 border-white/70 p-3 flex items-start gap-2 text-sm text-slate-200">
                  <FiInfo className="mt-0.5 flex-shrink-0 text-cyan-200" />
                  <p>All messages are monitored in real-time by CyberShield AI to maintain a safe environment.</p>
                </div>

                {messages
                  .filter(m =>
                    (m.senderId === user._id && m.receiverId === activeChat._id) ||
                    (m.senderId === activeChat._id && m.receiverId === user._id)
                  )
                  .map((msg) => {
                    const isMe = msg.senderId === user._id;
                    return (
                      <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 border-2 ${
                          isMe
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-white/80'
                            : 'bg-slate-700/90 text-slate-100 border-white/65'
                        } ${msg.isTemp ? 'opacity-70' : ''}`}>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t-2 border-white/65 bg-slate-900/45">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-800/90 border-2 border-white/65 px-4 text-white focus:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || !socket}
                    className="w-10 h-10 border-2 border-white/85 bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0"
                  >
                    <FiSend />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border-2 border-white/55">
                <FiUser className="text-2xl" />
              </div>
              <p className="text-xl text-slate-400">Select a contact to start messaging</p>
            </div>
          )}

          {/* ── Warning Popup with DYNAMIC Suggested Rewrite ── */}
          <AnimatePresence>
            {warning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm z-10 flex items-center justify-center p-6"
              >
                <div className="bg-[#0F1525] border-2 border-white/85 p-6 max-w-sm w-full shadow-[0_0_40px_rgba(239,68,68,0.2)]">

                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 border-2 border-white/75">
                      <FiAlertTriangle className="text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center text-white mb-1">Message Blocked</h3>
                  <p className="text-center text-slate-400 text-sm mb-4">{warning.message}</p>

                  {/* Flagged words */}
                  {warning.abusiveWords?.length > 0 && (
                    <div className="mb-4 bg-red-500/10 p-3 border-2 border-white/70">
                      <p className="text-[10px] text-red-400 font-semibold mb-1.5 uppercase tracking-wider">Detected Patterns</p>
                      <div className="flex flex-wrap gap-1">
                        {warning.abusiveWords.map((word, i) => (
                          <span key={i} className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono border border-white/45">{word}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-center text-slate-500 mb-4">
                    Toxicity Score: <span className="font-bold text-red-400">{(warning.toxicityScore * 100).toFixed(0)}%</span>
                  </div>

                  {/* ✨ Dynamic contextual suggested rewrite */}
                  {warning.suggestedRewrite && (
                    <div className="mb-5 p-4 bg-emerald-900/20 border-2 border-white/70">
                      <div className="flex items-center gap-1.5 mb-2">
                        <FiEdit2 className="text-emerald-400 text-xs" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Suggested Rewrite</span>
                      </div>
                      <p className="text-emerald-200 text-sm leading-relaxed italic">"{warning.suggestedRewrite}"</p>
                      <p className="text-[10px] text-emerald-700 mt-2">* Based on your original message — rephrased constructively.</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {warning.suggestedRewrite && (
                      <button
                        onClick={handleUseRewrite}
                        className="flex-1 py-2.5 bg-emerald-600/20 border-2 border-white/80 text-emerald-300 font-semibold text-sm hover:bg-emerald-600/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiCheckCircle /> Use This
                      </button>
                    )}
                    <button
                      onClick={() => setWarning(null)}
                      className="flex-1 py-2.5 bg-red-500/20 border-2 border-white/80 text-red-300 font-medium text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
