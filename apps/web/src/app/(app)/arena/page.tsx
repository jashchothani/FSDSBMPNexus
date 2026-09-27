"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Code2, Swords, Users, Target, Zap, Clock, PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/providers/socket-provider';

export default function NexusArenaDashboard() {
  const router = useRouter();
  const { socket } = useSocket();
  const [isMatchmaking, setIsMatchmaking] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('match:found', (data: any) => {
      setTimeout(() => {
        router.push(`/arena/clash/${data.matchId}`);
      }, 1500);
    });

    return () => {
      socket.off('match:found');
    };
  }, [socket, router]);

  const handleQuickClash = () => {
    if (!socket) return;
    setIsMatchmaking(true);
    socket.emit('match:queue', { type: '1v1', rating: 1472 });
  };

  return (
    <div className="flex flex-col gap-8 pb-12 relative">
      
      {/* Matchmaking Overlay */}
      <AnimatePresence>
        {isMatchmaking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-6 rounded-3xl bg-slate-900 border border-slate-800 p-12 shadow-2xl">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                <Swords className="h-10 w-10 text-blue-500" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Searching for Opponent</h2>
                <p className="text-slate-400 font-medium">Estimated wait time: 0:15</p>
              </div>
              <button 
                onClick={() => setIsMatchmaking(false)}
                className="mt-4 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-4xl shadow-inner backdrop-blur-md border border-white/20">
              👋
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Good evening, Jash</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-300">
                <span className="flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-orange-400 border border-orange-500/30">
                  <Zap className="h-4 w-4" /> 12 Day Streak
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-400 border border-yellow-500/30">
                  <Trophy className="h-4 w-4" /> 8,420 XP
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-blue-400 border border-blue-500/30">
                  <Target className="h-4 w-4" /> Rating 1472
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 md:items-end">
            <button 
              onClick={handleQuickClash}
              className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-8 font-bold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:bg-blue-500 hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] active:scale-95"
            >
              <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </span>
              <Swords className="h-5 w-5" />
              QUICK CLASH
            </button>
            <p className="text-xs text-slate-400">Matchmaking with 1450-1500 rating</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* Continue Learning */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-500" /> Continue Learning
              </h2>
              <Link href="/arena/problems" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Practice My Semester
              </Link>
            </div>
            
            <div className="group flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Semester 3 • DSA</h3>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Linked Lists: Reversal &amp; Cycles
                  </p>
                </div>
              </div>
              <Link href="/arena/problem/NX-DS-034" className="hidden sm:block rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">
                Continue
              </Link>
            </div>
          </section>

          {/* Your Skills Map */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" /> Your Skill Map
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Data Structures', val: 92, color: 'bg-emerald-500' },
                { name: 'DBMS / SQL', val: 78, color: 'bg-blue-500' },
                { name: 'Java OOP', val: 61, color: 'bg-yellow-500' },
                { name: 'Web Dev', val: 42, color: 'bg-orange-500' },
              ].map((skill, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{skill.name}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{skill.val}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.val}%` }}
                      transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                      className={`h-full ${skill.color}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Daily Challenge */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" /> Daily Challenge
            </h2>
            <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-6 shadow-sm dark:border-orange-900/30 dark:from-orange-950/20 dark:to-slate-900">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                  Medium
                </span>
                <span className="text-xs font-medium text-slate-500">+150 XP</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Reverse a Linked List</h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Given the head of a singly linked list, reverse the list, and return the reversed list.</p>
              <Link href="/arena/problem/NX-DS-034" className="block w-full rounded-xl bg-slate-900 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                Solve Challenge
              </Link>
            </div>
          </section>

          {/* Active Rooms */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" /> Active Rooms
              </h2>
              <Link href="/arena/rooms" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { name: 'DBMS Warriors', mode: 'Study', count: 4, isClash: false },
                { name: 'Friday Night Code', mode: 'Code Clash', count: 12, isClash: true },
                { name: 'Exam Prep (DSA)', mode: 'Quiz', count: 32, isClash: false },
              ].map((room, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-purple-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{room.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span className={room.isClash ? "text-red-500" : "text-purple-500"}>{room.mode}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {room.count}</span>
                    </div>
                  </div>
                  <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    Join
                  </button>
                </div>
              ))}
              <Link href="/arena/rooms" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-300">
                + Create Room
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
