'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  FileText, 
  BrainCircuit, 
  FolderGit2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Zap, 
  Star,
  Download,
  Users,
  Layers,
  GraduationCap,
  Clock,
  Award,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { MOCK_PAPERS } from '@/lib/api-client';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

export default function LandingPage() {
  const [activeSem, setActiveSem] = useState<number>(4);
  const [activeScheme, setActiveScheme] = useState<'K-Scheme' | 'I-Scheme'>('K-Scheme');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = MOCK_PAPERS.filter(p => 
    (!searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f0f6ff] text-slate-800 overflow-hidden relative">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-sky-200/25 blur-[100px] pointer-events-none animate-blob-delay" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-indigo-200/20 blur-[80px] pointer-events-none animate-blob-delay-2" />

      {/* Soft Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f608_1px,transparent_1px),linear-gradient(to_bottom,#3b82f608_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* ========== NAVBAR ========== */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 glass-panel border-b border-blue-100/60 bg-white/70 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-800">
                SBMP<span className="text-gradient">Nexus</span>
              </span>
              <span className="ml-2 text-[10px] font-semibold text-blue-600 px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                v2.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#papers" className="hover:text-blue-600 transition-colors">Paper Archive</a>
            <a href="#ai-tutor" className="hover:text-blue-600 transition-colors">NexusAI</a>
            <a href="#schemes" className="hover:text-blue-600 transition-colors">Curriculum</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5"
            >
              <span>Launch Nexus</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        
        {/* Shimmer Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-shimmer border border-blue-200 text-blue-600 text-xs font-semibold mb-6 shadow-sm bg-white/60 backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse-soft" />
          <span>Next-Gen Academic Knowledge Nexus for SBMP & MSBTE Students</span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-slate-900"
        >
          Every Paper. Every Note.{' '}
          <span className="text-gradient">Every Semester.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          Stop digging through slow drive links and outdated PDFs. Access structured previous-year question papers, model answer keys, interactive question banks, and an AI tutor tuned for diploma engineering.
        </motion.p>

        {/* Hero Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 max-w-2xl mx-auto"
        >
          <div className="glass-panel p-2 rounded-2xl border border-blue-100 shadow-xl flex items-center gap-2 bg-white/80">
            <Search className="h-5 w-5 text-blue-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject (e.g. Data Structures, DBMS, Operating Systems)..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-2"
            />
            <Link
              href="/papers"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-xs transition-all shrink-0 shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <span>Explore Archive</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400 flex-wrap">
            <span className="font-medium text-slate-500">Popular Searches:</span>
            {['DBMS Winter 2024', 'DSA K-Scheme', 'Maths 2 Solved', 'AVL Trees'].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-600 border border-slate-200 hover:border-blue-300 transition-all text-xs shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: 'Question Papers', value: '1,450+', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Solved Answer Keys', value: '890+', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Active Students', value: '4,200+', icon: Users, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-100' },
            { label: 'AI Tutor Queries', value: '25,000+', icon: Sparkles, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' },
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={fadeUp}
              custom={idx}
              className={`card-elevated p-5 rounded-2xl ${stat.border} text-center group hover:scale-[1.02] transition-transform`}
            >
              <div className={`h-12 w-12 rounded-xl ${stat.bg} mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

      </section>

      {/* ========== FEATURE CARDS ========== */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Built Like <span className="text-gradient">Notion + Google Drive + ChatGPT</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Engineered specifically for engineering diploma curriculums with MSBTE I-Scheme and K-Scheme support.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          
          {/* Card 1: Paper Repository */}
          <motion.div variants={fadeUp} className="card-elevated p-7 rounded-2xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-500 flex items-center justify-center mb-5">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                Intelligent Paper Archive
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Filter paper archives by Department, Semester (1-8), Scheme (I-Scheme/K-Scheme), Exam Year (2018-2025), and Season. Download or preview instantly.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-500">
                <span>Browse Papers</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Question Bank */}
          <motion.div variants={fadeUp} className="card-elevated p-7 rounded-2xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 text-violet-500 flex items-center justify-center mb-5">
                <BrainCircuit className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-violet-600 transition-colors">
                High-Frequency Question Bank
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Know exactly which questions repeat every exam. Tagged by marks (2M, 4M, 6M, 8M), difficulty rating, and model solution breakdowns.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-violet-500">
                <span>View PYQs</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: NexusAI Tutor */}
          <motion.div variants={fadeUp} className="card-elevated p-7 rounded-2xl group relative overflow-hidden bg-gradient-to-b from-sky-50/50 to-white border-sky-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 text-sky-500 flex items-center justify-center mb-5">
                <Sparkles className="h-7 w-7 animate-pulse-soft" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors">
                NexusAI Exam Coach
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload any paper or question to get instant step-by-step solutions, formula sheets, key concepts summary, and 24/7 interactive tutoring.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-sky-500">
                <span>Try NexusAI</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* ========== PAPER PREVIEW SECTION ========== */}
      <section id="papers" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-elevated p-8 rounded-3xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Live Paper Archive Preview</h2>
              <p className="text-sm text-slate-500">Explore recently indexed previous year examination papers</p>
            </div>

            {/* Scheme Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['K-Scheme', 'I-Scheme'].map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setActiveScheme(scheme as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeScheme === scheme 
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                      : 'text-slate-500 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  {scheme}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredPapers.slice(0, 6).map((paper, idx) => (
              <motion.div 
                key={paper.id} 
                variants={fadeUp}
                custom={idx}
                className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                      {paper.scheme}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{paper.season} {paper.year}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{paper.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{paper.department} • Sem {paper.semester}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {paper.tags.map((t, tidx) => (
                      <span key={tidx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-mono">{paper.fileSize}</span>
                  <Link
                    href="/papers"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white font-semibold text-xs transition-all"
                  >
                    View Paper
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="mt-10 border-t border-blue-100 bg-white/60 backdrop-blur-md py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              SN
            </div>
            <div>
              <p className="font-bold text-slate-700">SBMPNexus Platform</p>
              <p className="text-xs text-slate-400">Academic Knowledge Nexus • Version 2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <Link href="/papers" className="hover:text-blue-600 transition-colors">Papers</Link>
            <Link href="/question-bank" className="hover:text-blue-600 transition-colors">Question Bank</Link>
            <Link href="/ai-tutor" className="hover:text-blue-600 transition-colors">NexusAI</Link>
          </div>
          <p className="text-xs text-slate-400">© 2026 SBMPNexus. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
