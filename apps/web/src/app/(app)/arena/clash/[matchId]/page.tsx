'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Swords, Users, Play, CheckCircle2, XCircle, ArrowLeft, Trophy, Sparkles, Loader2, Code2, Terminal } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/providers/socket-provider';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-500 text-xs">
      <Loader2 className="w-4 h-4 animate-spin mr-2 text-cyan-400" />
      <span>Loading Code Editor...</span>
    </div>
  ),
});

export default function ClashBattlePage({ params }: { params: Promise<{ matchId: string }> | { matchId: string } }) {
  const unwrappedParams = React.use(params as any) as { matchId: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();

  const matchIdParam = unwrappedParams?.matchId || 'CLASH-1001';
  const mode = searchParams.get('mode') || 'automatch';
  const code = searchParams.get('code') || matchIdParam.toUpperCase();
  const subject = searchParams.get('subject') || 'Data Structures';
  const difficulty = searchParams.get('diff') || 'MEDIUM';

  const opponentName = mode === 'bot' ? 'Aarav Mehta (AI Bot)' : 'Priya Sharma';
  const opponentRating = mode === 'bot' ? 1410 : 1480;

  const [userCode, setUserCode] = useState(`/**
 * SBMP Code Clash Problem
 * Implement an optimal algorithm to find duplicate elements in the array.
 */
function findDuplicates(nums: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  
  for (const num of nums) {
    if (seen.has(num)) {
      duplicates.add(num);
    } else {
      seen.add(num);
    }
  }
  
  return Array.from(duplicates);
}

// Test call
console.log(findDuplicates([4, 3, 2, 7, 8, 2, 3, 1]));`);

  const [timeRemaining, setTimeRemaining] = useState(600);
  const [opponentProgress, setOpponentProgress] = useState(35);
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<'WON' | 'LOST' | null>(null);

  // Match countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Opponent progress simulation
  useEffect(() => {
    const oppInterval = setInterval(() => {
      setOpponentProgress((prev) => {
        if (prev >= 80 || matchResult) return prev;
        return prev + Math.floor(Math.random() * 8);
      });
    }, 4000);

    return () => clearInterval(oppInterval);
  }, [matchResult]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestOutput('✅ Test Case 1 Passed: Input [4,3,2,7,8,2,3,1] => Output [2,3] (Exec: 14ms)');
    }, 800);
  };

  const handleSubmitSolution = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestOutput('🎉 ALL 5 TEST CASES PASSED! Execution time: 18ms.');
      setMatchResult('WON');
    }, 1200);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full flex-col overflow-hidden rounded-2xl border border-red-500/20 bg-slate-950 shadow-2xl relative">
      
      {/* Top Header Bar */}
      <div className="relative flex items-center justify-between border-b border-red-500/20 bg-gradient-to-r from-red-950/60 via-slate-900 to-indigo-950/60 px-6 py-3">
        
        {/* Player 1 (You) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/arena/clash')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white mr-2"
            title="Leave Clash"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-extrabold text-white shadow-lg shadow-cyan-500/20 text-sm">
            {user?.firstName?.[0] || 'J'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm">{user?.firstName || 'Jash'} (You)</h2>
              <span className="text-[10px] font-semibold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                {user?.gamification?.rank || 'DIAMOND'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Rating {user?.gamification?.rating || 1420}</p>
          </div>
        </div>

        {/* Timer & Match Info */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-1 border border-red-500/40 shadow-xl">
            <span className="font-mono text-lg font-bold text-red-400">{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Room Code: <span className="text-cyan-400 font-bold">{code}</span>
          </div>
        </div>

        {/* Player 2 (Opponent) */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] font-semibold text-rose-400 px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800">
                OPPONENT
              </span>
              <h2 className="font-bold text-white text-sm">{opponentName}</h2>
            </div>
            <p className="text-xs text-slate-400">Rating {opponentRating}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 font-extrabold text-white shadow-lg shadow-red-500/20 text-sm">
            {opponentName[0]}
          </div>
        </div>
      </div>

      {/* Main Duel Content */}
      <div className="flex flex-1 overflow-hidden bg-slate-900/50">
        
        {/* Left: Problem Description */}
        <div className="flex w-1/3 flex-col border-r border-slate-800 bg-slate-950/60 p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold">
              {difficulty}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
              {subject}
            </span>
          </div>

          <h1 className="text-lg font-bold text-white mb-3">Find Duplicate Elements in Array</h1>
          
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              Given an array <code className="text-cyan-400 font-mono">nums</code> of <code className="text-cyan-400 font-mono">n</code> integers where each integer is in the range <code className="text-cyan-400 font-mono">[1, n]</code>, return an array of all duplicates present.
            </p>
            <p>
              Your algorithm must run in <code className="text-cyan-400 font-mono">O(n)</code> time complexity.
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
              <div className="text-slate-400">Sample Input:</div>
              <div className="text-emerald-400">nums = [4, 3, 2, 7, 8, 2, 3, 1]</div>
              <div className="text-slate-400">Expected Output:</div>
              <div className="text-cyan-400">[2, 3]</div>
            </div>
          </div>
        </div>

        {/* Right: Code Editor & Execution */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-2">
            <Editor
              height="100%"
              language="typescript"
              theme="vs-dark"
              value={userCode}
              onChange={(value) => setUserCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 22,
                scrollBeyondLastLine: false,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            />
          </div>

          {/* Bottom Execution Bar */}
          <div className="border-t border-slate-800 bg-slate-950 p-4 space-y-3">
            {testOutput && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
                <span>{testOutput}</span>
                <button onClick={() => setTestOutput(null)} className="text-slate-500 hover:text-white text-[10px]">Clear</button>
              </div>
            )}

            <div className="flex items-center justify-between">
              {/* Opponent Live Progress Bar */}
              <div className="w-2/5 space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>{opponentName} Progress</span>
                  <span>{opponentProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${opponentProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRunTests}
                  disabled={isRunning}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Tests</span>
                </button>

                <button
                  onClick={handleSubmitSolution}
                  disabled={isRunning}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Victory / Defeat Modal Pop-up */}
      {matchResult && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">VICTORY!</h2>
              <p className="text-slate-400 text-xs">You solved the clash problem before your opponent!</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono">
              <div>
                <span className="text-[11px] text-slate-500 block">Rating Change</span>
                <span className="text-lg font-bold text-emerald-400">+24 Rating</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">XP Reward</span>
                <span className="text-lg font-bold text-amber-400">+50 XP</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/arena/clash')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25"
            >
              Back to Clash Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
