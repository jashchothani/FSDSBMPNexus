'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Lightbulb,
  Zap
} from 'lucide-react';
import { askNexusAI } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface NexusAiWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NexusAiWidget({ isOpen, onClose }: NexusAiWidgetProps) {
  const { user } = useAuth();
  const userName = user?.firstName || 'there';
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `👋 Hey ${userName}! I am **NexusAI**, your 24/7 Academic Assistant. How can I help with your exam prep today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await askNexusAI(userMsg);
      setMessages(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I hit a temporary network glitch. Please try asking again!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Explain AVL Tree LR rotation',
    'Most frequent 6-mark questions in DBMS',
    'Summarize Banker\'s Algorithm step-by-step',
  ];

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-2xl shadow-blue-100/40 transition-all duration-300 flex flex-col ${
      isExpanded ? 'w-[600px] h-[700px]' : 'w-96 h-[520px]'
    }`}>
      
      {/* Header */}
      <div className="p-3.5 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-4 w-4 animate-pulse-soft" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-800">NexusAI Academic Coach</h3>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-50 text-emerald-500 border border-emerald-200 rounded-md">
                Active
              </span>
            </div>
            <p className="text-[10px] text-blue-500">Powered by NVIDIA Nemotron & MSBTE RAG</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
              m.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500 border border-blue-200'
            }`}>
              {m.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-blue-500 text-xs italic p-2">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            NexusAI is processing MSBTE answer key database...
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {messages.length < 3 && (
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(p);
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all text-left flex items-center gap-1"
            >
              <Zap className="h-3 w-3 text-blue-400" />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-2.5 border-t border-slate-100 bg-white rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about MSBTE subjects, PYQs..."
            className="flex-1 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
