'use client';

import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  Award, 
  FileText, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function ContributePage() {
  const [submitted, setSubmitted] = useState(false);
  const [paperTitle, setPaperTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('2024');
  const [season, setSeason] = useState('WINTER');
  const [scheme, setScheme] = useState('K-Scheme');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UploadCloud className="h-6 w-6 text-purple-400" />
          Contributor Portal
        </h1>
        <p className="text-xs text-slate-400">
          Upload question papers or study notes to earn reputation points and contribute to the SBMP student community
        </p>
      </div>

      {/* Contributor Stats Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Your Contributor Reputation</h3>
            <p className="text-[11px] text-slate-300">Level 2 Contributor • 140 XP earned</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
          3 Approved Uploads
        </span>
      </div>

      {!submitted ? (
        /* Upload Form */
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white mb-2">Upload Question Paper or Study Notes</h2>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Document Title</label>
            <input
              type="text"
              required
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              placeholder="e.g. Data Structures Winter 2024 Question Paper"
              className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject Name</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">MSBTE Scheme</label>
              <select
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="K-Scheme">K-Scheme (Latest)</option>
                <option value="I-Scheme">I-Scheme</option>
                <option value="Revised">Revised</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Exam Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="WINTER">Winter Exam</option>
                <option value="SUMMER">Summer Exam</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Exam Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div className="p-8 border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl text-center bg-slate-950/40 cursor-pointer transition-colors">
            <UploadCloud className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white">Click to upload or drag & drop PDF file</p>
            <p className="text-[10px] text-slate-500 mt-1">Supports PDF format up to 25MB</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md"
          >
            Submit for Moderation Review
          </button>
        </form>
      ) : (
        /* Success Screen */
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Document Uploaded Successfully!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your document is now in the <strong>Moderation Queue</strong>. Once approved by a moderator, you will receive +50 XP reputation points.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
          >
            Upload Another Paper
          </button>
        </div>
      )}

    </div>
  );
}
