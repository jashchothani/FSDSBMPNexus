"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Lock, Globe, GraduationCap, Code2, Swords, Brain, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface Room {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  type: 'STUDY' | 'CODING' | 'CLASH' | 'QUIZ' | 'CUSTOM';
  privacy: 'PUBLIC' | 'CLASS_ONLY' | 'PRIVATE';
  hostId?: any;
  memberCount: number;
  maxParticipants: number;
  status: string;
  isMember?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  STUDY: { icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  CODING: { icon: Code2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  CLASH: { icon: Swords, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  QUIZ: { icon: Brain, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  CUSTOM: { icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
};

const privacyIcons: Record<string, any> = { PUBLIC: Globe, CLASS_ONLY: GraduationCap, PRIVATE: Lock };

export default function RoomsPage() {
  const { token, user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'STUDY' | 'CODING' | 'CLASH' | 'QUIZ' | 'CUSTOM'>('STUDY');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'CLASS_ONLY' | 'PRIVATE'>('PUBLIC');
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/arena/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setRooms(json.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreateError('');
    setIsCreating(true);

    try {
      const res = await fetch(`${API_URL}/arena/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, type, privacy, maxParticipants }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setShowCreate(false);
        setName('');
        setDescription('');
        fetchRooms();
      } else {
        setCreateError(json.error?.message || json.error || 'Failed to create room');
      }
    } catch {
      setCreateError('Could not connect to server');
    } finally {
      setIsCreating(false);
    }
  };

  const filtered = rooms.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'All' && r.type !== filterType) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" /> Nexus Rooms
          </h1>
          <p className="mt-1 text-sm text-slate-400">Join a room to study, code, or compete together</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'STUDY', 'CODING', 'CLASH', 'QUIZ'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                filterType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading rooms...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs">No active rooms found matching filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room) => {
            const roomId = room._id || room.id;
            const Config = typeConfig[room.type] || typeConfig.STUDY;
            const Icon = Config.icon;
            const PrivacyIcon = privacyIcons[room.privacy] || Globe;
            const hostName = typeof room.hostId === 'object' ? `${room.hostId?.firstName ?? ''} ${room.hostId?.lastName ?? ''}` : 'Host';

            return (
              <Link
                key={roomId}
                href={`/arena/rooms/${roomId}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${Config.bg} ${Config.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {room.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <PrivacyIcon className="h-3.5 w-3.5" />
                      {room.privacy}
                    </span>
                  </div>

                  <h3 className="mt-3 font-bold text-white group-hover:text-blue-400 transition-colors">
                    {room.name}
                  </h3>
                  {room.description && (
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">{room.description}</p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs text-slate-400">
                  <span>Host: {hostName || 'Host'}</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {room.memberCount}/{room.maxParticipants} Members
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-white text-base">Create New Room</h3>
                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Room Name</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. DBMS Exam Prep"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary of room activities..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                    <select
                      value={type}
                      onChange={(e: any) => setType(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="STUDY">Study</option>
                      <option value="CODING">Coding</option>
                      <option value="CLASH">Code Clash</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Privacy</label>
                    <select
                      value={privacy}
                      onChange={(e: any) => setPrivacy(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private (Invite Only)</option>
                      {['CR', 'TEACHER', 'ADMIN', 'FACULTY'].includes(user?.role || '') && (
                        <option value="CLASS_ONLY">Class Only</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
