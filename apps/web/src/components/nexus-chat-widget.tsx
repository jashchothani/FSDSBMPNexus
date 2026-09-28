"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Search, Users, Hash, Send, MoreVertical, LogIn } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSocket } from '@/providers/socket-provider';
import { useAuth } from '@/lib/auth-context';

type ChatTab = 'DIRECT' | 'ROOMS' | 'CLASSES';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt?: string;
  unreadCount: number;
  isGroup?: boolean;
  type?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function NexusChatWidget() {
  const { socket, isConnected } = useSocket();
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('DIRECT');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch real conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setConversations(json.data || []);
      }
    } catch {
      // Ignore network errors
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && token) {
      fetchConversations();
    }
  }, [isOpen, token, fetchConversations]);

  // Fetch message history when activeChat changes
  useEffect(() => {
    if (!activeChat || !token) return;
    fetch(`${API_URL}/chat/conversations/${activeChat.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.messages) {
          setMessages(json.data.messages);
          // Mark conversation as read
          fetch(`${API_URL}/chat/conversations/${activeChat.id}/read`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [activeChat, token]);

  // Listen for incoming realtime messages
  useEffect(() => {
    if (!socket) return;

    const handleMessageNew = (data: any) => {
      if (activeChat && data.conversationId === activeChat.id) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            senderId: data.senderId,
            senderName: data.senderName,
            content: data.content,
            createdAt: data.createdAt,
            isMe: data.senderId === user?.id,
          },
        ]);
      }
      fetchConversations();
    };

    socket.on('message:new', handleMessageNew);

    return () => {
      socket.off('message:new', handleMessageNew);
    };
  }, [socket, activeChat, user, fetchConversations]);

  // User search logic
  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim() || !token) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/chat/users/search?q=${encodeURIComponent(q.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setSearchResults(json.data || []);
    } catch {
      setSearchResults([]);
    }
  };

  const startDM = async (targetUserId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'DM', userId: targetUserId }),
      });
      const json = await res.json();
      if (json.success) {
        setSearchQuery('');
        setSearchResults([]);
        await fetchConversations();
        setActiveChat({ id: json.data.id, name: json.data.name || 'DM', unreadCount: 0, lastMessage: '' });
      }
    } catch {
      // Ignore
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChat || !token) return;
    const txt = messageText.trim();
    setMessageText('');

    try {
      const res = await fetch(`${API_URL}/chat/conversations/${activeChat.id}/messages`, {
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
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
            content: txt,
            createdAt: new Date().toISOString(),
            isMe: true,
          },
        ]);
        fetchConversations();
      }
    } catch {
      // Ignore
    }
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const filteredConvs = conversations.filter((c) => {
    if (activeTab === 'DIRECT') return !c.isGroup && c.type !== 'ROOM';
    if (activeTab === 'ROOMS') return c.type === 'ROOM';
    if (activeTab === 'CLASSES') return c.isGroup && c.type !== 'ROOM';
    return true;
  });

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-500"
          >
            <MessageSquare className="h-6 w-6" />
            {totalUnread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {totalUnread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[85vh] w-[400px] flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-blue-100/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-blue-50 bg-blue-50/30 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {activeChat ? (
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-50"
                  >
                    ←
                  </button>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {activeChat ? activeChat.name : 'Nexus Chat'}
                  </h3>
                  {activeChat && (
                    <span className="text-xs text-green-500">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!user ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 mb-3">
                  <LogIn className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">Authentication Required</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Please sign in to access real-time messaging, study group chats, and arena challenges.
                </p>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : activeChat ? (
              /* Chat View */
              <div className="flex flex-1 flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => {
                    const isMe = m.senderId === user.id || m.isMe;
                    return (
                      <div
                        key={m.id || i}
                        className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
                      >
                        {!isMe && (
                          <span className="text-[10px] text-slate-400 mb-1 font-medium">
                            {m.senderName || 'Peer'}
                          </span>
                        )}
                        <div
                          className={cn(
                            "rounded-2xl px-3.5 py-2 text-xs leading-relaxed",
                            isMe
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-slate-100 text-slate-800 rounded-bl-none"
                          )}
                        >
                          {m.content}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1">
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Conversation List View */
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Search & Tabs */}
                <div className="p-3 border-b border-slate-100 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users or chats..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-lg space-y-1 max-h-40 overflow-y-auto">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Users</span>
                      {searchResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => startDM(u.id)}
                          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50 text-left transition-colors"
                        >
                          <span className="text-xs font-medium text-slate-800">{u.firstName} {u.lastName}</span>
                          <span className="text-[10px] text-blue-500 font-semibold uppercase">Chat</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                    <button
                      onClick={() => setActiveTab('DIRECT')}
                      className={cn(
                        "rounded-lg py-1 text-xs font-medium transition-colors",
                        activeTab === 'DIRECT'
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-blue-600"
                      )}
                    >
                      Direct
                    </button>
                    <button
                      onClick={() => setActiveTab('ROOMS')}
                      className={cn(
                        "rounded-lg py-1 text-xs font-medium transition-colors",
                        activeTab === 'ROOMS'
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-blue-600"
                      )}
                    >
                      Rooms
                    </button>
                    <button
                      onClick={() => setActiveTab('CLASSES')}
                      className={cn(
                        "rounded-lg py-1 text-xs font-medium transition-colors",
                        activeTab === 'CLASSES'
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-blue-600"
                      )}
                    >
                      Groups
                    </button>
                  </div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
                  {filteredConvs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <Users className="h-8 w-8 mb-2 stroke-1" />
                      <p className="text-xs font-medium">No conversations found</p>
                      <p className="text-[10px] text-slate-400 mt-1">Search for peers above to start messaging!</p>
                    </div>
                  ) : (
                    filteredConvs.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveChat(c)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-xs border border-blue-200">
                          {c.avatar || c.name?.[0] || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {c.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {c.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        {c.unreadCount > 0 && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                            {c.unreadCount}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
