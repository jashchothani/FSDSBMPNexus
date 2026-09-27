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
    { name: 'Paper Archive', href: '/papers', icon: FileText, badge: 'MSBTE' },
    { name: 'Question Bank', href: '/question-bank', icon: HelpCircle, badge: 'PYQ' },
    { name: 'Study Materials', href: '/study-materials', icon: FolderGit2 },
    { name: 'NexusAI Tutor', href: '/ai-tutor', icon: Sparkles, highlight: true },
    { name: 'Exam Prep & Quizzes', href: '/exam-prep', icon: BrainCircuit },
    { name: 'Saved Library', href: '/bookmarks', icon: Bookmark },
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
    <aside className="w-64 glass-panel border-r border-slate-800/80 bg-slate-950/60 hidden md:flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Academic Context Selector */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">Active Academic Track</span>
          </div>
          <p className="text-sm font-bold text-white">Computer Engineering</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Semester 4 (K-Scheme)
            </span>
            <Link href="/settings" className="text-xs text-blue-400 hover:underline">
              Change
            </Link>
          </div>
        </div>

        {/* Main Section */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                      ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60",
                    item.highlight && !isActive && "text-indigo-300 bg-indigo-500/10 border border-indigo-500/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-blue-400" : item.highlight ? "text-indigo-400" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase",
                      item.highlight ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-400"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Academic Utilities Suite */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Document Tools
            </h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25">
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
                      ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", isActive ? "text-emerald-400" : "text-slate-400")} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Workflows & Admin */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                      ? "bg-purple-600/15 text-purple-400 border border-purple-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4", isActive ? "text-purple-400" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300">
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
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
        <Link
          href="/settings"
          className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4" />
            <span>Preferences & Settings</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        </Link>
      </div>
    </aside>
  );
}
