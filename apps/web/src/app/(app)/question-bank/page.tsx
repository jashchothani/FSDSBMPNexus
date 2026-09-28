'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  Sparkles, 
  Flame, 
  BookOpen, 
  CheckCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { MOCK_QUESTIONS, QuestionBankItem } from '@/lib/api-client';

export default function QuestionBankPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('q-1');

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        q.question.toLowerCase().includes(query) ||
        q.subject.toLowerCase().includes(query) ||
        q.chapter.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-purple-400" />
            MSBTE High-Frequency Question Bank
          </h1>
          <p className="text-xs text-slate-400">
            Chapter-wise questions sorted by historical exam frequency (2018-2024) with model solutions
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 bg-slate-900/80">
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword, algorithm, or chapter..."
              className="w-full bg-slate-950 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy (2-4 Marks)</option>
              <option value="Medium">Medium (4-6 Marks)</option>
              <option value="Hard">Hard (6-8 Marks)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="glass-panel rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all overflow-hidden"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-4 cursor-pointer flex items-start justify-between gap-4 bg-slate-900/60"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {q.marks}M
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.subject}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {q.chapter}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        Appeared {q.frequencyCount}x in Exams
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {q.question}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    q.difficulty === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {q.difficulty}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Answer Section */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-4">
                  
                  {/* Years Appeared Timeline */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Exam History:</span>
                    <div className="flex flex-wrap gap-1">
                      {q.yearsAppeared.map((y) => (
                        <span key={y} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          Winter {y}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Model Answer Preview */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" />
                      MSBTE Standard Model Answer Key
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {q.modelAnswer}
                    </p>
                  </div>

                  {/* AI Tutor Action */}
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/ai-tutor?prompt=${encodeURIComponent(`Solve this ${q.marks}-mark question step-by-step with diagrams: ${q.question}`)}`}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                      <span>Ask NexusAI to Solve Step-by-Step</span>
                    </Link>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
