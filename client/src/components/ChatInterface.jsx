import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage, getSessions, createSession, getSession, deleteSession } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';

const ChatInterface = () => {
  const navigate = useNavigate();
  
  // State
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('groq');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Derived state
  const messages = currentSession?.messages || [];
  const currentSessionId = currentSession?._id;

  // Initial Load
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
      if (data.length > 0) {
        // Load the most recent session
        await selectSession(data[0]._id);
      } else {
        await createNewSession();
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const selectSession = async (id) => {
    try {
      const session = await getSession(id);
      setCurrentSession(session);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  const createNewSession = async () => {
    try {
      const session = await createSession();
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s._id !== id));
      
      if (id === currentSessionId) {
        const remaining = sessions.filter(s => s._id !== id);
        if (remaining.length > 0) {
          selectSession(remaining[0]._id);
        } else {
          createNewSession();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userMessage = input.trim();
    if (!userMessage || isLoading || !currentSessionId) return;

    // Optimistic Update
    const tempUserMsg = { role: 'user', content: userMessage, citations: [] };
    setCurrentSession(prev => ({
      ...prev,
      messages: [...prev.messages, tempUserMsg]
    }));
    
    setInput('');
    setIsLoading(true);

    try {
      // Call API
      const response = await sendChatMessage(userMessage, provider, currentSessionId);
      
      // Update with real response
      // We fetch the full session again to ensure sync, or just append
      // For better UX, let's append the assistant response
      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        citations: response.citations || []
      };

      setCurrentSession(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMsg]
      }));

      // Update title in sidebar if it was "New Chat"
      if (currentSession.title === 'New Chat' && messages.length === 0) {
         // Refresh list to get new title
         loadSessions(); 
      }

    } catch (error) {
      // Add error message
      setCurrentSession(prev => ({
        ...prev,
        messages: [...prev.messages, {
          role: 'assistant',
          content: `❌ Error: ${error.message}. Please try again.`,
          citations: [],
          isError: true
        }]
      }));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed md:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-zinc-950 border-r border-stone-200 dark:border-zinc-800 flex flex-col shadow-2xl md:shadow-none"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-stone-200 dark:border-zinc-800">
              <motion.button
                onClick={createNewSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 dark:bg-zinc-900 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium text-stone-900 dark:text-stone-100"
              >
                <Plus size={18} />
                New Chat
              </motion.button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {sessions.map((session) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                    session._id === currentSessionId
                      ? 'bg-stone-100 dark:bg-zinc-900'
                      : 'hover:bg-stone-50 dark:hover:bg-zinc-900/50'
                  }`}
                  onClick={() => selectSession(session._id)}
                >
                  <MessageSquare size={16} className="text-stone-400 dark:text-stone-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-500">
                      {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-zinc-800">
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
              >
                <Home size={18} />
                Back to Home
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white dark:bg-zinc-950 border-b border-stone-200 dark:border-zinc-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-lg transition-colors flex-shrink-0"
            >
              {sidebarOpen ? <X size={20} className="text-stone-600 dark:text-stone-400" /> : <Menu size={20} className="text-stone-600 dark:text-stone-400" />}
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-semibold text-stone-900 dark:text-stone-100 truncate">
                {currentSession?.title || 'New Chat'}
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-500 hidden md:block">
                Second Brain Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Provider Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-900 p-1 rounded-lg">
              <button
                onClick={() => setProvider('groq')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  provider === 'groq'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Groq
              </button>
              <button
                onClick={() => setProvider('gemini')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  provider === 'gemini'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Gemini
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-lg transition-colors flex-shrink-0"
            >
              <Home size={20} className="text-stone-600 dark:text-stone-400" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-3 md:px-4 py-4 md:py-8">
            <div className="space-y-4 md:space-y-6">
              <AnimatePresence initial={false}>
                {/* Welcome Message if empty */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 md:gap-4"
                  >
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-stone-200 dark:bg-zinc-800 flex items-center justify-center text-xs md:text-sm font-semibold text-stone-700 dark:text-stone-300">
                      🧠
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="inline-block text-left text-stone-900 dark:text-stone-100">
                          <div className="whitespace-pre-wrap break-words leading-relaxed">
                            👋 Hi! I'm your Second Brain assistant. Ask me anything about the knowledge base.
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-300'
                    }`}>
                      {msg.role === 'user' ? 'Y' : '🧠'}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`prose prose-sm dark:prose-invert max-w-none ${
                        msg.role === 'user' ? 'text-right' : ''
                      }`}>
                        <div className={`inline-block text-left ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white px-4 py-2 rounded-2xl'
                            : msg.isError
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 rounded-2xl border border-red-200 dark:border-red-800'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}>
                          <div className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </div>
                        </div>

                        {/* Citations */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <div className="text-xs font-semibold text-stone-600 dark:text-stone-400 mb-2">
                              📚 Sources:
                            </div>
                            {msg.citations.map((citation, cidx) => (
                              <div
                                key={cidx}
                                className="text-xs bg-stone-100 dark:bg-zinc-800/50 rounded-lg px-4 py-3 border border-stone-200 dark:border-zinc-700"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-semibold text-stone-900 dark:text-stone-100">
                                    [{cidx + 1}] {citation.source}
                                  </div>
                                  <div className="text-xs text-stone-500 dark:text-stone-400">
                                    {(citation.score * 100).toFixed(1)}% match
                                  </div>
                                </div>
                                <div className="text-stone-600 dark:text-stone-400 line-clamp-2">
                                  {citation.text.substring(0, 200)}...
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 dark:bg-zinc-800 flex items-center justify-center text-sm">
                      🧠
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-stone-600 dark:text-stone-400">Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="max-w-3xl mx-auto px-3 md:px-4 py-3 md:py-4">
            <form onSubmit={handleSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Second Brain..."
                disabled={isLoading}
                className="w-full px-4 md:px-5 py-3 md:py-4 pr-12 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl md:rounded-2xl text-sm md:text-base text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <motion.button
                type="submit"
                disabled={isLoading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </motion.button>
            </form>
            <div className="mt-2 text-xs text-center text-stone-500 dark:text-stone-500">
              💡 Ask about technologies, projects, or experience in the knowledge base
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
