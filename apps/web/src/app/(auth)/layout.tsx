import React from 'react';
import Link from 'next/link';
import { Sparkles, Code2, GraduationCap, ShieldCheck, Terminal } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Animated Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">SBMP</span>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">NEXUS</span>
              <span className="text-[10px] font-semibold tracking-wider text-cyan-400/90 uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">v2.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Shri Bhagubhai Mafatlal Polytechnic</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 backdrop-blur-md">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Semester 1–6 Engineering Curriculum</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 border-t border-slate-800/40 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <p>© 2026 SBMPNexus Arena. Shri Bhagubhai Mafatlal Polytechnic.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure JWT Auth</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-cyan-400" /> MongoDB Live</span>
        </div>
      </footer>
    </div>
  );
}
