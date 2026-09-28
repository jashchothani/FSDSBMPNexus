'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ClashBattlePage({ params }: { params: Promise<{ matchId: string }> }) {
  const unwrappedParams = React.use(params);
  const matchId = unwrappedParams?.matchId;
  const router = useRouter();
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [matchData, setMatchData] = useState<any>(null);
  const [userCode, setUserCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMatch = useCallback(async () => {
    if (!token || !matchId) return;
    try {
      const res = await fetch(`${API_URL}/arena/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMatchData(json.data);
        if (json.data.problem?.starterCode?.[language]) {
          setUserCode(json.data.problem.starterCode[language]);
        } else if (!userCode) {
          setUserCode('# Write your solution here\nimport sys\n\nfor line in sys.stdin:\n    # process input\n    pass\n');
        }
      } else {
        setErrorMsg(json.error?.message || json.error || 'Failed to load match');
      }
    } catch {
      setErrorMsg('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }, [token, matchId, language, userCode]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  // Handle countdown timer based on server endsAt / startedAt
  useEffect(() => {
    if (!matchData?.endsAt) return;

    const interval = setInterval(() => {
      const ends = new Date(matchData.endsAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((ends - now) / 1000));
      setTimeRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        fetchMatch();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [matchData?.endsAt, fetchMatch]);

  // Realtime Socket listeners for match events
  useEffect(() => {
    if (!socket) return;

    const handleMatchStart = () => fetchMatch();
    const handleMatchProgress = () => fetchMatch();
    const handleMatchEnd = () => fetchMatch();
    const handleMatchCancelled = () => fetchMatch();

    socket.on('match:start', handleMatchStart);
    socket.on('match:opponent-progress', handleMatchProgress);
    socket.on('match:end', handleMatchEnd);
    socket.on('match:cancelled', handleMatchCancelled);

    return () => {
      socket.off('match:start', handleMatchStart);
      socket.off('match:opponent-progress', handleMatchProgress);
      socket.off('match:end', handleMatchEnd);
      socket.off('match:cancelled', handleMatchCancelled);
    };
  }, [socket, fetchMatch]);

  const handleRespond = async (accept: boolean) => {
    if (!token || !matchId) return;
    try {
      await fetch(`${API_URL}/arena/matches/${matchId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accept }),
      });
      fetchMatch();
    } catch {
      // Ignore
    }
  };

  const handleReady = async () => {
    if (!token || !matchId) return;
    try {
      await fetch(`${API_URL}/arena/matches/${matchId}/ready`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMatch();
    } catch {
      // Ignore
    }
  };

  const handleRunTests = async () => {
    if (!token || !matchData?.problem?.problemId || !userCode.trim()) return;
    setIsRunning(true);
    setTestOutput(null);

    try {
      const res = await fetch(`${API_URL}/arena/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          problemId: matchData.problem.problemId,
          code: userCode,
          language,
          isSubmit: false,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTestOutput(json.data.output || `Status: ${json.data.status} (${json.data.passedCount}/${json.data.totalCount} tests passed)`);
      } else {
        setTestOutput(`Error: ${json.error?.message || json.error || 'Execution failed'}`);
      }
    } catch {
      setTestOutput('Error: Could not connect to judge execution service.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!token || !matchId || !userCode.trim()) return;
    setIsSubmitting(true);
    setTestOutput(null);

    try {
      const res = await fetch(`${API_URL}/arena/matches/${matchId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: userCode, language }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTestOutput(`Submission result: ${json.data.status} (${json.data.passedCount}/${json.data.totalCount} tests passed)`);
        fetchMatch();
      } else {
        setTestOutput(`Error: ${json.error?.message || json.error || 'Submission failed'}`);
      }
    } catch {
      setTestOutput('Error: Could not submit solution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
        <span>Loading Code Clash Arena...</span>
      </div>
    );
  }

  if (errorMsg || !matchData) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-semibold text-rose-400 mb-4">{errorMsg || 'Match not found'}</p>
        <button onClick={() => router.push('/arena')} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white">
          Back to Arena
        </button>
      </div>
    );
  }

  const me = matchData.players.find((p: any) => p.userId === user?.id) || matchData.players[0];
  const opponent = matchData.players.find((p: any) => p.userId !== user?.id) || matchData.players[1];

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full flex-col overflow-hidden rounded-2xl border border-red-500/20 bg-slate-950 shadow-2xl relative">
      
      {/* Top Header Bar */}
      <div className="relative flex items-center justify-between border-b border-red-500/20 bg-gradient-to-r from-red-950/60 via-slate-900 to-indigo-950/60 px-6 py-3">
        
        {/* Player 1 (You) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/arena')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white mr-2"
            title="Leave Clash"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-extrabold text-white shadow-lg shadow-cyan-500/20 text-sm">
            {me?.name?.[0] || 'Y'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm">{me?.name || 'You'} (You)</h2>
              <span className="text-[10px] font-semibold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                {me?.passedCount || 0}/{me?.totalCount || 0} Passed
              </span>
            </div>
            <p className="text-xs text-slate-400">Rating {me?.rating || 1200}</p>
          </div>
        </div>

        {/* Timer & Match Status */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-1 border border-red-500/40 shadow-xl">
            <span className="font-mono text-lg font-bold text-red-400">{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">
            Status: <span className="text-cyan-400 font-bold">{matchData.status}</span>
          </div>
        </div>

        {/* Player 2 (Opponent) */}
        {opponent && (
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-[10px] font-semibold text-rose-400 px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800">
                  {opponent.passedCount || 0}/{opponent.totalCount || 0} PASSED
                </span>
                <h2 className="font-bold text-white text-sm">{opponent.name}</h2>
              </div>
              <p className="text-xs text-slate-400">Rating {opponent.rating}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 font-extrabold text-white shadow-lg shadow-red-500/20 text-sm">
              {opponent.name?.[0] || 'O'}
            </div>
          </div>
        )}
      </div>

      {/* Match States */}
      {matchData.status === 'INVITED' ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Code Clash Challenge</h2>
          <p className="text-xs text-slate-400 mb-6">You have been challenged to a Code Clash!</p>
          <div className="flex gap-4">
            <button onClick={() => handleRespond(false)} className="px-6 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-bold hover:bg-slate-700">
              Decline
            </button>
            <button onClick={() => handleRespond(true)} className="px-6 py-2.5 rounded-xl bg-blue-600 text-xs text-white font-bold hover:bg-blue-500">
              Accept Challenge
            </button>
          </div>
        </div>
      ) : matchData.status === 'WAITING' ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Clash Lobby</h2>
          <p className="text-xs text-slate-400 mb-6">Click ready when you are prepared to begin the countdown.</p>
          <button
            onClick={handleReady}
            className={`px-8 py-3 rounded-2xl text-sm font-extrabold shadow-lg transition-all ${
              me?.isReady
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
            }`}
          >
            {me?.isReady ? '✓ You Are Ready (Waiting for Opponent)' : 'I Am Ready!'}
          </button>
        </div>
      ) : (
        /* Main Duel Content */
        <div className="flex flex-1 overflow-hidden bg-slate-900/50">
          
          {/* Left: Problem Description */}
          <div className="flex w-1/3 flex-col border-r border-slate-800 bg-slate-950/60 p-6 overflow-y-auto">
            {matchData.problem ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase">
                    {matchData.problem.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                    {matchData.problem.subject}
                  </span>
                </div>

                <h1 className="text-xl font-extrabold text-white mb-4">{matchData.problem.title}</h1>
                <div className="prose prose-invert prose-xs text-slate-300 space-y-4">
                  <p className="whitespace-pre-line">{matchData.problem.description}</p>

                  {matchData.problem.testCases && matchData.problem.testCases.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sample Test Case</h4>
                      <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono text-[11px] space-y-2">
                        <div>
                          <span className="text-slate-500">Input:</span>
                          <pre className="text-cyan-400 mt-1">{matchData.problem.testCases[0].input}</pre>
                        </div>
                        <div>
                          <span className="text-slate-500">Expected Output:</span>
                          <pre className="text-emerald-400 mt-1">{matchData.problem.testCases[0].expectedOutput}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs text-slate-500">
                Problem details loading or hidden until match starts...
              </div>
            )}
          </div>

          {/* Right: Code Editor & Console Output */}
          <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/40 px-4 py-2">
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunTests}
                  disabled={isRunning || matchData.status === 'FINISHED'}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-200" />
                  <span>{isRunning ? 'Running...' : 'Run Samples'}</span>
                </button>

                <button
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting || matchData.status === 'FINISHED'}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Code'}</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                value={userCode}
                onChange={(val) => setUserCode(val || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  readOnly: matchData.status === 'FINISHED',
                }}
              />
            </div>

            {/* Console Output */}
            {testOutput && (
              <div className="border-t border-slate-800 bg-slate-900/90 p-3 max-h-36 overflow-y-auto font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Test Output:</span>
                </div>
                <pre className="text-slate-200 whitespace-pre-line">{testOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Result Overlay */}
      {matchData.status === 'FINISHED' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
          <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl space-y-4">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-extrabold text-white">
              {matchData.winnerId === user?.id ? 'VICTORY!' : 'MATCH FINISHED'}
            </h2>
            <p className="text-xs text-slate-300">
              {matchData.winnerId === user?.id
                ? 'Congratulations! You solved the problem first and earned XP and Rating!'
                : `Match ended. Reason: ${matchData.endReason || 'Completed'}`}
            </p>

            <button
              onClick={() => router.push('/arena')}
              className="mt-4 w-full py-3 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              Return to Arena
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
