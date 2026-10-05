'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = 'md',
  showText = true,
  showSubtitle = false,
  href,
  className = '',
}: BrandLogoProps) {
  const iconSizes = {
    sm: { width: 28, height: 28, text: 'text-lg', sub: 'text-[8px]' },
    md: { width: 36, height: 36, text: 'text-xl', sub: 'text-[9px]' },
    lg: { width: 48, height: 48, text: 'text-2xl', sub: 'text-[10px]' },
    xl: { width: 64, height: 64, text: 'text-3xl sm:text-4xl', sub: 'text-xs' },
  };

  const currentSize = iconSizes[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* 3D Emblem with ambient glow */}
      <div className="relative flex items-center justify-center shrink-0">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500/20 via-sky-400/25 to-purple-500/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
        <Image
          src="/logo-icon.png"
          alt="SBMPNexus Emblem"
          width={currentSize.width}
          height={currentSize.height}
          priority
          className="relative drop-shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight ${currentSize.text} flex items-center`}>
            <span className="text-slate-900 group-hover:text-blue-950 transition-colors">SBMP</span>
            <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent font-extrabold ml-0.5">
              Nexus
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-bold tracking-widest text-slate-400 uppercase mt-0.5 ${currentSize.sub}`}>
              Learn • Code • Compete • Grow
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
