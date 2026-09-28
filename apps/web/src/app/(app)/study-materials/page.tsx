'use client';

import React, { useState } from 'react';
import { 
  FolderGit2, 
  Folder, 
  FileText, 
  Search, 
  Download, 
  Plus, 
  Bookmark, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

export default function StudyMaterialsPage() {
  const [activeTab, setActiveTab] = useState<'NOTES' | 'SLIDES' | 'SYLLABUS'>('NOTES');

  const materials = [
    {
      id: 'm-1',
      title: 'Data Structures Unit 1-6 Master Revision Notes',
      subject: 'Data Structures & Algorithms',
      type: 'NOTES',
      uploadedBy: 'Prof. R. Sharma (SBMP CS Dept)',
      fileSize: '4.2 MB',
      likes: 340,
      downloads: 1200,
    },
    {
      id: 'm-2',
      title: 'DBMS SQL Queries & Normalization Cheatsheet',
      subject: 'Database Management Systems',
      type: 'NOTES',
      uploadedBy: 'Nexus Academic Team',
      fileSize: '1.5 MB',
      likes: 510,
      downloads: 2400,
    },
    {
      id: 'm-3',
      title: 'Operating Systems Process Scheduling Lecture Slides',
      subject: 'Operating Systems',
      type: 'SLIDES',
      uploadedBy: 'Prof. V. Patil',
      fileSize: '8.1 MB',
      likes: 190,
      downloads: 850,
    },
    {
      id: 'm-4',
      title: 'MSBTE K-Scheme Semester 4 Computer Eng Syllabus Copy',
      subject: 'Computer Engineering Curriculum',
      type: 'SYLLABUS',
      uploadedBy: 'MSBTE Official',
      fileSize: '0.8 MB',
      likes: 620,
      downloads: 3800,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-indigo-400" />
            Academic Notes & Drive Resources
          </h1>
          <p className="text-xs text-slate-400">
            Curated faculty notes, lecture presentations, formula cheat sheets, and official syllabus copies
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md">
          <Plus className="h-4 w-4" />
          <span>Upload Notes</span>
        </button>
      </div>

      {/* Resource Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: 'NOTES', label: 'Lecture Notes & Guides' },
          { key: 'SLIDES', label: 'Presentation Slides' },
          { key: 'SYLLABUS', label: 'Curriculum & Syllabus' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Material Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {materials
          .filter((m) => m.type === activeTab || activeTab === 'NOTES')
          .map((item) => (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {item.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.fileSize}</span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                  {item.title}
                </h3>

                <p className="text-[11px] text-slate-400 mb-4">Uploaded by {item.uploadedBy}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>❤️ {item.likes}</span>
                  <span>📥 {item.downloads}</span>
                </div>

                <a
                  href="#"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Resource</span>
                </a>
              </div>
            </div>
          ))}
      </div>

    </div>
  );
}
