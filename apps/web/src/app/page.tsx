'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  GraduationCap
} from 'lucide-react';
import { MOCK_PAPERS } from '@/lib/api-client';

export default function LandingPage() {
  const [activeSem, setActiveSem] = useState<number>(4);
  const [activeScheme, setActiveScheme] = useState<'K-Scheme' | 'I-Scheme'>('K-Scheme');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = MOCK_PAPERS.filter(p => 
    (!searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Landing Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">
                SBMP<span className="text-gradient">Nexus</span>
              </span>
              <span className="ml-2 text-[10px] font-semibold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                PROD v2.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#papers" className="hover:text-white transition-colors">Paper Archive</a>
            <a href="#ai-tutor" className="hover:text-white transition-colors">NexusAI</a>
            <a href="#schemes" className="hover:text-white transition-colors">Curriculum</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <span>Launch Nexus</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        
        {/* Shimmer Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-shimmer border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>Next-Gen Academic Knowledge Nexus for SBMP & MSBTE Students</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Every Paper. Every Note.{' '}
          <span className="text-gradient">Every Semester.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stop digging through slow drive links and outdated PDFs. Access structured previous-year question papers, model answer keys, interactive question banks, and an AI tutor tuned for diploma engineering.
        </p>

        {/* Hero Interactive Search Bar */}
        <div className="mt-10 max-w-2xl mx-auto">
          <div className="glass-panel p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-2 bg-slate-900/90">
            <Search className="h-5 w-5 text-blue-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject (e.g. Data Structures, DBMS, Operating Systems)..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none py-2"
            />
            <Link
              href="/papers"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-md flex items-center gap-1.5"
            >
              <span>Explore Archive</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Popular Searches:</span>
            {['DBMS Winter 2024', 'DSA K-Scheme', 'Maths 2 Solved', 'AVL Trees'].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Question Papers', value: '1,450+', icon: FileText, color: 'text-blue-400' },
            { label: 'Solved Answer Keys', value: '890+', icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Active Students', value: '4,200+', icon: Users, color: 'text-purple-400' },
            { label: 'AI Tutor Queries', value: '25,000+', icon: Sparkles, color: 'text-indigo-400' },
          ].map((stat, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-2xl border border-slate-800/80 text-center">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

      </section>

      {/* Feature Architecture Cards */}
      <section id="features" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built Like <span className="text-gradient">Notion + Google Drive + ChatGPT</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Engineered specifically for engineering diploma curriculums with MSBTE I-Scheme and K-Scheme support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: Paper Repository */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 font-bold">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Intelligent Paper Archive
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filter paper archives by Department, Semester (1-8), Scheme (I-Scheme/K-Scheme), Exam Year (2018-2025), and Season (Winter/Summer). Download or preview instantly.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-blue-400">
              <span>Browse Papers</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Question Bank */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 font-bold">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              High-Frequency Question Bank
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Know exactly which questions repeat every exam. Tagged by marks (2M, 4M, 6M, 8M), difficulty rating, and model solution breakdowns.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-purple-400">
              <span>View PYQs</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: NexusAI Tutor */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-indigo-500/30 relative overflow-hidden group bg-gradient-to-b from-indigo-950/20 to-slate-950">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mb-4 font-bold">
              <Sparkles className="h-6 w-6 animate-spin-slow" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
              NexusAI Exam Coach
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload any paper or question to get instant step-by-step solutions, formula sheets, key concepts summary, and 24/7 interactive tutoring.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <span>Try NexusAI</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Paper Preview Showcase */}
      <section id="papers" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto bg-slate-900/40 rounded-3xl border border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Live Paper Archive Preview</h2>
            <p className="text-xs text-slate-400">Explore recently indexed previous year examination papers</p>
          </div>

          {/* Scheme Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['K-Scheme', 'I-Scheme'].map((scheme) => (
              <button
                key={scheme}
                onClick={() => setActiveScheme(scheme as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeScheme === scheme 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {scheme}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.slice(0, 6).map((paper) => (
            <div key={paper.id} className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {paper.scheme}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{paper.season} {paper.year}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1 line-clamp-2">{paper.title}</h4>
                <p className="text-[11px] text-slate-400 mb-3">{paper.department} • Sem {paper.semester}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {paper.tags.map((t, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 font-mono">{paper.fileSize}</span>
                <Link
                  href="/papers"
                  className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold text-[11px] transition-colors"
                >
                  View Paper
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              SN
            </div>
            <div>
              <p className="font-bold text-white">SBMPNexus Platform</p>
              <p className="text-[10px]">Academic Knowledge Nexus • Version 2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/papers" className="hover:text-white">Papers</Link>
            <Link href="/question-bank" className="hover:text-white">Question Bank</Link>
            <Link href="/ai-tutor" className="hover:text-white">NexusAI</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p>© 2026 SBMPNexus. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
