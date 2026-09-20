'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  Sparkles, 
  BrainCircuit, 
  Flame, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Download,
  AlertTriangle,
  Award
} from 'lucide-react';
import { MOCK_PAPERS } from '@/lib/api-client';

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Semester 4 Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                Computer Engineering
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-gradient">Jash</span> 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              You're 72% exam ready for MSBTE Winter 2024. Your highest priority topic today is <span className="text-blue-400 font-semibold">Database Management Systems</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ai-tutor"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 animate-spin-slow" />
              <span>Launch AI Study Plan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Papers Reviewed', value: '18 Papers', change: '+4 this week', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Quiz Score Avg', value: '84.5%', change: 'Top 10% in batch', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { title: 'AI AI Assistance', value: '32 Sessions', change: '14 formulas solved', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { title: 'Study Streak', value: '5 Days', change: 'Personal best!', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((m, i) => (
          <div key={i} className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400">{m.title}</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{m.value}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{m.change}</p>
            </div>
            <div className={`h-10 w-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center shrink-0`}>
              <m.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: AI Recommendations & Recent Papers */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Papers & Subject Focus */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Papers */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  Recommended Question Papers
                </h3>
                <p className="text-[11px] text-slate-400">Tailored for your Semester 4 Computer Engineering subjects</p>
              </div>
              <Link href="/papers" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
                View All Archives
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_PAPERS.slice(0, 3).map((paper) => (
                <div
                  key={paper.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      {paper.year}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{paper.title}</h4>
                      <p className="text-[10px] text-slate-400">
                        {paper.subject} • {paper.scheme} • {paper.season}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {paper.fileSize}
                    </span>
                    <Link
                      href="/papers"
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Subject Readiness Progress */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Semester Subject Master Status
            </h3>

            <div className="space-y-4">
              {[
                { subject: 'Data Structures & Algorithms', progress: 88, status: 'Strong', color: 'bg-emerald-500' },
                { subject: 'Database Management Systems', progress: 74, status: 'Good', color: 'bg-blue-500' },
                { subject: 'Operating Systems', progress: 62, status: 'Needs Review', color: 'bg-amber-500' },
                { subject: 'Object Oriented Programming', progress: 91, status: 'Mastered', color: 'bg-purple-500' },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{s.subject}</span>
                    <span className="text-slate-400 font-mono">{s.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: AI Coach & Upcoming Exam */}
        <div className="space-y-6">
          
          {/* Exam Countdown Widget */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Exam Countdown</h3>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl font-extrabold text-white tracking-tight">14 Days</div>
              <p className="text-[11px] text-slate-400 mt-1">MSBTE Winter 2024 Theory Exam</p>
            </div>
            <div className="mt-3 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>First Paper:</span>
                <span className="font-bold text-amber-400">DSA (Paper 22316)</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-mono">Oct 3, 2026</span>
              </div>
            </div>
          </div>

          {/* AI Recommended Daily Drill */}
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-spin-slow" />
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Daily Recommendation</h3>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300">
                High Weightage Topic
              </span>
              <h4 className="text-xs font-bold text-white">AVL Tree Rotations & Banker's Safety Algorithm</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Appeared 4 times in the past 5 examination sessions. 8 marks guaranteed.
              </p>
              <Link
                href="/ai-tutor?prompt=Explain AVL Tree Rotations and Bankers Safety Algorithm"
                className="mt-2 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center block transition-colors"
              >
                Start AI Practice Session
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
