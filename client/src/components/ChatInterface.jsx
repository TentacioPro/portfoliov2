import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';

const ChatInterface = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('chatConversations');
    return saved ? JSON.parse(saved) : [{
      id: Date.now(),
      title: 'New Chat',
      messages: [{
        role: 'assistant',
        content: '👋 Hi! I\'m your Second Brain assistant. Ask me anything about the knowledge base.',
        citations: []
      }],
      timestamp: Date.now()
    }];
  });
  const [currentConversationId, setCurrentConversationId] = useState(conversations[0].id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    localStorage.setItem('chatConversations', JSON.stringify(conversations));
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: 'New Chat',
      messages: [{
        role: 'assistant',
        content: '👋 Hi! I\'m your Second Brain assistant. Ask me anything about the knowledge base.',
        citations: []
      }],
      timestamp: Date.now()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
  };

  const deleteConversation = (id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const newConv = {
          id: Date.now(),
          title: 'New Chat',
          messages: [{
            role: 'assistant',
            content: '👋 Hi! I\'m your Second Brain assistant. Ask me anything about the knowledge base.',
            citations: []
          }],
          timestamp: Date.now()
        };
        setCurrentConversationId(newConv.id);
        return [newConv];
      }
      if (id === currentConversationId) {
        setCurrentConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  const selectConversation = (id) => {
    setCurrentConversationId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const updateConversationTitle = (id, firstMessage) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === id && conv.title === 'New Chat') {
        return {
          ...conv,
          title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '')
        };
      }
      return conv;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    // Update conversation title if this is the first user message
    if (messages.length === 1) {
      updateConversationTitle(currentConversationId, userMessage);
    }

    // Add user message
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, { role: 'user', content: userMessage, citations: [] }],
          timestamp: Date.now()
        };
      }
      return conv;
    }));
    setInput('');
    setIsLoading(true);

    try {
      // Call API
      const response = await sendChatMessage(userMessage);
      
      // Add assistant response
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, {
              role: 'assistant',
              content: response.answer,
              citations: response.citations || []
            }]
          };
        }
        return conv;
      }));
    } catch (error) {
      // Add error message
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, {
              role: 'assistant',
              content: `❌ Error: ${error.message}. Please try again.`,
              citations: [],
              isError: true
            }]
          };
        }
        return conv;
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
                onClick={createNewConversation}
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
              {conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                    conv.id === currentConversationId
                      ? 'bg-stone-100 dark:bg-zinc-900'
                      : 'hover:bg-stone-50 dark:hover:bg-zinc-900/50'
                  }`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <MessageSquare size={16} className="text-stone-400 dark:text-stone-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-500">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                    >
                      <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                    </button>
                  )}
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
                {currentConversation?.title || 'New Chat'}
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-500 hidden md:block">
                Second Brain Assistant
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-lg transition-colors flex-shrink-0"
          >
            <Home size={20} className="text-stone-600 dark:text-stone-400" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-3 md:px-4 py-4 md:py-8">
            <div className="space-y-4 md:space-y-6">
              <AnimatePresence initial={false}>
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
