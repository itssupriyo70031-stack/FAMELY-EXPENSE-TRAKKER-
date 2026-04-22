import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, X, Bot, User, Minimize2, Maximize2, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getChatResponse } from '../services/chatService';
import { saveManualApiKey } from '../services/aiClient';
import { Expense, Income, Budget } from '../types';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AIChatBotProps {
  expenses: Expense[];
  income: Income[];
  budgets: Budget[];
}

export function AIChatBot({ expenses, income, budgets }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "System initialized. I am SpendWise AI, your autonomous financial conductor. How shall we optimize your wealth today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getChatResponse(userMessage, messages, { expenses, income, budgets });
      if (response.includes("API Key Missing") || response.includes("এপিআই কী পাওয়া যায়নি")) {
        setShowKeyInput(true);
      }
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Protocol failure. Error in neural link. Please re-establish connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = () => {
    if (saveManualApiKey(manualKey)) {
      setShowKeyInput(false);
      setMessages(prev => [...prev, { role: 'model', content: "🧬 **Sync Success!** Your neural uplink is now active. Gemini protocol engaged." }]);
      setManualKey('');
    }
  };

  return (
    <>
      <div className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-[100]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, rotate: -45, y: 50 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0, rotate: 45, y: 50 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-zinc-100 text-zinc-950 shadow-[0_20px_50px_rgba(255,255,255,0.2)] flex items-center justify-center border-none relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Bot className="h-7 w-7 relative z-10" />
              <div className="absolute top-1 right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-zinc-100 animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              layoutId="chat-window"
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className={`glass-dark w-[400px] max-w-[95vw] ${isMinimized ? 'h-20' : 'h-[650px] max-h-[85vh]'} rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col transition-all duration-500 origin-bottom-right border border-zinc-700/50`}
            >
              <CardHeader className="p-6 border-b border-zinc-800/50 flex flex-row items-center justify-between space-y-0 bg-zinc-900/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-display font-bold tracking-tight">Gemini OS v3.0</CardTitle>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Neural Uplink Active</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white rounded-lg" onClick={() => setIsMinimized(!isMinimized)}>
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-rose-500 rounded-lg" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {!isMinimized && (
                <>
                  <CardContent className="flex-1 overflow-hidden p-0 relative">
                    <ScrollArea className="h-full p-6" ref={scrollRef}>
                      <div className="space-y-6 pb-4">
                        {messages.map((m, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-zinc-800 border border-zinc-700/50' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                                {m.role === 'user' ? <User className="h-4 w-4 text-zinc-400" /> : <Bot className="h-4 w-4 text-emerald-400" />}
                              </div>
                              <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                                m.role === 'user' 
                                  ? 'bg-zinc-100 text-zinc-950 rounded-tr-none font-medium' 
                                  : 'bg-zinc-900/50 text-zinc-100 border border-zinc-800 rounded-tl-none font-medium'
                              } shadow-xl prose prose-invert prose-emerald max-w-none`}>
                                <ReactMarkdown>{m.content}</ReactMarkdown>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {showKeyInput && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-6 rounded-3xl flex flex-col gap-4 border-emerald-500/30"
                          >
                            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                              <RotateCcw className="h-4 w-4" />
                              <span>Manual Key Entry Required</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-medium">ব্যক্তিগত নিরাপত্তার জন্য আপনার ম্যানুয়াল এপিআই চাবিটি দিন। এটি সরাসরি আপনার ব্রাউজারে সেভ হবে।</p>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Neural Key Hash..." 
                                type="password"
                                value={manualKey}
                                onChange={(e) => setManualKey(e.target.value)}
                                className="h-12 bg-zinc-950/50 border-zinc-800 rounded-2xl focus:ring-emerald-500 font-mono text-xs"
                              />
                              <Button 
                                onClick={handleSaveKey}
                                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-2xl h-12 px-6 font-bold"
                              >
                                Sync
                              </Button>
                            </div>
                          </motion.div>
                        )}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="flex gap-3 bg-zinc-900/30 p-4 rounded-3xl border border-zinc-800 animate-pulse">
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Processing neural data...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <div className="p-6 pt-2 bg-zinc-900/30 border-t border-zinc-800/50">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                      className="relative"
                    >
                      <Input 
                        placeholder="Establish neural link..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-zinc-950/80 border-zinc-800/80 focus:ring-emerald-500 h-14 rounded-2xl pr-14 pl-5 text-sm font-medium transition-all"
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 h-10 w-10 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-xl flex items-center justify-center p-0 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                    <div className="flex justify-center mt-3">
                         <div className="flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setMessages([{ role: 'model', content: "Uplink reset. Ready for new instructions." }])}>
                             <RotateCcw className="h-2 w-2" />
                             <span className="text-[8px] uppercase font-bold tracking-widest">Purge Logs</span>
                         </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
