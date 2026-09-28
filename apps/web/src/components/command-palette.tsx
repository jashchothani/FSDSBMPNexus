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
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/30 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white border border-blue-100 rounded-2xl shadow-2xl shadow-blue-100/40 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="h-5 w-5 text-blue-500 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, papers, questions, topics, or ask AI..."
            autoFocus
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-2"
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
              className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 hover:border-blue-300 cursor-pointer flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
                  <Sparkles className="h-4 w-4 animate-pulse-soft" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Ask NexusAI Tutor</p>
                  <p className="text-[11px] text-blue-500">&quot;Explain {query}&quot; with MSBTE exam solution step-by-step</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          {/* Academic Tools Section */}
          {filteredTools.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-emerald-500" />
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
                      className="p-2.5 rounded-xl hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-xs border border-emerald-200">
                          <ToolIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">
                            {t.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{t.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
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
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                Question Papers ({filteredPapers.length})
              </span>
            </div>
            {filteredPapers.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-2">No matching papers found.</p>
            ) : (
              <div className="space-y-1">
                {filteredPapers.slice(0, 4).map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => {
                      router.push(`/papers?id=${paper.id}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs border border-blue-200">
                        {paper.year}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                          {paper.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {paper.department} • {paper.scheme} • Sem {paper.semester}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 font-mono border border-slate-200">
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
                <HelpCircle className="h-3.5 w-3.5 text-violet-500" />
                Question Bank ({filteredQuestions.length})
              </span>
            </div>
            {filteredQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-2">No matching questions.</p>
            ) : (
              <div className="space-y-1">
                {filteredQuestions.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      router.push(`/question-bank?id=${q.id}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-violet-50 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center font-bold text-xs border border-violet-200">
                        {q.marks}M
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 group-hover:text-violet-600 line-clamp-1">
                          {q.question}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {q.subject} • {q.chapter}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-50 text-violet-500 border border-violet-200 font-semibold">
                      Freq: {q.frequencyCount}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white text-slate-500 rounded-md border border-slate-200 shadow-sm">ESC</kbd> to exit</span>
            <span>Use <kbd className="px-1.5 py-0.5 bg-white text-slate-500 rounded-md border border-slate-200 shadow-sm">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white text-slate-500 rounded-md border border-slate-200 shadow-sm">↓</kbd> to navigate</span>
          </div>
          <span className="text-blue-500 font-medium">SBMPNexus Global Index</span>
        </div>
      </div>
    </div>
  );
}
