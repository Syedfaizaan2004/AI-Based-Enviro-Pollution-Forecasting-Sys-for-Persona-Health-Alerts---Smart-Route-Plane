import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient as api } from '@/services/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AirSense.AI Assistant. I can help you with air quality forecasting, health alerts, and smart route planning. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const currentHistory = [...messages, { role: 'user', content: userMessage }];
      
      const response = await api.post('/chat', {
        messages: currentHistory
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops! 🌪️ I encountered an error connecting to the AI service. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 bg-[length:200%_200%] animate-gradient bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 text-white rounded-full shadow-[0_0_40px_rgba(16,185,129,0.6)] flex items-center justify-center hover:shadow-[0_0_60px_rgba(20,184,166,0.8)] transition-all group border-2 border-white/40"
            >
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <MessageSquare className="h-7 w-7 group-hover:scale-110 transition-transform relative z-10" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-yellow-400 rounded-full animate-bounce border-2 border-background z-20 shadow-[0_0_10px_rgba(250,204,21,1)]" />
              <Sparkles className="absolute bottom-2 left-2 h-4 w-4 text-green-300 animate-pulse z-20" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[420px] h-[550px] sm:h-[650px] bg-background/80 backdrop-blur-3xl border-2 border-transparent bg-clip-padding shadow-2xl rounded-3xl flex flex-col z-50 overflow-hidden ring-4 ring-emerald-500/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 relative overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:16px_16px]" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-12 w-12 rounded-full bg-white/20 p-1 backdrop-blur-md border border-white/50 shadow-lg flex items-center justify-center"
                  >
                    <Bot className="h-7 w-7 text-white drop-shadow-md" />
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-emerald-600 flex items-center justify-center shadow-[0_0_10px_rgba(74,222,128,1)]">
                    <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-white tracking-tight flex items-center gap-2 text-lg drop-shadow-md">
                    AirSense AI
                    <Zap className="h-4 w-4 text-yellow-300 animate-pulse drop-shadow-md" />
                  </h3>
                  <p className="text-xs text-white/90 font-medium">AI-powered insights</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white relative z-10 transition-colors shadow-sm">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gradient-to-br from-emerald-500/5 via-emerald-500/5 to-green-500/5">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user' ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'}`}>
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div className={`px-5 py-3 rounded-3xl text-sm whitespace-pre-wrap shadow-lg leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-emerald-500 via-emerald-500 to-emerald-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-green-900 text-green-950 dark:text-green-100 border-2 border-emerald-500/20 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] flex items-end gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="px-6 py-4 rounded-3xl bg-white dark:bg-green-900 text-emerald-500 flex items-center gap-2 rounded-bl-sm border-2 border-emerald-500/20 shadow-lg">
                      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white dark:bg-green-950 border-t-2 border-emerald-500/20 rounded-b-3xl">
              <div className="flex items-center gap-2 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="relative w-full bg-green-50 dark:bg-green-900 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-4 py-3 pr-14 text-sm focus:outline-none resize-none max-h-32 min-h-[50px] shadow-sm transition-all placeholder:text-green-600 dark:placeholder:text-green-500 text-green-950 dark:text-green-100"
                  rows={1}
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className={`absolute right-2 bottom-2 h-10 w-10 rounded-xl shadow-md transition-all duration-300 ${input.trim() && !isLoading ? 'bg-gradient-to-r from-emerald-500 to-emerald-500 hover:scale-110 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-green-200 dark:bg-green-800 text-green-600'}`}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <p className="text-[11px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-500">
                  Powered by Llama 3.3
                </p>
                <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
