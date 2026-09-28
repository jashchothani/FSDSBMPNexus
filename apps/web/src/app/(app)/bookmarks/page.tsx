'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, FileText, HelpCircle, Folder, ArrowRight } from 'lucide-react';
import { MOCK_PAPERS } from '@/lib/api-client';

export default function BookmarksPage() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-blue-400" />
          Saved Library & Folders
        </h1>
        <p className="text-xs text-slate-400">
          Your bookmarked question papers, high-frequency questions, and custom revision collections
        </p>
      </div>

      {/* Bookmarked Papers */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          Saved Question Papers (2)
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {MOCK_PAPERS.slice(0, 2).map((paper) => (
            <div
              key={paper.id}
              className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2 inline-block">
                  {paper.scheme} • Sem {paper.semester}
                </span>
                <h3 className="text-xs font-bold text-white mb-1">{paper.title}</h3>
                <p className="text-[10px] text-slate-400">{paper.department}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">{paper.fileSize}</span>
                <Link
                  href="/papers"
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
