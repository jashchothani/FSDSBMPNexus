'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { CommandPalette } from '@/components/command-palette';
import { NexusAiWidget } from '@/components/nexus-ai-widget';
import { NexusChatWidget } from '@/components/nexus-chat-widget';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f6ff] text-slate-800 flex flex-col">
      <Navbar 
        onOpenCommandPalette={() => setIsCmdOpen(true)}
        onToggleAiDrawer={() => setIsAiWidgetOpen(!isAiWidgetOpen)}
      />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      <CommandPalette 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
      />

      <NexusAiWidget 
        isOpen={isAiWidgetOpen} 
        onClose={() => setIsAiWidgetOpen(false)} 
      />
      
      <NexusChatWidget />
    </div>
  );
}
