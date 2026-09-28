'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  Flame,
  User as UserIcon,
  LogOut,
  Menu
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
  onToggleAiDrawer?: () => void;
}

export function Navbar({ onOpenCommandPalette, onToggleAiDrawer }: NavbarProps) {
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
    : '';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-blue-100/60 shadow-sm shadow-blue-50">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-800 group-hover:text-blue-600 transition-colors">
                  SBMP<span className="text-gradient">Nexus</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide rounded-md bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">
                Academic Knowledge Engine
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Cmd+K Search Trigger */}
        <div className="flex-1 max-w-xl mx-6 hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-400 bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span>Search papers, subjects, AI notes...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white text-slate-400 rounded-md border border-slate-200 shadow-sm">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Trigger */}
          <button
            onClick={onToggleAiDrawer}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 text-blue-600 border border-blue-200 transition-all shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-blue-500 animate-pulse-soft" />
            <span className="hidden sm:inline">Ask NexusAI</span>
          </button>

          {/* Study Streak */}
          {user?.gamification && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 text-xs font-semibold">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>{user.gamification.streak || 0} Day Streak</span>
            </div>
          )}

          {/* User Profile Menu */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                href="/settings"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-blue-500/20">
                  {initials}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-slate-700 leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize">
                    {user.role}
                  </p>
                </div>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
