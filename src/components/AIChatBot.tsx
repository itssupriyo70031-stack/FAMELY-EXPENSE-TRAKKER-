import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, X, Bot, User, Minimize2, Maximize2, Loader2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getChatResponse, saveManualApiKey } from '../services/chatService';
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
    { role: 'model', content: "Hello! I'm SpendWise AI. How can I help you with your finances today?" }
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
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Send history without the current message (SDK handles it)
      const response = await getChatResponse(userMessage, messages, { expenses, income, budgets });
      
      // If the error indicates missing key, trigger manual input
      if (response.includes("API Key Missing") || response.includes("এপিআই কী পাওয়া যায়নি")) {
        setShowKeyInput(true);
      }
      
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I hit a snag. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = () => {
    if (saveManualApiKey(manualKey)) {
      setShowKeyInput(false);
      setMessages(prev => [...prev, { role: 'model', content: "✅ **সাফল্য!** আপনার এপিআই কী সেভ হয়েছে। এখন আপনি আবার চ্যাট করতে পারেন।" }]);
      setManualKey('');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full bg-zinc-100 text-zinc-950 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 border-4 border-zinc-950 group"
            >
              <Bot className="h-8 w-8 group-hover:animate-bounce" />
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className={`w-[400px] max-w-[90vw] ${isMinimized ? 'h-16' : 'h-[600px] max-h-[80vh]'} transition-all duration-300`}
            >
              <Card className="h-full border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl border-t-2 border-t-emerald-500">
                <CardHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between space-y-0 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Financial Advisor</CardTitle>
                      <span className="text-[10px] text-emerald-500 animate-pulse">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => setIsMinimized(!isMinimized)}>
                      {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-rose-500" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                {!isMinimized && (
                  <>
                    <CardContent className="flex-1 overflow-hidden p-0 bg-zinc-950/20">
                      <ScrollArea className="h-full p-4" ref={scrollRef}>
                        <div className="space-y-4">
                          {messages.map((m, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-zinc-800' : 'bg-emerald-500/20'}`}>
                                  {m.role === 'user' ? <User className="h-4 w-4 text-zinc-400" /> : <Bot className="h-4 w-4 text-emerald-400" />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                                  m.role === 'user' 
                                    ? 'bg-zinc-100 text-zinc-950 rounded-tr-none' 
                                    : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none'
                                } shadow-lg prose prose-invert prose-emerald max-w-none`}>
                                  <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {showKeyInput && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-zinc-900 border border-emerald-500/50 p-4 rounded-2xl flex flex-col gap-3 shadow-xl"
                            >
                              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                <Bot className="h-4 w-4" />
                                <span>Manual Setup</span>
                              </div>
                              <p className="text-xs text-zinc-400">
                                সিস্টেমের সমস্যা এড়াতে সরাসরি আপনার এপিআই কী-টি এখানে দিন। এটি কোথাও শেয়ার করা হবে না।
                              </p>
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="Paste API Key here..." 
                                  type="password"
                                  value={manualKey}
                                  onChange={(e) => setManualKey(e.target.value)}
                                  className="h-10 bg-zinc-950 border-zinc-800 focus:ring-emerald-500"
                                />
                                <Button 
                                  onClick={handleSaveKey}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950"
                                >
                                  Save
                                </Button>
                              </div>
                            </motion.div>
                          )}
                          {isLoading && (
                            <div className="flex justify-start">
                              <div className="flex gap-3 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                <span className="text-xs text-zinc-500">I'm analyzing your finances...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex flex-col gap-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Ask anything in English or Bengali</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-zinc-500 hover:text-emerald-500" 
                          onClick={() => setMessages([{ role: 'model', content: "Chat reset. How can I help you now?" }])}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                      <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                      >
                        <Input 
                          placeholder="Your message..." 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          className="bg-zinc-950 border-zinc-800 focus:ring-emerald-500 h-11"
                        />
                        <Button 
                          type="submit" 
                          disabled={isLoading || !input.trim()}
                          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 h-11 px-4"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
