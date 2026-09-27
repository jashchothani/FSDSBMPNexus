"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Lock, Globe, GraduationCap, Code2, Swords, Brain, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

const MOCK_ROOMS = [
  { id: '1', name: 'DBMS Warriors', type: 'STUDY', privacy: 'PUBLIC', host: 'Jash C.', memberCount: 4, maxParticipants: 20, status: 'ACTIVE' },
  { id: '2', name: 'Friday Night Code', type: 'CLASH', privacy: 'PUBLIC', host: 'Harsh M.', memberCount: 12, maxParticipants: 50, status: 'ACTIVE' },
  { id: '3', name: 'Exam Prep (DSA)', type: 'QUIZ', privacy: 'CLASS_ONLY', host: 'Priya S.', memberCount: 32, maxParticipants: 60, status: 'ACTIVE' },
  { id: '4', name: 'Java Practice', type: 'CODING', privacy: 'PUBLIC', host: 'Dhamik S.', memberCount: 6, maxParticipants: 10, status: 'WAITING' },
  { id: '5', name: 'DSA Speed Run', type: 'CLASH', privacy: 'PRIVATE', host: 'Aarav P.', memberCount: 2, maxParticipants: 2, status: 'ACTIVE' },
];

const typeConfig: Record<string, { icon: any, color: string, bg: string }> = {
  STUDY: { icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  CODING: { icon: Code2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  CLASH: { icon: Swords, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  QUIZ: { icon: Brain, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  CUSTOM: { icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
};

const privacyIcons: Record<string, any> = { PUBLIC: Globe, CLASS_ONLY: GraduationCap, PRIVATE: Lock };

export default function RoomsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filtered = MOCK_ROOMS.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'All' && r.type !== filterType) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" /> Nexus Rooms
          </h1>
          <p className="mt-1 text-sm text-slate-400">Join a room to study, code, or compete together</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        {['All', 'STUDY', 'CODING', 'CLASH', 'QUIZ'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              filterType === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {t === 'All' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((room, i) => {
          const tc = typeConfig[room.type] || typeConfig.CUSTOM;
          const TypeIcon = tc.icon;
          const PrivacyIcon = privacyIcons[room.privacy] || Globe;
          const fillPct = Math.round((room.memberCount / room.maxParticipants) * 100);

          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm transition-all hover:border-slate-700 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tc.bg}`}>
                    <TypeIcon className={`h-5 w-5 ${tc.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{room.name}</h3>
                    <p className="text-xs text-slate-500">by {room.host}</p>
                  </div>
                </div>
                <PrivacyIcon className="h-4 w-4 text-slate-600" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className={`rounded border px-2 py-0.5 text-xs font-bold ${tc.bg} ${tc.color}`}>
                  {room.type}
                </span>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                  room.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {room.status === 'ACTIVE' ? '● Live' : '○ Waiting'}
                </span>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {room.memberCount}/{room.maxParticipants}</span>
                  <span>{fillPct}% full</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full bg-purple-500 transition-all" style={{ width: `${fillPct}%` }} />
                </div>
                <button className="mt-4 w-full rounded-xl bg-slate-800 py-2 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
                  Join Room
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create Room</h2>
                <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-1.5 block">Room Name</label>
                  <input className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="e.g. DBMS Warriors" />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-2 block">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['STUDY', 'CODING', 'CLASH', 'QUIZ', 'CUSTOM'] as const).map(t => {
                      const tc2 = typeConfig[t];
                      const Icon = tc2.icon;
                      return (
                        <button key={t} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${tc2.bg} ${tc2.color} hover:opacity-80`}>
                          <Icon className="h-4 w-4" /> {t.charAt(0) + t.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-400 mb-2 block">Privacy</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'PUBLIC', label: 'Public', icon: Globe },
                      { key: 'CLASS_ONLY', label: 'Class Only', icon: GraduationCap },
                      { key: 'PRIVATE', label: 'Private', icon: Lock },
                    ].map(p => (
                      <button key={p.key} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-300 hover:border-blue-500 hover:text-white transition-colors">
                        <p.icon className="h-4 w-4" /> {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-[0.98] transition-all">
                  Create Room
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
