"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Search, Users, Hash, BookOpen, Send, MoreVertical, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/providers/socket-provider';

type ChatTab = 'DIRECT' | 'ROOMS' | 'CLASSES';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline?: boolean;
}

const mockDirectChats: Conversation[] = [
  { id: '1', name: 'Harsh', avatar: 'H', lastMessage: 'Ready for Code Clash?', time: '14:52', unread: 1, isOnline: true },
  { id: '2', name: 'Dhamik', avatar: 'D', lastMessage: 'Check this linked list question', time: '12:30', unread: 0, isOnline: true },
  { id: '3', name: 'Prof. Sharma', avatar: 'S', lastMessage: 'The syllabus has been updated.', time: 'Yesterday', unread: 0, isOnline: false },
];

const mockRooms: Conversation[] = [
  { id: '4', name: 'DBMS Warriors', avatar: '⚔️', lastMessage: 'Match starting in 5 mins...', time: '14:50', unread: 3 },
  { id: '5', name: 'Web Dev Mastery', avatar: '🌐', lastMessage: 'Can someone review my React code?', time: '10:15', unread: 0 },
];

const mockClasses: Conversation[] = [
  { id: '6', name: 'SY BTECH CSE B', avatar: '🏫', lastMessage: 'Tomorrow\'s DBMS quiz is at 11 AM.', time: '09:00', unread: 5 },
];

const mockMessages = [
  { id: 'm1', sender: 'Harsh', content: 'Hey Jash, you ready for the Code Clash?', time: '14:50', isMe: false },
  { id: 'm2', sender: 'Jash', content: 'Give me 2 mins, finishing a Linked List problem.', time: '14:51', isMe: true },
  { id: 'm3', sender: 'Harsh', content: 'Got it 👍', time: '14:52', isMe: false },
];

export function NexusChatWidget() {
  const { socket, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('DIRECT');
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>(mockMessages);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceive = (data: any) => {
      if (activeChat && data.conversationId === activeChat.id) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.messageId,
            sender: data.senderId, // In real app, resolve name
            content: data.content,
            time: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false, // In real app, check if senderId == myId
          }
        ]);
      }
    };

    socket.on('message:receive', handleMessageReceive);

    return () => {
      socket.off('message:receive', handleMessageReceive);
    };
  }, [socket, activeChat]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat) return;

    // 1. Optimistic UI update
    const newMsg = {
      id: Math.random().toString(),
      sender: 'You',
      content: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    
    // 2. Send via socket
    if (socket && isConnected) {
      socket.emit('message:send', {
        conversationId: activeChat.id,
        content: messageText,
        type: 'TEXT'
      });
    }

    setMessageText('');
  };

  const getActiveList = () => {
    switch (activeTab) {
      case 'DIRECT': return mockDirectChats;
      case 'ROOMS': return mockRooms;
      case 'CLASSES': return mockClasses;
    }
  };

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
            {/* Notification Badge */}
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
              4
            </span>
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
            className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[85vh] w-[400px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 p-4 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                {activeChat ? (
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 transition-colors hover:bg-zinc-300/50 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-700/50"
                  >
                    ←
                  </button>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    {activeChat ? activeChat.name : 'Nexus Chat'}
                  </h3>
                  {activeChat && (
                    <span className="text-xs text-green-500">
                      {activeChat.isOnline ? 'Online' : 'Offline'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  <MoreVertical className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conversation View */}
            {activeChat ? (
              <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-900/30">
                {/* Messages List */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex w-full", msg.isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                        msg.isMe 
                          ? "rounded-tr-sm bg-blue-600 text-white" 
                          : "rounded-tl-sm bg-white border border-zinc-100 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                      )}>
                        {!msg.isMe && <span className="mb-1 block text-xs font-semibold text-blue-500">{msg.sender}</span>}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <span className={cn(
                          "mt-1 block text-right text-[10px]",
                          msg.isMe ? "text-blue-200" : "text-zinc-400"
                        )}>{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Code snippet example */}
                  {!activeChat.isOnline && activeChat.id === '1' && (
                    <div className="flex w-full justify-start mt-4">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-zinc-900 border border-zinc-800 p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400 text-xs font-medium">
                          <Code2 className="h-4 w-4" />
                          <span>ReverseLinkedList.cpp</span>
                        </div>
                        <pre className="text-xs text-zinc-300 font-mono overflow-x-auto">
                          <code>{`Node* reverse(Node* head) {\n  Node *prev = NULL, *curr = head;\n  while(curr) {\n    Node* next = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}`}</code>
                        </pre>
                        <button className="mt-3 w-full rounded bg-blue-600/20 py-1.5 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-600/30">
                          Open in Nexus Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center gap-2 rounded-xl bg-zinc-100 p-1 pr-2 dark:bg-zinc-900">
                    <button className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                      <Code2 className="h-5 w-5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent px-2 py-2 text-sm text-zinc-800 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-200"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && messageText.trim()) {
                          handleSendMessage();
                        }
                      }}
                    />
                    <button 
                      onClick={handleSendMessage}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        messageText.trim() 
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-500" 
                          : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Lists View */
              <div className="flex flex-1 flex-col">
                {/* Search */}
                <div className="p-4 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search messages, users, or rooms..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm text-zinc-800 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-blue-500 dark:focus:bg-zinc-950"
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-zinc-200 px-4 pb-3 dark:border-zinc-800">
                  <TabButton icon={<Users />} label="Direct" isActive={activeTab === 'DIRECT'} onClick={() => setActiveTab('DIRECT')} />
                  <TabButton icon={<Hash />} label="Rooms" isActive={activeTab === 'ROOMS'} onClick={() => setActiveTab('ROOMS')} />
                  <TabButton icon={<BookOpen />} label="Classes" isActive={activeTab === 'CLASSES'} onClick={() => setActiveTab('CLASSES')} />
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                  {getActiveList().map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat)}
                      className="flex cursor-pointer items-center gap-3 border-b border-zinc-100 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50"
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-lg font-bold text-blue-600 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-400">
                        {chat.avatar}
                        {chat.isOnline !== undefined && (
                          <span className={cn(
                            "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950",
                            chat.isOnline ? "bg-green-500" : "bg-zinc-400"
                          )} />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h4 className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{chat.name}</h4>
                          <span className="text-xs font-medium text-zinc-500">{chat.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                            {chat.lastMessage}
                          </p>
                          {chat.unread > 0 && (
                            <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Create New Action */}
                <div className="p-4 pt-2">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                    <MessageSquare className="h-4 w-4" />
                    New {activeTab === 'ROOMS' ? 'Room' : 'Message'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
        isActive 
          ? "text-blue-600 dark:text-blue-400" 
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      )}
    >
      <div className="[&>svg]:h-4 [&>svg]:w-4">{icon}</div>
      {label}
      {isActive && (
        <motion.div
          layoutId="activeChatTab"
          className="absolute -bottom-[13px] left-0 h-0.5 w-full bg-blue-600 dark:bg-blue-400"
        />
      )}
    </button>
  );
}
