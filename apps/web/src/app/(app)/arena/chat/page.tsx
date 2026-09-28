'use client';

import React, { useState, useEffect } from 'react';
import { Search, Send, Code2, Users, Hash, Phone, Video, MoreVertical, Paperclip, Smile, Swords, CheckCheck, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/providers/socket-provider';

interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  type: 'DM' | 'ROOM' | 'CLASS';
  lastMessage: string;
  time: string;
  unread: number;
  isOnline?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  isCode?: boolean;
}

export default function GlobalChatPage() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [conversations, setConversations] = useState<ChatConversation[]>([
    { id: 'c1', name: 'Harsh Patel', avatar: 'H', type: 'DM', lastMessage: 'Ready for Code Clash speed duel?', time: '14:52', unread: 1, isOnline: true },
    { id: 'c2', name: 'DBMS Warriors', avatar: '⚔️', type: 'ROOM', lastMessage: 'Match starting in 5 mins...', time: '14:50', unread: 3 },
    { id: 'c3', name: 'Dhamik Shah', avatar: 'D', type: 'DM', lastMessage: 'Check this linked list solution', time: '12:30', unread: 0, isOnline: true },
    { id: 'c4', name: 'Web Dev Mastery', avatar: '🌐', type: 'ROOM', lastMessage: 'Can someone review my React code?', time: '10:15', unread: 0 },
    { id: 'c5', name: 'Prof. Sharma', avatar: 'S', type: 'DM', lastMessage: 'The syllabus has been updated.', time: 'Yesterday', unread: 0, isOnline: false },
  ]);

  const [activeConv, setActiveConv] = useState<ChatConversation>(conversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    c1: [
      { id: 'm1', sender: 'Harsh Patel', content: 'Hey Jash, you ready for the Code Clash duel?', time: '14:50', isMe: false },
      { id: 'm2', sender: 'Jash', content: 'Give me 2 mins, just finishing an Array problem on Arena.', time: '14:51', isMe: true },
      { id: 'm3', sender: 'Harsh Patel', content: 'Got it 👍 Send me the room code when ready!', time: '14:52', isMe: false },
    ],
    c2: [
      { id: 'm4', sender: 'Priya Sharma', content: 'Hey team, starting DBMS normalization review session.', time: '14:45', isMe: false },
      { id: 'm5', sender: 'Aarav Mehta', content: 'Count me in! What time?', time: '14:48', isMe: false },
    ],
  });

  // Listen for real-time messages via Socket
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data: any) => {
      if (data.conversationId) {
        const newMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: data.senderName || 'Peer',
          content: data.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        };
        setMessages((prev) => ({
          ...prev,
          [data.conversationId]: [...(prev[data.conversationId] || []), newMsg],
        }));
      }
    };

    socket.on('message:receive', handleReceive);
    return () => {
      socket.off('message:receive', handleReceive);
    };
  }, [socket]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: user ? user.firstName : 'Jash',
      content: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || []), newMsg],
    }));

    if (socket && isConnected) {
      socket.emit('message:send', {
        conversationId: activeConv.id,
        content: messageInput,
      });
    }

    setMessageInput('');
  };

  const currentMessages = messages[activeConv.id] || [];

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Left Column: Conversation List */}
      <div className="w-80 md:w-96 border-r border-slate-800 bg-slate-900/60 flex flex-col">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span>Nexus Messenger</span>
            </h1>
            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              SOCKET ACTIVE
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats, students & rooms..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations
            .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((c) => {
              const isActive = c.id === activeConv.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${
                    isActive ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-800/60' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                      {c.avatar}
                    </div>
                    {c.isOnline && (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                  </div>

                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* Right Column: Active Conversation Workspace */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 font-bold text-cyan-400 flex items-center justify-center text-sm">
              {activeConv.avatar}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{activeConv.name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {activeConv.type}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{activeConv.isOnline ? '🟢 Online now' : 'Last seen 2h ago'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors">
              <Swords className="w-4 h-4 text-rose-400" />
            </button>
            <button className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-lg ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                <span>{msg.sender}</span>
                <span>•</span>
                <span>{msg.time}</span>
              </div>
              <div
                className={`px-4.5 py-3 rounded-2xl text-xs leading-relaxed ${
                  msg.isMe
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center gap-3">
          <button
            type="button"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Share Code Snippet"
          >
            <Code2 className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message ${activeConv.name}...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
