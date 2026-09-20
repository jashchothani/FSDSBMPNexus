'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Bell, 
  BookOpen, 
  User, 
  Bookmark, 
  Moon, 
  Sun,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
  onToggleAiDrawer?: () => void;
}

export function Navbar({ onOpenCommandPalette, onToggleAiDrawer }: NavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  SBMP<span className="text-gradient">Nexus</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
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
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-400 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>Search papers, subjects, AI notes...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 text-slate-400 rounded-md border border-slate-700">
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
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 border border-indigo-500/30 transition-all shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-indigo-400 animate-spin-slow" />
            <span className="hidden sm:inline">Ask NexusAI</span>
          </button>

          {/* Study Streak */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Flame className="h-4 w-4 fill-amber-400 text-amber-500" />
            <span>5 Day Streak</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Profile Menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <Link
              href="/settings"
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                JD
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-white leading-none">Jash T.</p>
                <p className="text-[10px] text-slate-400 font-medium">Computer Eng • Sem 4</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}
