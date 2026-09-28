'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Swords, MessageSquare, Code2, Globe, ArrowLeft, Loader2, Copy, Check, Lock, UserCheck, ShieldCheck } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/providers/socket-provider';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-500 text-xs">
      <Loader2 className="w-4 h-4 animate-spin mr-2 text-cyan-400" />
      <span>Loading Room Shared Editor...</span>
    </div>
  ),
});

interface RoomMessage {
  id: string;
  senderName: string;
  content: string;
  time: string;
  isMe: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function RoomWorkspacePage({ params }: { params: Promise<{ roomId: string }> }) {
  const unwrappedParams = React.use(params);
  const roomId = unwrappedParams?.roomId;
  const router = useRouter();
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();

  const [activeTab, setActiveTab] = useState<'CODE' | 'CHAT' | 'MEMBERS'>('CODE');
  const [code, setCode] = useState(`// SBMP Nexus Room Shared Workspace\n// Write and test code together with room members\n\nfunction solution() {\n  console.log("Hello from Room!");\n}\n\nsolution();`);
  const [language, setLanguage] = useState('javascript');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [clashStarted, setClashStarted] = useState(false);

  const fetchRoomData = useCallback(async () => {
    if (!token || !roomId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/arena/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setRoomData(json.data);
      } else {
        setErrorMsg(json.error?.message || json.error || 'Failed to load room details');
      }
    } catch {
      setErrorMsg('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }, [token, roomId]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Join room socket room
  useEffect(() => {
    if (socket && isConnected && roomId) {
      socket.emit('room:join', { roomId });
    }
  }, [socket, isConnected, roomId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !token || !roomData?.conversationId) return;

    const txt = messageInput.trim();
    setMessageInput('');

    try {
      const res = await fetch(`${API_URL}/chat/conversations/${roomData.conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: txt }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: json.data.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
            content: txt,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
          },
        ]);
      }
    } catch {
      // Ignore
    }
  };

  const handleStartRoomClash = async () => {
    if (!token || !roomId) return;
    setClashStarted(true);

    try {
      const res = await fetch(`${API_URL}/arena/rooms/${roomId}/clash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ difficulty: 'MEDIUM' }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.matchId) {
        router.push(`/arena/clash/${json.data.matchId}`);
      } else {
        alert(json.error?.message || json.error || 'Failed to start clash');
        setClashStarted(false);
      }
    } catch {
      alert('Could not start clash');
      setClashStarted(false);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
        <span>Loading room workspace...</span>
      </div>
    );
  }

  if (errorMsg || !roomData) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-semibold text-rose-400 mb-4">{errorMsg || 'Room not found or access denied'}</p>
        <button onClick={() => router.push('/arena/rooms')} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white">
          Back to Rooms
        </button>
      </div>
    );
  }

  const hostName = typeof roomData.hostId === 'object' ? `${roomData.hostId?.firstName} ${roomData.hostId?.lastName}` : 'Host';
  const members = roomData.members || [];

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Top Room Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/arena/rooms')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">{roomData.name}</h1>
              <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 flex items-center gap-1 uppercase">
                <Globe className="w-3 h-3" /> {roomData.privacy}
              </span>
            </div>
            <p className="text-xs text-slate-400">Host: {hostName} • {members.length} Active Members Online</p>
          </div>
        </div>

        {/* Room Action Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyInvite}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link!' : 'Invite Members'}</span>
          </button>

          {['HOST', 'MODERATOR'].includes(roomData.myRole) && (
            <button
              onClick={handleStartRoomClash}
              disabled={clashStarted}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-red-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Swords className="w-4 h-4" />
              <span>{clashStarted ? 'Launching Clash...' : 'Start Room Clash'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left / Center Section based on Active Tab */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('CODE')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'CODE' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Shared Code Editor</span>
              </button>

              <button
                onClick={() => setActiveTab('CHAT')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'CHAT' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Room Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('MEMBERS')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'MEMBERS' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Members ({members.length})</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative bg-slate-950">
            {activeTab === 'CODE' && (
              <div className="h-full w-full">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                  }}
                />
              </div>
            )}

            {activeTab === 'CHAT' && (
              <div className="flex h-full flex-col justify-between p-4">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {messages.map((m, idx) => (
                    <div key={m.id || idx} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-500 mb-1">{m.senderName} • {m.time}</span>
                      <div className={`rounded-xl px-3.5 py-2 text-xs max-w-[80%] ${m.isMe ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Type message in room chat..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500">
                    Send
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'MEMBERS' && (
              <div className="p-6 overflow-y-auto max-w-2xl mx-auto space-y-3">
                <h3 className="text-sm font-bold text-white mb-4">Active Room Members</h3>
                {members.map((m: any) => (
                  <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                        {m.userId?.firstName?.[0] || 'M'}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white">{m.userId?.firstName} {m.userId?.lastName}</span>
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{m.role}</span>
                      </div>
                    </div>
                    <span className="text-xs text-amber-400 font-mono font-semibold">Rating: {m.userId?.gamification?.rating || 1200}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
