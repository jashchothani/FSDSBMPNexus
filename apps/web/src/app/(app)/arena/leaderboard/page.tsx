"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Swords } from 'lucide-react';

const SUBJECTS = ['Overall', 'Data Structures', 'DBMS', 'Java', 'Web Development'];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Aarav Patel', rating: 1892, xp: 24500, solved: 145, wins: 42, avatar: '🥇' },
  { rank: 2, name: 'Priya Sharma', rating: 1756, xp: 19200, solved: 128, wins: 35, avatar: '🥈' },
  { rank: 3, name: 'Jash Chothani', rating: 1472, xp: 8420, solved: 67, wins: 18, avatar: '🥉' },
  { rank: 4, name: 'Harsh Modi', rating: 1458, xp: 7890, solved: 62, wins: 15, avatar: '👤' },
  { rank: 5, name: 'Dhamik Shah', rating: 1401, xp: 6540, solved: 54, wins: 12, avatar: '👤' },
  { rank: 6, name: 'Kavya Desai', rating: 1389, xp: 6100, solved: 51, wins: 11, avatar: '👤' },
  { rank: 7, name: 'Rohan Mehta', rating: 1352, xp: 5600, solved: 48, wins: 9, avatar: '👤' },
  { rank: 8, name: 'Sneha Joshi', rating: 1321, xp: 5100, solved: 44, wins: 8, avatar: '👤' },
  { rank: 9, name: 'Arjun Reddy', rating: 1298, xp: 4700, solved: 41, wins: 7, avatar: '👤' },
  { rank: 10, name: 'Nidhi Gupta', rating: 1267, xp: 4200, solved: 38, wins: 6, avatar: '👤' },
];

export default function LeaderboardPage() {
  const [activeSubject, setActiveSubject] = useState('Overall');
  const [sortBy, setSortBy] = useState<'rating' | 'xp'>('rating');

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" /> Nexus Leaderboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">Semester 3 — Top performers across all subjects</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {/* 2nd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col items-center rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-6 pt-8"
        >
          <div className="text-4xl mb-2">🥈</div>
          <h3 className="text-lg font-bold text-white">{MOCK_LEADERBOARD[1].name}</h3>
          <p className="text-sm font-semibold text-blue-400 mt-1">Rating {MOCK_LEADERBOARD[1].rating}</p>
          <p className="text-xs text-slate-500 mt-1">{MOCK_LEADERBOARD[1].xp.toLocaleString()} XP</p>
        </motion.div>

        {/* 1st Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="flex flex-col items-center rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-yellow-900/20 to-slate-900 p-6 pt-4 shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)]"
        >
          <Crown className="h-8 w-8 text-yellow-500 mb-2" />
          <div className="text-5xl mb-2">🥇</div>
          <h3 className="text-xl font-bold text-white">{MOCK_LEADERBOARD[0].name}</h3>
          <p className="text-sm font-semibold text-yellow-400 mt-1">Rating {MOCK_LEADERBOARD[0].rating}</p>
          <p className="text-xs text-slate-500 mt-1">{MOCK_LEADERBOARD[0].xp.toLocaleString()} XP</p>
          <div className="mt-3 flex gap-4 text-xs text-slate-400">
            <span>{MOCK_LEADERBOARD[0].solved} solved</span>
            <span>{MOCK_LEADERBOARD[0].wins} wins</span>
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col items-center rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-900/10 to-slate-900 p-6 pt-8"
        >
          <div className="text-4xl mb-2">🥉</div>
          <h3 className="text-lg font-bold text-white">{MOCK_LEADERBOARD[2].name}</h3>
          <p className="text-sm font-semibold text-orange-400 mt-1">Rating {MOCK_LEADERBOARD[2].rating}</p>
          <p className="text-xs text-slate-500 mt-1">{MOCK_LEADERBOARD[2].xp.toLocaleString()} XP</p>
        </motion.div>
      </div>

      {/* Subject Tabs + Sort */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                activeSubject === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('rating')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              sortBy === 'rating' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Rating
          </button>
          <button
            onClick={() => setSortBy('xp')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              sortBy === 'xp' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Star className="h-3.5 w-3.5" /> XP
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">
        <div className="grid grid-cols-12 gap-4 border-b border-slate-800 bg-slate-900/80 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Student</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-2">XP</div>
          <div className="col-span-1">Solved</div>
          <div className="col-span-2">Clash Wins</div>
        </div>

        {MOCK_LEADERBOARD.map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`grid grid-cols-12 gap-4 border-b border-slate-800/50 px-6 py-4 text-sm transition-colors hover:bg-slate-800/30 ${
              entry.name === 'Jash Chothani' ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
            }`}
          >
            <div className="col-span-1 flex items-center">
              <span className={`font-bold ${entry.rank <= 3 ? 'text-yellow-400 text-lg' : 'text-slate-500'}`}>
                {entry.rank}
              </span>
            </div>
            <div className="col-span-4 flex items-center gap-3">
              <span className="text-2xl">{entry.avatar}</span>
              <div>
                <span className={`font-semibold ${entry.name === 'Jash Chothani' ? 'text-blue-400' : 'text-white'}`}>{entry.name}</span>
                {entry.name === 'Jash Chothani' && <span className="ml-2 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400">YOU</span>}
              </div>
            </div>
            <div className="col-span-2 flex items-center font-bold text-white">{entry.rating}</div>
            <div className="col-span-2 flex items-center text-yellow-400 font-semibold">{entry.xp.toLocaleString()}</div>
            <div className="col-span-1 flex items-center text-slate-400">{entry.solved}</div>
            <div className="col-span-2 flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5 text-red-400" />
              <span className="font-semibold text-slate-300">{entry.wins}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
