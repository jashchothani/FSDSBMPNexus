'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  HelpCircle, 
  FolderGit2, 
  Sparkles, 
  BrainCircuit, 
  Bookmark, 
  UploadCloud, 
  CheckSquare, 
  ShieldCheck, 
  Settings,
  ChevronRight,
  GraduationCap,
  Swords,
  Code2,
  Users,
  Trophy,
  Wrench,
  Presentation,
  FileCheck,
  FileEdit,
  Image,
  Share2,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Nexus Arena', href: '/arena', icon: Swords, highlight: true, badge: 'NEW' },
    { name: 'Paper Archive', href: '/papers', icon: FileText, badge: 'MSBTE' },
    { name: 'Question Bank', href: '/question-bank', icon: HelpCircle, badge: 'PYQ' },
    { name: 'Study Materials', href: '/study-materials', icon: FolderGit2 },
    { name: 'NexusAI Tutor', href: '/ai-tutor', icon: Sparkles },
    { name: 'Exam Prep & Quizzes', href: '/exam-prep', icon: BrainCircuit },
    { name: 'Saved Library', href: '/bookmarks', icon: Bookmark },
    { name: 'Academic Tools Hub', href: '/tools', icon: Wrench, badge: '6 Tools' },
  ];

  const arenaNavigation = [
    { name: 'Arena Hub', href: '/arena', icon: LayoutDashboard },
    { name: 'Problems', href: '/arena/problems', icon: Code2 },
    { name: 'Study Rooms', href: '/arena/rooms', icon: Users },
    { name: 'Code Clash 1v1', href: '/arena/clash', icon: Swords, badge: 'HOT' },
    { name: 'Global Messenger', href: '/arena/chat', icon: Sparkles },
    { name: 'Match History', href: '/arena/history', icon: CheckSquare },
    { name: 'Skill Profile', href: '/arena/profile', icon: GraduationCap },
    { name: 'Leaderboard', href: '/arena/leaderboard', icon: Trophy },
  ];

  const toolsNavigation = [
    { name: 'Academic Tools Hub', href: '/tools', icon: Wrench, badge: '6 Tools' },
    { name: 'PPT → PDF', href: '/tools/ppt-to-pdf', icon: Presentation },
    { name: 'Word → PDF', href: '/tools/word-to-pdf', icon: FileCheck },
    { name: 'PDF → Word', href: '/tools/pdf-to-word', icon: FileEdit },
    { name: 'ID & Photo BG Remover', href: '/tools/background-remover', icon: Image },
    { name: 'Temp Clipboard', href: '/tools/clipboard', icon: Share2, badge: 'Sync' },
    { name: 'PDF Merge / Split / Comp', href: '/tools/pdf-manage', icon: Layers },
  ];

  const workflowNavigation = [
    { name: 'Upload / Contribute', href: '/contribute', icon: UploadCloud },
    { name: 'Moderation Queue', href: '/moderation', icon: CheckSquare, badge: '3' },
    { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-blue-100/60 hidden md:flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shadow-sm">
      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Academic Context Selector */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-600">Active Academic Track</span>
          </div>
          <p className="text-sm font-bold text-slate-800">Computer Engineering</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="px-2 py-0.5 rounded-md bg-white text-blue-600 border border-blue-200 font-medium shadow-sm">
              Semester 4 (K-Scheme)
            </span>
            <Link href="/settings" className="text-xs text-blue-500 hover:text-blue-600 hover:underline font-medium">
              Change
            </Link>
          </div>
        </div>

        {/* Main Section */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Academic Nexus
          </h3>
          <nav className="space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                    isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                      : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50",
                    item.highlight && !isActive && "text-blue-600 bg-blue-50/40 border border-blue-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-blue-500" : item.highlight ? "text-blue-400" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase",
                      item.highlight ? "bg-blue-100 text-blue-500" : "bg-slate-100 text-slate-400"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Arena Sub-Nav — only show when on arena pages */}
        {pathname?.startsWith('/arena') && (
          <div>
            <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Arena Navigation
            </h3>
            <nav className="space-y-1">
              {arenaNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                      isActive
                        ? "bg-violet-50 text-violet-600 border border-violet-200"
                        : "text-slate-500 hover:text-violet-600 hover:bg-violet-50/50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-violet-500" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Tools Sub-Nav — only show when on tools pages */}
        {pathname?.startsWith('/tools') && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Document Tools
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-500 border border-emerald-200">
                NEW
              </span>
            </div>
            <nav className="space-y-1">
              {toolsNavigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/tools' && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                      isActive
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                        : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", isActive ? "text-emerald-500" : "text-slate-400")} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-slate-100 text-slate-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Workflows & Admin */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Contribute & Manage
          </h3>
          <nav className="space-y-1">
            {workflowNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                    isActive
                      ? "bg-violet-50 text-violet-600 border border-violet-200"
                      : "text-slate-500 hover:text-violet-600 hover:bg-violet-50/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4", isActive ? "text-violet-500" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 text-violet-500">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Footer / Settings Link */}
      <div className="p-4 border-t border-blue-50 bg-white/80">
        <Link
          href="/settings"
          className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4" />
            <span>Preferences & Settings</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        </Link>
      </div>
    </aside>
  );
}
