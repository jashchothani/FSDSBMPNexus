'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swords, Trophy, Clock, ArrowRight, RefreshCw, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ClashHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const historyMatches = [
    { id: 'm-101', opponent: 'Harsh Patel', opponentRating: 1458, result: 'WIN', problem: 'Find Duplicate Elements', subject: 'Data Structures', score: 125, ratingChange: '+18', timeSpent: '4m 12s', date: '27 Sep 2026' },
    { id: 'm-102', opponent: 'Priya Sharma', opponentRating: 1580, result: 'LOSS', problem: 'Valid Parentheses', subject: 'Data Structures', score: 60, ratingChange: '-12', timeSpent: '8m 45s', date: '26 Sep 2026' },
    { id: 'm-103', opponent: 'Aarav Mehta', opponentRating: 1350, result: 'WIN', problem: 'Reverse Linked List', subject: 'Data Structures', score: 140, ratingChange: '+22', timeSpent: '3m 50s', date: '25 Sep 2026' },
    { id: 'm-104', opponent: 'Rohan Gupta', opponentRating: 1290, result: 'WIN', problem: 'Two Sum', subject: 'Data Structures', score: 110, ratingChange: '+15', timeSpent: '2m 10s', date: '24 Sep 2026' },
  ];

  const handleRematch = (opponentName: string) => {
    const code = `CLASH-${Math.floor(1000 + Math.random() * 9000)}`;
    router.push(`/arena/clash?mode=rematch&code=${code}&target=${encodeURIComponent(opponentName)}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Code Clash Match Records</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Match History & Rematch Arena</h1>
          <p className="text-xs text-slate-400 max-w-lg">Review past speed duels, track rating changes, and challenge previous opponents to a rematch.</p>
        </div>

        <div className="flex gap-4 font-mono text-center">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-500 block">Total Clashes</span>
            <span className="text-xl font-bold text-white">24 Matches</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-500 block">Win Rate</span>
            <span className="text-xl font-bold text-emerald-400">75%</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Past Duel Results</h2>
          <span className="text-xs text-slate-400 font-mono">Server Authoritative Records</span>
        </div>

        <div className="divide-y divide-slate-800">
          {historyMatches.map((m) => (
            <div key={m.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm border ${
                    m.result === 'WIN'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {m.result === 'WIN' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">vs {m.opponent}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">({m.opponentRating} Rating)</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Problem: <span className="text-cyan-400 font-medium">{m.problem}</span> ({m.subject})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Time Taken</span>
                  <span className="text-slate-300 font-bold">{m.timeSpent}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Rating Delta</span>
                  <span className={`font-bold ${m.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.ratingChange}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Date</span>
                  <span className="text-slate-400">{m.date}</span>
                </div>

                <button
                  onClick={() => handleRematch(m.opponent)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rematch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
