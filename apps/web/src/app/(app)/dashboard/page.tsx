'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const userName = user?.firstName || 'Student';

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="card-elevated p-7 rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-80 h-full bg-blue-100/30 blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 w-48 h-48 bg-sky-100/40 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Account
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold capitalize shadow-sm">
                {user?.role || 'Student'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              Welcome back, <span className="text-gradient">{userName}</span> 👋
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              You're 72% exam ready for MSBTE Winter 2024. Your highest priority topic today is <span className="text-blue-600 font-semibold">Database Management Systems</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ai-tutor"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 animate-pulse-soft" />
              <span>Launch AI Study Plan</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { title: 'Papers Reviewed', value: '18 Papers', change: '+4 this week', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
          { title: 'Quiz Score Avg', value: '84.5%', change: 'Top 10% in batch', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { title: 'AI Assistance', value: '32 Sessions', change: '14 formulas solved', icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-100' },
          { title: 'Study Streak', value: '5 Days', change: 'Personal best!', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
        ].map((m, i) => (
          <motion.div 
            key={i} 
            variants={fadeUp}
            custom={i}
            className={`card-elevated p-5 rounded-2xl ${m.border} flex items-center justify-between group hover:scale-[1.02] transition-transform`}
          >
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{m.title}</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{m.value}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{m.change}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl ${m.bg} ${m.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <m.icon className="h-6 w-6" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: AI Recommendations & Recent Papers */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Papers & Subject Focus */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Papers */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-elevated p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Recommended Question Papers
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Tailored for your Semester 4 Computer Engineering subjects</p>
              </div>
              <Link href="/papers" className="text-xs text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors">
                View All Archives
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_PAPERS.slice(0, 3).map((paper) => (
                <div
                  key={paper.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center font-bold text-xs">
                      {paper.year}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{paper.title}</h4>
                      <p className="text-[10px] text-slate-400">
                        {paper.subject} • {paper.scheme} • {paper.season}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                      {paper.fileSize}
                    </span>
                    <Link
                      href="/papers"
                      className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Subject Readiness Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card-elevated p-6 rounded-2xl"
          >
            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Semester Subject Master Status
            </h3>

            <div className="space-y-4">
              {[
                { subject: 'Data Structures & Algorithms', progress: 88, status: 'Strong', color: 'bg-emerald-400', track: 'bg-emerald-100' },
                { subject: 'Database Management Systems', progress: 74, status: 'Good', color: 'bg-blue-400', track: 'bg-blue-100' },
                { subject: 'Operating Systems', progress: 62, status: 'Needs Review', color: 'bg-amber-400', track: 'bg-amber-100' },
                { subject: 'Object Oriented Programming', progress: 91, status: 'Mastered', color: 'bg-violet-400', track: 'bg-violet-100' },
              ].map((s, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{s.subject}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{s.progress}%</span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full ${s.track} overflow-hidden`}>
                    <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right 1 Col: AI Coach & Upcoming Exam */}
        <div className="space-y-6">
          
          {/* Exam Countdown Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="card-elevated p-5 rounded-2xl border-amber-100 bg-gradient-to-b from-amber-50/50 to-white"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider">Exam Countdown</h3>
            </div>
            <div className="text-center p-4 rounded-xl bg-white border border-amber-100 shadow-sm">
              <div className="text-3xl font-extrabold text-slate-800 tracking-tight">14 Days</div>
              <p className="text-[11px] text-slate-400 mt-1">MSBTE Winter 2024 Theory Exam</p>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>First Paper:</span>
                <span className="font-bold text-amber-600">DSA (Paper 22316)</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-mono">Oct 3, 2026</span>
              </div>
            </div>
          </motion.div>

          {/* AI Recommended Daily Drill */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="card-elevated p-5 rounded-2xl border-blue-100 bg-gradient-to-b from-blue-50/50 to-white"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse-soft" />
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Daily Recommendation</h3>
            </div>
            <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm space-y-2.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-500 border border-violet-200">
                High Weightage Topic
              </span>
              <h4 className="text-sm font-bold text-slate-800">AVL Tree Rotations & Banker&apos;s Safety Algorithm</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Appeared 4 times in the past 5 examination sessions. 8 marks guaranteed.
              </p>
              <Link
                href="/ai-tutor?prompt=Explain AVL Tree Rotations and Bankers Safety Algorithm"
                className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-semibold text-center block transition-all shadow-md shadow-blue-500/20"
              >
                Start AI Practice Session
              </Link>
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
