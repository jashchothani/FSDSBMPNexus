'use client';

import React, { useState } from 'react';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            Question Paper Archive
          </h1>
          <p className="text-xs text-slate-400">
            Access previous year question papers indexed by department, semester, and MSBTE scheme
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-white">{filteredPapers.length}</strong> papers
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 bg-slate-900/80">
        
        {/* Search Row */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by subject name, code, or topic tag..."
            className="w-full bg-slate-950 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          {/* Department */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Semester</label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s} value={s.toString()}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Scheme */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">MSBTE Scheme</label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Schemes</option>
              <option value="K-Scheme">K-Scheme (Latest)</option>
              <option value="I-Scheme">I-Scheme</option>
              <option value="Revised">Revised</option>
            </select>
          </div>

          {/* Exam Season */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Exam Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Seasons</option>
              <option value="WINTER">Winter Exam</option>
              <option value="SUMMER">Summer Exam</option>
            </select>
          </div>

        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {paper.scheme}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    Sem {paper.semester}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {paper.season} {paper.year}
                </span>
              </div>

              <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                {paper.title}
              </h3>

              <p className="text-[11px] text-slate-400 mb-3">{paper.department}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {paper.tags.map((tag, idx) => (
                  <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="font-mono">{paper.fileSize}</span>
                {paper.solutionsAvailable && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle className="h-3 w-3" />
                    Solutions
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePdf(paper)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded PDF Preview Modal */}
      {activePdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl h-[85vh] glass-panel bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{activePdf.title}</h3>
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
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  onClick={() => setActivePdf(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / PDF Viewer Frame */}
            <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex flex-col items-center justify-center">
              <iframe
                src={`${activePdf.pdfUrl}#toolbar=0`}
                className="w-full h-full rounded-2xl border border-slate-800"
                title={activePdf.title}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
