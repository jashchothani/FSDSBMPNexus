"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Code2, Trophy, Zap, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

const MOCK_PROBLEMS = [
  { problemId: 'NX-DS-001', title: 'Find Maximum Element', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', marks: 4, solveCount: 342, attemptCount: 450 },
  { problemId: 'NX-DS-002', title: 'Reverse an Array', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', marks: 4, solveCount: 289, attemptCount: 340 },
  { problemId: 'NX-DS-003', title: 'Two Sum', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', marks: 6, solveCount: 512, attemptCount: 780 },
  { problemId: 'NX-DS-004', title: 'Find Duplicate Elements', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Arrays', marks: 6, solveCount: 156, attemptCount: 320 },
  { problemId: 'NX-DS-005', title: 'Kadane\'s Algorithm', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Arrays', marks: 8, solveCount: 98, attemptCount: 240 },
  { problemId: 'NX-DS-034', title: 'Reverse Linked List', difficulty: 'EASY', subject: 'Data Structures', topic: 'Linked List', marks: 6, solveCount: 445, attemptCount: 600 },
  { problemId: 'NX-DS-035', title: 'Detect Cycle in Linked List', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Linked List', marks: 8, solveCount: 134, attemptCount: 310 },
  { problemId: 'NX-DS-050', title: 'Implement Stack using Array', difficulty: 'EASY', subject: 'Data Structures', topic: 'Stack', marks: 6, solveCount: 367, attemptCount: 420 },
  { problemId: 'NX-DS-051', title: 'Valid Parentheses', difficulty: 'EASY', subject: 'Data Structures', topic: 'Stack', marks: 6, solveCount: 478, attemptCount: 590 },
  { problemId: 'NX-DS-052', title: 'Infix to Postfix', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Stack', marks: 8, solveCount: 89, attemptCount: 210 },
  { problemId: 'NX-DS-070', title: 'Binary Tree Inorder Traversal', difficulty: 'EASY', subject: 'Data Structures', topic: 'Trees', marks: 6, solveCount: 234, attemptCount: 300 },
  { problemId: 'NX-DS-080', title: 'BFS Traversal', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Graphs', marks: 8, solveCount: 67, attemptCount: 180 },
  { problemId: 'NX-DB-001', title: 'Select All Records', difficulty: 'EASY', subject: 'DBMS', topic: 'SQL', marks: 4, solveCount: 520, attemptCount: 560 },
  { problemId: 'NX-DB-003', title: 'GROUP BY with COUNT', difficulty: 'MEDIUM', subject: 'DBMS', topic: 'SQL', marks: 6, solveCount: 198, attemptCount: 320 },
  { problemId: 'NX-DB-004', title: 'JOIN Two Tables', difficulty: 'MEDIUM', subject: 'DBMS', topic: 'SQL', marks: 8, solveCount: 145, attemptCount: 290 },
  { problemId: 'NX-JV-001', title: 'Create a Class', difficulty: 'EASY', subject: 'Java', topic: 'OOP', marks: 4, solveCount: 410, attemptCount: 450 },
  { problemId: 'NX-JV-003', title: 'Exception Handling', difficulty: 'MEDIUM', subject: 'Java', topic: 'Exception Handling', marks: 6, solveCount: 187, attemptCount: 280 },
  { problemId: 'NX-WD-002', title: 'Build a REST API', difficulty: 'MEDIUM', subject: 'Web Development', topic: 'REST', marks: 8, solveCount: 112, attemptCount: 210 },
  { problemId: 'NX-WD-003', title: 'JWT Authentication', difficulty: 'HARD', subject: 'Web Development', topic: 'Authentication', marks: 10, solveCount: 34, attemptCount: 150 },
  { problemId: 'NX-DS-084', title: 'Topological Sort', difficulty: 'HARD', subject: 'Data Structures', topic: 'Graphs', marks: 10, solveCount: 23, attemptCount: 120 },
];

const SUBJECTS = ['All', 'Data Structures', 'DBMS', 'Java', 'Web Development'];
const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD'];

const difficultyConfig: Record<string, { color: string, bg: string }> = {
  EASY: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  MEDIUM: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  HARD: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function ProblemsListPage() {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const filtered = MOCK_PROBLEMS.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedSubject !== 'All' && p.subject !== selectedSubject) return false;
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Code2 className="h-8 w-8 text-blue-500" /> Nexus Code
          </h1>
          <p className="mt-1 text-sm text-slate-400">Practice problems mapped to your semester curriculum</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 font-bold text-emerald-400">{MOCK_PROBLEMS.length} Problems</span>
          <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 font-bold text-blue-400">Semester 3</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                selectedSubject === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                selectedDifficulty === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {d === 'All' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-slate-800 bg-slate-900/80 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-1">Status</div>
          <div className="col-span-5">Problem</div>
          <div className="col-span-2">Topic</div>
          <div className="col-span-1">Difficulty</div>
          <div className="col-span-1">Marks</div>
          <div className="col-span-2">Acceptance</div>
        </div>

        {/* Problem Rows */}
        {filtered.map((problem, i) => {
          const dc = difficultyConfig[problem.difficulty];
          const acceptance = Math.round((problem.solveCount / problem.attemptCount) * 100);
          return (
            <motion.div
              key={problem.problemId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link
                href={`/arena/problem/${problem.problemId}`}
                className="grid grid-cols-12 gap-4 border-b border-slate-800/50 px-6 py-4 text-sm transition-colors hover:bg-slate-800/30 group"
              >
                <div className="col-span-1 flex items-center">
                  <div className="h-4 w-4 rounded-full border-2 border-slate-700" />
                </div>
                <div className="col-span-5 flex flex-col">
                  <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">{problem.title}</span>
                  <span className="text-xs text-slate-500">{problem.problemId} • {problem.subject}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">{problem.topic}</span>
                </div>
                <div className="col-span-1 flex items-center">
                  <span className={`rounded border px-2 py-0.5 text-xs font-bold ${dc.bg} ${dc.color}`}>
                    {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="col-span-1 flex items-center text-slate-400 font-medium">
                  {problem.marks}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-emerald-500" style={{ width: `${acceptance}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{acceptance}%</span>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <BookOpen className="h-12 w-12 mb-4 opacity-50" />
            <p className="font-semibold">No problems found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
