'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
} from 'lucide-react';
import { askNexusAI } from '@/lib/api-client';

function AiTutorContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `### Welcome to NexusAI Academic Tutor 🧠\n\nI am your **24/7 MSBTE AI Coach**, grounded in official diploma syllabi, past paper archives, and standard marking schemes.\n\nSelect an **Answer Mode** below to format responses directly for your exam answer sheets!`,
    },
  ]);
  const [input, setInput] = useState(initialPrompt);
  const [answerMode, setAnswerMode] = useState<string>('FIVE_MARK');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPrompt && messages.length === 1) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setLoading(true);

    try {
      const response = await askNexusAI(query);
      setMessages((prev) => [...prev, { sender: 'ai', text: response }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Network connection issue. Please retry!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const answerModes = [
    { key: 'TWO_MARK', label: '2-Mark Short Answer' },
    { key: 'FIVE_MARK', label: '4-6 Mark Standard' },
    { key: 'TEN_MARK', label: '8-10 Mark Full Solution' },
    { key: 'FORMULA', label: 'Formula & Derivation' },
    { key: 'VIVA', label: 'Oral & Viva Prep' },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col glass-panel rounded-3xl border border-indigo-500/30 overflow-hidden bg-slate-950/80">
      
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white flex items-center gap-2">
              NexusAI Exam Coach
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                NVIDIA Nemotron RAG
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Tuned for SBMP & MSBTE Computer, IT, EXTC & Civil Engineering</p>
          </div>
        </div>

        {/* Answer Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {answerModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setAnswerMode(mode.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                answerMode === mode.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/20'
            }`}>
              {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className={`p-4 rounded-2xl max-w-[80%] text-xs sm:text-sm leading-relaxed ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none shadow-sm font-sans'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-indigo-400 text-xs italic p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
            <Sparkles className="h-4 w-4 animate-spin" />
            NexusAI is referencing MSBTE paper solutions and curriculum guidelines...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
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
            placeholder="Type any syllabus topic, question, or formula (e.g. Explain 3NF normalization with example)..."
            className="flex-1 bg-slate-900 text-xs sm:text-sm text-white placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-md"
          >
            <span>Ask AI</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}

export default function AiTutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading NexusAI Tutor...</div>}>
      <AiTutorContent />
    </Suspense>
  );
}
