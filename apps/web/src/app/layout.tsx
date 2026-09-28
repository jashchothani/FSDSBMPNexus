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
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#f0f6ff] text-slate-800 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
