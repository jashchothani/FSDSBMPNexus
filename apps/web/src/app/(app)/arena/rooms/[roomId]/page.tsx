'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Swords, MessageSquare, Code2, Lock, Globe, Play, Send, ShieldCheck, UserCheck, ArrowLeft, Loader2, Sparkles, Copy, Check } from 'lucide-react';
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
  senderAvatar?: string;
  content: string;
  time: string;
  isMe: boolean;
}

export default function RoomWorkspacePage({ params }: { params: Promise<{ roomId: string }> | { roomId: string } }) {
  const unwrappedParams = React.use(params as any) as { roomId: string };
  const roomId = unwrappedParams?.roomId || 'room-1';
  const router = useRouter();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [activeTab, setActiveTab] = useState<'CODE' | 'CHAT' | 'MEMBERS'>('CODE');
  const [code, setCode] = useState(`// Collaborative Room Workspace
// Subject: Data Structures & Algorithms (Sem 3)

function findMaxElement(arr: number[]): number {
  let maxVal = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > maxVal) {
      maxVal = arr[i];
    }
  }
  return maxVal;
}

console.log(findMaxElement([10, 20, 5, 40, 15]));`);

  const [language, setLanguage] = useState('typescript');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<RoomMessage[]>([
    { id: '1', senderName: 'Jash Chothani', content: 'Welcome to the Sem 3 DSA Study Room! Let\'s solve array questions first.', time: '14:20', isMe: true },
    { id: '2', senderName: 'Priya Sharma', content: 'I uploaded the two-pointers template to the shared editor.', time: '14:22', isMe: false },
    { id: '3', senderName: 'Aarav Mehta', content: 'Awesome! Ready for Code Clash whenever you start it.', time: '14:25', isMe: false },
  ]);

  const [copied, setCopied] = useState(false);
  const [clashStarted, setClashStarted] = useState(false);

  // Join room socket namespace
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('room:join', { roomId });
    }
  }, [socket, isConnected, roomId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg: RoomMessage = {
      id: Math.random().toString(),
      senderName: user ? `${user.firstName} ${user.lastName}` : 'You',
      content: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');

    if (socket && isConnected) {
      socket.emit('message:send', {
        conversationId: roomId,
        content: messageInput,
      });
    }
  };

  const handleStartRoomClash = () => {
    setClashStarted(true);
    const clashCode = `CLASH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMsg: RoomMessage = {
      id: Math.random().toString(),
      senderName: 'SYSTEM BOT',
      content: `⚔️ Code Clash started by ${user?.firstName || 'Jash'}! Match Code: ${clashCode}. Joining battle arena...`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: false,
    };
    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      router.push(`/arena/clash/${clashCode.toLowerCase()}?mode=room&code=${clashCode}`);
    }, 1500);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`http://localhost:3000/arena/rooms/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <h1 className="text-base font-bold text-white tracking-tight">Sem 3 — DSA Array & Linked List Sprint</h1>
              <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 flex items-center gap-1">
                <Globe className="w-3 h-3" /> PUBLIC ROOM
              </span>
            </div>
            <p className="text-xs text-slate-400">Host: Jash Chothani • 4 Active Members Online</p>
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

          <button
            onClick={handleStartRoomClash}
            disabled={clashStarted}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-red-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Swords className="w-4 h-4" />
            <span>{clashStarted ? 'Launching Clash...' : 'Start Room Clash'}</span>
          </button>
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
                <span>Room Chat ({messages.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('MEMBERS')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'MEMBERS' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Participants (4)</span>
              </button>
            </div>

            {activeTab === 'CODE' && (
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'CODE' && (
              <div className="h-full w-full p-2 bg-slate-950">
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineHeight: 22,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  }}
                />
              </div>
            )}

            {activeTab === 'CHAT' && (
              <div className="flex flex-col h-full bg-slate-950 p-4 space-y-4">
                <div className="flex-1 overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-md ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-300">{msg.senderName}</span>
                        <span>{msg.time}</span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs ${
                          msg.isMe
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type message to room members..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'MEMBERS' && (
              <div className="p-6 bg-slate-950 h-full overflow-y-auto space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Roster & Status</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: 'Jash Chothani', role: 'HOST', status: 'ONLINE', rating: 1420 },
                    { name: 'Priya Sharma', role: 'MEMBER', status: 'ONLINE', rating: 1580 },
                    { name: 'Aarav Mehta', role: 'MEMBER', status: 'ONLINE', rating: 1350 },
                    { name: 'Rohan Gupta', role: 'MEMBER', status: 'ONLINE', rating: 1290 },
                  ].map((m, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center text-xs">
                          {m.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{m.name}</span>
                            {m.role === 'HOST' && <span className="text-[9px] font-bold text-amber-400 px-1.5 py-0.5 bg-amber-950 border border-amber-800 rounded">HOST</span>}
                          </div>
                          <div className="text-[11px] text-slate-400">Rating {m.rating}</div>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> ONLINE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Quick Room Chat preview when on CODE tab */}
        {activeTab === 'CODE' && (
          <div className="w-80 border-l border-slate-800 bg-slate-950/80 hidden lg:flex flex-col">
            <div className="p-3 border-b border-slate-800 bg-slate-900/60 font-bold text-xs text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Live Room Chat</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="text-xs space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-slate-200">{msg.senderName}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{msg.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Send message..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
