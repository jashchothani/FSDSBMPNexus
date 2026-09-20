import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/app-provider';

export const metadata: Metadata = {
  title: 'SBMPNexus — Every Paper. Every Note. Every Semester.',
  description: 'AI-powered academic knowledge nexus for Mumbai diploma students. Access past papers, question banks, study notes, and instant AI tutoring.',
  keywords: ['SBMPNexus', 'MSBTE', 'Question Papers', 'Diploma Engineering', 'Question Bank', 'AI Tutor'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
