'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Presentation,
  FileCheck,
  FileEdit,
  Image,
  Share2,
  Layers,
  ArrowRight,
  Upload,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  Cpu,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface ToolCard {
  id: string;
  name: string;
  category: string;
  priority: 'Very High' | 'High' | 'Medium';
  description: string;
  useCase: string;
  href: string;
  icon: any;
  color: string;
  accentBg: string;
  borderHover: string;
  tag: string;
  supportedFormats: string[];
}

const TOOLS: ToolCard[] = [
  {
    id: 'ppt-to-pdf',
    name: 'PPT → PDF Converter',
    category: 'Presentation Engine',
    priority: 'High',
    description: 'Convert lecture and college presentations (.pptx) into crisp, distributable PDFs with slide preview & custom layouts.',
    useCase: 'Lecture notes, seminar slides, project defenses',
    href: '/tools/ppt-to-pdf',
    icon: Presentation,
    color: 'text-amber-400',
    accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderHover: 'hover:border-amber-500/40',
    tag: '16:9 & Handout',
    supportedFormats: ['.pptx', '.ppt'],
  },
  {
    id: 'word-to-pdf',
    name: 'Word → PDF Converter',
    category: 'Document Publishing',
    priority: 'High',
    description: 'Convert college notices, assignments, lab manuals, and syllabus docs (.docx) into publication-grade formatted PDFs.',
    useCase: 'Notices, assignments, circulars, lab reports',
    href: '/tools/word-to-pdf',
    icon: FileCheck,
    color: 'text-blue-400',
    accentBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderHover: 'hover:border-blue-500/40',
    tag: 'Preserves Tables',
    supportedFormats: ['.docx', '.doc'],
  },
  {
    id: 'pdf-to-word',
    name: 'PDF → Word (.docx) Editor',
    category: 'Document Intelligence',
    priority: 'High',
    description: 'Extract question papers, model answers, and syllabus guides from PDF into clean, natively editable Word documents.',
    useCase: 'Edit question papers, reuse model answers, extract text',
    href: '/tools/pdf-to-word',
    icon: FileEdit,
    color: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    borderHover: 'hover:border-indigo-500/40',
    tag: 'Live Text Edit',
    supportedFormats: ['.pdf'],
  },
  {
    id: 'background-remover',
    name: 'ID Photo & Document BG Remover',
    category: 'Computer Vision',
    priority: 'Medium',
    description: 'Remove backgrounds from student ID photos, certificates, and hall ticket photos with passport presets (35x45mm) & white/blue backgrounds.',
    useCase: 'College ID cards, MSBTE hall tickets, certificate photos',
    href: '/tools/background-remover',
    icon: Image,
    color: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/40',
    tag: 'Passport Preset',
    supportedFormats: ['.png', '.jpg', '.jpeg', '.webp'],
  },
  {
    id: 'clipboard',
    name: 'Private Temporary Clipboard',
    category: 'Zero-Trace Sync',
    priority: 'Very High',
    description: 'Transfer code snippets, exam solutions, links, and files between college lab PCs, laptops, and mobile phones via 6-digit PIN or QR code.',
    useCase: 'Lab PC to mobile transfer, no personal login needed',
    href: '/tools/clipboard',
    icon: Share2,
    color: 'text-rose-400',
    accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    borderHover: 'hover:border-rose-500/40',
    tag: 'QR Code & PIN',
    supportedFormats: ['Text', 'Code', 'Files up to 25MB'],
  },
  {
    id: 'pdf-manage',
    name: 'PDF Merge / Split / Compress',
    category: 'PDF Power Suite',
    priority: 'High',
    description: 'Merge multiple question papers, split syllabus notes by chapters, or compress heavy scanned exam PDFs to comply with portal upload limits.',
    useCase: 'Merge papers with keys, split modules, compress < 2MB',
    href: '/tools/pdf-manage',
    icon: Layers,
    color: 'text-purple-400',
    accentBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderHover: 'hover:border-purple-500/40',
    tag: '3-in-1 Suite',
    supportedFormats: ['.pdf'],
  },
];

export default function AcademicToolsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'office' | 'utility'>('all');

  const handleFileUpload = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (['.pptx', '.ppt'].includes(ext)) {
      router.push('/tools/ppt-to-pdf');
    } else if (['.docx', '.doc'].includes(ext)) {
      router.push('/tools/word-to-pdf');
    } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      router.push('/tools/background-remover');
    } else if (ext === '.pdf') {
      router.push('/tools/pdf-manage');
    } else {
      router.push('/tools/clipboard');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const filteredTools = TOOLS.filter((tool) => {
    if (filter === 'pdf') return tool.id.includes('pdf') && tool.id !== 'ppt-to-pdf';
    if (filter === 'office') return tool.id === 'ppt-to-pdf' || tool.id === 'word-to-pdf' || tool.id === 'pdf-to-word';
    if (filter === 'utility') return tool.id === 'clipboard' || tool.id === 'background-remover';
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Integrated Academic Tools Suite
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zero-Upload Privacy First
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Essential Tools for <span className="text-gradient">Students & Faculty</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Convert lecture presentations, edit exam papers, process student ID photos, transfer code between college lab PCs, and manage syllabus documents without watermarks or third-party ads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/tools/clipboard"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Open Temp Clipboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Universal Smart Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
          <Upload className="h-7 w-7" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-white mb-1">
          Drop any academic document here for instant auto-detection
        </h3>
        <p className="text-xs text-slate-400 max-w-md">
          Supports <span className="text-slate-300 font-medium">.pptx, .docx, .pdf, .png, .jpg</span>. We automatically route you to the matching conversion or editing tool.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All 6 Tools' },
            { id: 'office', label: 'Office & Presentations' },
            { id: 'pdf', label: 'PDF Utilities' },
            { id: 'utility', label: 'ID Photo & Lab Sync' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing {filteredTools.length} utilities
        </span>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`glass-panel p-6 rounded-2xl border border-slate-800/90 transition-all flex flex-col justify-between group ${tool.borderHover} hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1`}
            >
              <div>
                {/* Card Top: Icon & Tags */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${tool.accentBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {tool.tag}
                    </span>
                    <span className={`text-[10px] font-semibold ${
                      tool.priority === 'Very High' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {tool.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1.5">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {tool.description}
                </p>

                {/* Academic Use Case */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
                  <p className="text-[11px] text-slate-400">
                    <span className="text-slate-300 font-semibold">Campus Use: </span>
                    {tool.useCase}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className="text-[11px] text-slate-400">
                  {tool.supportedFormats.join(', ')}
                </span>
                <span className="text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch Tool
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid sm:grid-cols-3 gap-4 pt-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">100% Private & Secure</h4>
            <p className="text-[11px] text-slate-400">Processing happens locally on your machine. Documents never leak.</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Instant & Watermark Free</h4>
            <p className="text-[11px] text-slate-400">No queues, no download limits, no banner watermarks on your PDFs.</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Tailored for MSBTE / SBMP</h4>
            <p className="text-[11px] text-slate-400">Presets for hall ticket sizing, college headers, and exam file size limits.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
