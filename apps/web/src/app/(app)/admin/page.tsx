'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Cpu, 
  Activity, 
  Database,
  TrendingUp,
  Server
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          System Administration & Operations
        </h1>
        <p className="text-xs text-slate-400">
          Platform performance, user management, academic hierarchy CRUD, and AI RAG service health
        </p>
      </div>

      {/* Admin Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Platform Users', value: '4,280', change: '+120 this week', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Indexed Papers', value: '1,450', change: '98% OCR parsed', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { title: 'AI Token Usage', value: '1.2M Tokens', change: 'NVIDIA Nemotron', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { title: 'System Uptime', value: '99.98%', change: 'MongoDB & Redis Operational', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((m, i) => (
          <div key={i} className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400">{m.title}</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{m.value}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{m.change}</p>
            </div>
            <div className={`h-10 w-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center shrink-0`}>
              <m.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* System Health Status */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          Infrastructure & Backend Services Status
        </h3>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { service: 'Express.js REST API', status: 'Healthy', latency: '42ms' },
            { service: 'MongoDB Primary Cluster', status: 'Healthy', latency: '12ms' },
            { service: 'BullMQ Worker Queue', status: 'Active', latency: '0 queue backlog' },
          ].map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{s.service}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.latency}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
