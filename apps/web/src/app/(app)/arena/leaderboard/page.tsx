"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Star, TrendingUp, Swords, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rating: number;
  xp: number;
  solved?: number;
  wins?: number;
  isYou?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function LeaderboardPage() {
  const { token } = useAuth();
  const [activeSubject, setActiveSubject] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'xp'>('rating');
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        sortBy,
        period,
        ...(activeSubject ? { subject: activeSubject } : {}),
      });
      const res = await fetch(`${API_URL}/arena/leaderboard?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEntries(json.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [token, sortBy, period, activeSubject]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" /> Arena Leaderboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">Top competitive student rankings across SBMP Nexus</p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {p === 'all' ? 'All Time' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col items-center rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-6 pt-8 text-center"
          >
            <div className="text-4xl mb-2">🥈</div>
            <h3 className="text-lg font-bold text-white truncate max-w-full">{top2.firstName} {top2.lastName}</h3>
            <p className="text-sm font-semibold text-blue-400 mt-1">Rating {top2.rating}</p>
            <p className="text-xs text-slate-500 mt-1">{top2.xp.toLocaleString()} XP</p>
          </motion.div>

          {/* 1st Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
            className="flex flex-col items-center rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-yellow-900/20 to-slate-900 p-6 pt-4 shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)] text-center"
          >
            <Crown className="h-8 w-8 text-yellow-500 mb-2" />
            <div className="text-5xl mb-2">🥇</div>
            <h3 className="text-xl font-bold text-white truncate max-w-full">{top1.firstName} {top1.lastName}</h3>
            <p className="text-sm font-semibold text-yellow-400 mt-1">Rating {top1.rating}</p>
            <p className="text-xs text-slate-500 mt-1">{top1.xp.toLocaleString()} XP</p>
          </motion.div>

          {/* 3rd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-900/10 to-slate-900 p-6 pt-8 text-center"
          >
            <div className="text-4xl mb-2">🥉</div>
            <h3 className="text-lg font-bold text-white truncate max-w-full">{top3.firstName} {top3.lastName}</h3>
            <p className="text-sm font-semibold text-orange-400 mt-1">Rating {top3.rating}</p>
            <p className="text-xs text-slate-500 mt-1">{top3.xp.toLocaleString()} XP</p>
          </motion.div>
        </div>
      )}

      {/* Sort Buttons */}
      <div className="flex justify-end gap-2">
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

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">
        <div className="grid grid-cols-12 gap-4 border-b border-slate-800 bg-slate-900/80 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Student</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-2">XP</div>
          <div className="col-span-1">Solved</div>
          <div className="col-span-2">Clash Wins</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No active leaderboard rankings found yet.</div>
        ) : (
          entries.map((entry, i) => (
            <motion.div
              key={entry.userId || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`grid grid-cols-12 gap-4 border-b border-slate-800/50 px-6 py-4 text-sm transition-colors hover:bg-slate-800/30 ${
                entry.isYou ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="col-span-1 flex items-center">
                <span className={`font-bold ${entry.rank <= 3 ? 'text-yellow-400 text-lg' : 'text-slate-500'}`}>
                  #{entry.rank}
                </span>
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {entry.firstName?.[0] || 'U'}
                </div>
                <div>
                  <span className={`font-semibold ${entry.isYou ? 'text-blue-400' : 'text-white'}`}>
                    {entry.firstName} {entry.lastName}
                  </span>
                  {entry.isYou && (
                    <span className="ml-2 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400">YOU</span>
                  )}
                </div>
              </div>
              <div className="col-span-2 flex items-center font-bold text-white">{entry.rating}</div>
              <div className="col-span-2 flex items-center text-yellow-400 font-semibold">{entry.xp?.toLocaleString() || 0}</div>
              <div className="col-span-1 flex items-center text-slate-400">{entry.solved || 0}</div>
              <div className="col-span-2 flex items-center gap-1.5">
                <Swords className="h-3.5 w-3.5 text-red-400" />
                <span className="font-semibold text-slate-300">{entry.wins || 0}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
