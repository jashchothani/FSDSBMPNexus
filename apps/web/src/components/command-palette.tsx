'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  FileText, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  X,
  Clock,
  Layers,
  Wrench,
  Presentation,
  FileCheck,
  FileEdit,
  Image,
  Share2
} from 'lucide-react';
import { MOCK_PAPERS, MOCK_QUESTIONS } from '@/lib/api-client';

const ACADEMIC_TOOLS = [
  { name: 'Academic Tools Hub', href: '/tools', icon: Wrench, desc: 'Central suite with all 6 academic tools' },
  { name: 'PPT → PDF Converter', href: '/tools/ppt-to-pdf', icon: Presentation, desc: 'Convert college slides to PDF' },
  { name: 'Word → PDF Converter', href: '/tools/word-to-pdf', icon: FileCheck, desc: 'Convert notices and assignments to PDF' },
  { name: 'PDF → Word (.docx) Editor', href: '/tools/pdf-to-word', icon: FileEdit, desc: 'Extract & edit question papers into Word' },
  { name: 'ID Photo Background Remover', href: '/tools/background-remover', icon: Image, desc: 'Make ID card photos & hall tickets' },
  { name: 'Private Temporary Clipboard', href: '/tools/clipboard', icon: Share2, desc: 'Transfer text & files between lab PC and phone' },
  { name: 'PDF Merge / Split / Compress', href: '/tools/pdf-manage', icon: Layers, desc: 'Manage exam PDFs, combine or shrink < 2MB' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = ACADEMIC_TOOLS.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPapers = MOCK_PAPERS.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.subject.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredQuestions = MOCK_QUESTIONS.filter(q => 
    q.question.toLowerCase().includes(query.toLowerCase()) || 
    q.chapter.toLowerCase().includes(query.toLowerCase()) ||
    q.subject.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="h-5 w-5 text-blue-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, papers, questions, topics, or ask AI..."
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          
          {/* Ask AI Quick Prompt Action */}
          {query.trim() && (
            <div 
              onClick={() => {
                router.push(`/ai-tutor?prompt=${encodeURIComponent(query)}`);
                onClose();
              }}
              className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 hover:border-indigo-500/60 cursor-pointer flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-300">
                  <Sparkles className="h-4 w-4 animate-spin-slow" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Ask NexusAI Tutor</p>
                  <p className="text-[11px] text-indigo-300">"Explain {query}" with MSBTE exam solution step-by-step</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          {/* Academic Tools Section */}
          {filteredTools.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-emerald-400" />
                  Academic Utilities ({filteredTools.length})
                </span>
              </div>
              <div className="space-y-1">
                {filteredTools.map((t) => {
                  const ToolIcon = t.icon;
                  return (
                    <div
                      key={t.name}
                      onClick={() => {
                        router.push(t.href);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                          <ToolIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {t.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{t.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Papers Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-400" />
                Question Papers ({filteredPapers.length})
              </span>
            </div>
            {filteredPapers.length === 0 ? (
              <p className="text-xs text-slate-500 italic px-2">No matching papers found.</p>
            ) : (
              <div className="space-y-1">
                {filteredPapers.slice(0, 4).map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => {
                      router.push(`/papers?id=${paper.id}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                        {paper.year}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {paper.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {paper.department} • {paper.scheme} • Sem {paper.semester}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {paper.fileSize}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Bank Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                Question Bank ({filteredQuestions.length})
              </span>
            </div>
            {filteredQuestions.length === 0 ? (
              <p className="text-xs text-slate-500 italic px-2">No matching questions.</p>
            ) : (
              <div className="space-y-1">
                {filteredQuestions.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      router.push(`/question-bank?id=${q.id}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/20">
                        {q.marks}M
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-200 group-hover:text-purple-300 line-clamp-1">
                          {q.question}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {q.subject} • {q.chapter}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                      Freq: {q.frequencyCount}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">ESC</kbd> to exit</span>
            <span>Use <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">↓</kbd> to navigate</span>
          </div>
          <span className="text-blue-400 font-medium">SBMPNexus Global Index</span>
        </div>
      </div>
    </div>
  );
}
