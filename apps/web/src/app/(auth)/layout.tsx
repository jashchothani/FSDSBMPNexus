import React from 'react';
import Link from 'next/link';
import { Code2, GraduationCap, ShieldCheck, Terminal } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f6ff] via-[#e8f2ff] to-[#dbeafe] text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Background Animated Blobs */}
      <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-100px] right-1/4 w-[500px] h-[500px] bg-sky-200/25 rounded-full blur-[100px] pointer-events-none animate-blob-delay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/15 rounded-full blur-[140px] pointer-events-none animate-blob-delay-2" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f606_1px,transparent_1px),linear-gradient(to_bottom,#3b82f606_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-800">SBMP</span>
              <span className="font-bold text-lg tracking-tight text-gradient">NEXUS</span>
              <span className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200">v2.0</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Shri Bhagubhai Mafatlal Polytechnic</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-blue-100 text-slate-500 backdrop-blur-md shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            <span>Semester 1–6 Engineering Curriculum</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 border-t border-blue-100/60 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <p>© 2026 SBMPNexus Arena. Shri Bhagubhai Mafatlal Polytechnic.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure JWT Auth</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-blue-500" /> MongoDB Live</span>
        </div>
      </footer>
    </div>
  );
}
