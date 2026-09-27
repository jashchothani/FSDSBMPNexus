'use client';

import React from 'react';
import { User, Trophy, Sparkles, Flame, ShieldCheck, GraduationCap, Award, CheckCircle2, Code2, BarChart2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function StudentProfilePage() {
  const { user } = useAuth();

  const skillTracks = [
    { subject: 'Data Structures & Algorithms', semester: 'Sem 2/3', solved: 18, total: 24, percentage: 75, color: 'bg-cyan-500' },
    { subject: 'Object Oriented Programming (C++)', semester: 'Sem 3', solved: 14, total: 18, percentage: 77, color: 'bg-blue-500' },
    { subject: 'Database Management Systems', semester: 'Sem 4', solved: 10, total: 15, percentage: 66, color: 'bg-indigo-500' },
    { subject: 'Python Basics & Scripting', semester: 'Sem 1', solved: 6, total: 8, percentage: 75, color: 'bg-emerald-500' },
  ];

  const badges = [
    { id: '1', name: 'Array Master', icon: '⚡', desc: 'Solved 15 array problems' },
    { id: '2', name: 'Code Clash Hero', icon: '⚔️', desc: 'Won 5 Code Clashes in a row' },
    { id: '3', name: 'Streak Starter', icon: '🔥', desc: 'Maintained a 12-day streak' },
    { id: '4', name: 'DBMS Champion', icon: '🗄️', desc: 'Completed SQL lab manual' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Profile Header */}
      <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-extrabold text-3xl text-cyan-400">
              {user?.firstName?.[0] || 'J'}
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-white">{user?.firstName || 'Jash'} {user?.lastName || 'Chothani'}</h1>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-bold font-mono">
                {user?.gamification?.rank || 'DIAMOND'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-cyan-400" /> Computer Engineering</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Semester 3</span>
              <span>•</span>
              <span className="text-slate-300 font-mono">{user?.email || 'jash@sbmp.edu.in'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-center">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Rating</span>
              <span className="text-xl font-bold text-amber-400">{user?.gamification?.rating || 1420}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Day Streak</span>
              <span className="text-xl font-bold text-orange-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-orange-400" /> {user?.gamification?.streak || 12}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Skill Map & Badges */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Subject Skill Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>SBMP Semester Curriculum Skill Map</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">48 Total Solved</span>
            </div>

            <div className="space-y-5">
              {skillTracks.map((track, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-200">{track.subject} <span className="text-[10px] text-slate-500">({track.semester})</span></span>
                    <span className="text-slate-400 font-mono">{track.solved} / {track.total} ({track.percentage}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${track.color} rounded-full`} style={{ width: `${track.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Badges & Achievements */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Unlocked Badges</span>
              </h2>
              <span className="text-xs text-amber-400 font-mono">4 / 12 Badges</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                  <div className="text-2xl">{b.icon}</div>
                  <div className="text-xs font-bold text-white">{b.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
