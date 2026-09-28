'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Users, Sparkles, Copy, Check, Bot, Zap, ArrowRight, ShieldAlert, Code2, Play, Trophy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/providers/socket-provider';

export default function CodeClashLobbyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [activeTab, setActiveTab] = useState<'AUTOMATCH' | 'CREATE_ROOM' | 'JOIN_CODE'>('AUTOMATCH');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);

  // Options for room creation
  const [subject, setSubject] = useState('Data Structures');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [timeLimit, setTimeLimit] = useState('10');

  // Generate a random 6-character room code
  const handleGenerateRoomCode = () => {
    const code = 'CLASH-' + Math.floor(1000 + Math.random() * 9000);
    setCreatedRoomCode(code);
  };

  useEffect(() => {
    handleGenerateRoomCode();
  }, []);

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Automatch counter & 3-second fallback to instant match vs AI Bot / Peer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTimer(0);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  // Handle 3-second auto-pairing logic
  useEffect(() => {
    if (isSearching && searchTimer >= 3) {
      setIsSearching(false);
      // Generate instant battle match ID and redirect to battle screen
      const matchId = 'clash-' + Math.floor(10000 + Math.random() * 90000);
      router.push(`/arena/clash/${matchId}?mode=bot&subject=${encodeURIComponent(subject)}&diff=${difficulty}`);
    }
  }, [isSearching, searchTimer, subject, difficulty, router]);

  const handleStartSearching = () => {
    setIsSearching(true);
    if (socket && isConnected) {
      socket.emit('match:queue', {
        type: '1V1_SPEED',
        rating: user?.gamification?.rating || 1420,
      });
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    const cleanCode = roomCodeInput.trim().toUpperCase();
    const matchId = `clash-${cleanCode.replace('CLASH-', '')}`;
    router.push(`/arena/clash/${matchId}?mode=room&code=${cleanCode}`);
  };

  const handleStartCustomRoomMatch = () => {
    if (!createdRoomCode) return;
    const matchId = `clash-${createdRoomCode.replace('CLASH-', '')}`;
    router.push(`/arena/clash/${matchId}?mode=host&code=${createdRoomCode}&subject=${encodeURIComponent(subject)}&diff=${difficulty}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950/80 border border-red-500/20 p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              <Swords className="w-3.5 h-3.5" />
              <span>SBMP 1v1 Speed Coding Arena</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Code Clash 2.0</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Compete head-to-head in real-time speed coding battles based on MSBTE semester curriculum. Create custom private rooms or auto-pair instantly vs classmates & AI bots.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="text-center px-4 border-r border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Your Rating</div>
              <div className="text-xl font-bold text-amber-400 font-mono">{user?.gamification?.rating || 1420}</div>
            </div>
            <div className="text-center px-4">
              <div className="text-xs text-slate-400 font-medium">Tier Rank</div>
              <div className="text-xl font-bold text-cyan-400 font-mono">{user?.gamification?.rank || 'DIAMOND'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Selection */}
      <div className="flex justify-center border-b border-slate-800 pb-2">
        <div className="flex bg-slate-900/90 border border-slate-800/80 p-1.5 rounded-2xl gap-2 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('AUTOMATCH')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'AUTOMATCH'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Instant Quick Match</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATE_ROOM')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'CREATE_ROOM'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Create Room Code</span>
          </button>

          <button
            onClick={() => setActiveTab('JOIN_CODE')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'JOIN_CODE'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Join with Room Code</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: AUTOMATCH */}
      {activeTab === 'AUTOMATCH' && (
        <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-md">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Automatch Speed Battle</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Find an available online SBMP student or test your skills against the AI Tutor Bot. Matches are 10 minutes long with 1 competitive problem.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Select Target Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="Data Structures">Sem 2/3 — Data Structures & Algorithms</option>
                <option value="Object Oriented Programming">Sem 3 — Object Oriented Programming (C++)</option>
                <option value="Java Programming">Sem 3/4 — Advanced Java Programming</option>
                <option value="Python Scripting">Sem 1/2 — Python Programming Basics</option>
                <option value="Database Management Systems">Sem 4 — DBMS & SQL Queries</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      difficulty === diff
                        ? 'bg-red-500/20 border-red-500 text-red-300 shadow-md shadow-red-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {!isSearching ? (
              <button
                onClick={handleStartSearching}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
              >
                <Swords className="w-5 h-5 animate-pulse" />
                <span>Find Match Now</span>
              </button>
            ) : (
              <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-red-500/20 text-red-400 animate-spin">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Searching for Opponent...</h3>
                  <p className="text-xs text-slate-400 mt-1">Connecting to live SBMP queue ({searchTimer}s)</p>
                </div>
                <div className="text-[11px] text-cyan-400 font-mono">
                  ⚡ Auto-pairing with AI Opponent Bot in {Math.max(0, 3 - searchTimer)}s...
                </div>
                <button
                  onClick={() => setIsSearching(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white"
                >
                  Cancel Matchmaking
                </button>
              </div>
            )}
          </div>

          {/* Right Visual Card */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Clash Rules</span>
              <span className="text-xs text-cyan-400 font-mono">+50 XP Victory Bonus</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">1</span>
                <span>Both players get the exact same semester curriculum problem.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">2</span>
                <span>First player to pass all hidden test cases wins the match.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">3</span>
                <span>Live opponent progress bar shows test case pass ratio.</span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">Solo Practice Mode</div>
                  <div className="text-[11px] text-slate-400">Instant AI Bot matchmaking active</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">READY</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: CREATE_ROOM */}
      {activeTab === 'CREATE_ROOM' && (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-md max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">Create Private Clash Room</h2>
            <p className="text-xs text-slate-400">Generate a unique Room Code and invite your friends or lab partners to duel</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 text-center space-y-4 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Your Room Invite Code</span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-extrabold text-cyan-400 tracking-wider bg-slate-900 px-6 py-2 rounded-xl border border-cyan-500/40">
                {createdRoomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && <p className="text-xs text-emerald-400 font-medium">Copied to clipboard!</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Subject Track</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Data Structures">Data Structures & Algorithms</option>
                <option value="Object Oriented Programming">OOP C++</option>
                <option value="Java Programming">Java Web</option>
                <option value="Python Scripting">Python Basics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Match Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="EASY">Easy (4 Marks)</option>
                <option value="MEDIUM">Medium (6 Marks)</option>
                <option value="HARD">Hard (8 Marks)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartCustomRoomMatch}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-transform"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Room Match</span>
          </button>
        </div>
      )}

      {/* Tab Content 3: JOIN_CODE */}
      {activeTab === 'JOIN_CODE' && (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-md max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">Join Private Room Code</h2>
            <p className="text-xs text-slate-400">Enter the 6-character room code shared by your friend</p>
          </div>

          <form onSubmit={handleJoinByCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">Room Code</label>
              <input
                type="text"
                required
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                placeholder="CLASH-8921"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-center font-mono text-2xl font-bold text-cyan-400 placeholder:text-slate-700 uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform"
            >
              <span>Enter Battle Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
