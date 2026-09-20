'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Clock,
  Eye
} from 'lucide-react';

export default function ModerationQueuePage() {
  const [queue, setQueue] = useState([
    {
      id: 'sub-1',
      title: 'Digital Electronics Summer 2023 Solved Paper',
      department: 'Electronics & Telecommunication',
      uploader: 'Rahul Verma (Student)',
      fileSize: '3.4 MB',
      status: 'PENDING',
      submittedAt: '2 hours ago',
    },
    {
      id: 'sub-2',
      title: 'Applied Mathematics - Differential Equations Formulas',
      department: 'Computer Engineering',
      uploader: 'Anita Shah (Contributor)',
      fileSize: '1.2 MB',
      status: 'PENDING',
      submittedAt: '5 hours ago',
    },
  ]);

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    setQueue(queue.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-purple-400" />
          Content Moderation Queue
        </h1>
        <p className="text-xs text-slate-400">
          Review community-submitted question papers and study materials prior to platform publication
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-2">
          <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Queue Clear!</h3>
          <p className="text-xs text-slate-400">No pending submissions requiring moderation approval.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Pending Review
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.submittedAt}</span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
                <p className="text-[11px] text-slate-400">
                  {item.department} • Uploaded by {item.uploader} ({item.fileSize})
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAction(item.id, 'APPROVE')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => handleAction(item.id, 'REJECT')}
                  className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 border border-red-500/30"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
