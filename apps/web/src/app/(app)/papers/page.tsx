'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Sparkles, 
  Bookmark, 
  CheckCircle,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { MOCK_PAPERS, QuestionPaper } from '@/lib/api-client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

export default function PaperLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedSem, setSelectedSem] = useState<string>('ALL');
  const [selectedScheme, setSelectedScheme] = useState<string>('ALL');
  const [selectedSeason, setSelectedSeason] = useState<string>('ALL');
  
  // PDF Viewer Modal State
  const [activePdf, setActivePdf] = useState<QuestionPaper | null>(null);

  const departments = [
    'Computer Engineering',
    'Information Technology',
    'Electronics & Telecommunication',
    'Civil Engineering',
    'Mechanical Engineering'
  ];

  const filteredPapers = MOCK_PAPERS.filter((paper) => {
    if (selectedDept !== 'ALL' && paper.department !== selectedDept) return false;
    if (selectedSem !== 'ALL' && paper.semester.toString() !== selectedSem) return false;
    if (selectedScheme !== 'ALL' && paper.scheme !== selectedScheme) return false;
    if (selectedSeason !== 'ALL' && paper.season !== selectedSeason) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        paper.title.toLowerCase().includes(q) ||
        paper.subject.toLowerCase().includes(q) ||
        paper.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            Question Paper Archive
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access previous year question papers indexed by department, semester, and MSBTE scheme
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-700">{filteredPapers.length}</strong> papers
          </span>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card-elevated p-5 rounded-2xl space-y-3"
      >
        
        {/* Search Row */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by subject name, code, or topic tag..."
            className="w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          {/* Department */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white text-slate-700 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Semester</label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full bg-white text-slate-700 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s} value={s.toString()}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Scheme */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">MSBTE Scheme</label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full bg-white text-slate-700 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
            >
              <option value="ALL">All Schemes</option>
              <option value="K-Scheme">K-Scheme (Latest)</option>
              <option value="I-Scheme">I-Scheme</option>
              <option value="Revised">Revised</option>
            </select>
          </div>

          {/* Exam Season */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Exam Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full bg-white text-slate-700 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
            >
              <option value="ALL">All Seasons</option>
              <option value="WINTER">Winter Exam</option>
              <option value="SUMMER">Summer Exam</option>
            </select>
          </div>

        </div>
      </motion.div>

      {/* Papers Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredPapers.map((paper, idx) => (
          <motion.div
            key={paper.id}
            variants={fadeUp}
            custom={idx}
            className="card-elevated p-5 rounded-2xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                    {paper.scheme}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                    Sem {paper.semester}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {paper.season} {paper.year}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {paper.title}
              </h3>

              <p className="text-xs text-slate-500 mb-3">{paper.department}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {paper.tags.map((tag, tidx) => (
                  <span key={tidx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="font-mono">{paper.fileSize}</span>
                {paper.solutionsAvailable && (
                  <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                    <CheckCircle className="h-3 w-3" />
                    Solutions
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePdf(paper)}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm shadow-blue-500/20"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Embedded PDF Preview Modal */}
      {activePdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl h-[85vh] bg-white border border-blue-100 rounded-3xl shadow-2xl shadow-blue-100/30 flex flex-col overflow-hidden"
          >
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{activePdf.title}</h3>
                <p className="text-[11px] text-slate-400">
                  {activePdf.department} • {activePdf.scheme} • {activePdf.season} {activePdf.year}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePdf.pdfUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  onClick={() => setActivePdf(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / PDF Viewer Frame */}
            <div className="flex-1 bg-slate-50 p-2 overflow-hidden flex flex-col items-center justify-center">
              <iframe
                src={`${activePdf.pdfUrl}#toolbar=0`}
                className="w-full h-full rounded-2xl border border-slate-200"
                title={activePdf.title}
              />
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
