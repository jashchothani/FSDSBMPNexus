'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Upload,
  Download,
  ArrowLeft,
  Sparkles,
  Sliders,
  Crop,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { processBackgroundRemoval, BgRemoverOptions } from '@/lib/tools-utils';

export default function BackgroundRemoverPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [tolerance, setTolerance] = useState<number>(32);
  const [feather, setFeather] = useState<number>(2);
  const [bgColor, setBgColor] = useState<'transparent' | 'white' | 'passport-blue' | string>('transparent');
  const [cropPreset, setCropPreset] = useState<'original' | 'passport' | 'square'>('passport');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const applyProcessing = (img: HTMLImageElement, opts?: Partial<BgRemoverOptions>) => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const canvas = processBackgroundRemoval(img, {
          tolerance: opts?.tolerance ?? tolerance,
          feather: opts?.feather ?? feather,
          bgColor: opts?.bgColor ?? bgColor,
          cropPreset: opts?.cropPreset ?? cropPreset,
        });
        setProcessedSrc(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const handleFileChange = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgElementRef.current = img;
      applyProcessing(img);
    };
    img.src = url;
  };

  const loadSamplePhoto = () => {
    // Generate a student avatar portrait on canvas for instant testing
    const c = document.createElement('canvas');
    c.width = 400;
    c.height = 500;
    const ctx = c.getContext('2d')!;

    // Pale bluish-gray studio backdrop
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 400, 500);

    // Shoulders / Dark Navy Blazer
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(200, 480, 160, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Shirt Collar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(165, 390);
    ctx.lineTo(200, 450);
    ctx.lineTo(235, 390);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(175, 335, 50, 65);

    // Head / Face
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(200, 245, 78, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(200, 175, 82, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(172, 235, 6, 0, Math.PI * 2);
    ctx.arc(228, 235, 6, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(200, 275, 24, 0.2, Math.PI - 0.2);
    ctx.stroke();

    const dataUrl = c.toDataURL('image/png');
    setImageSrc(dataUrl);
    setImageFile(new File(['sample'], 'Sample_Student_Photo.png', { type: 'image/png' }));

    const img = new Image();
    img.onload = () => {
      imgElementRef.current = img;
      applyProcessing(img);
    };
    img.src = dataUrl;
  };

  useEffect(() => {
    if (imgElementRef.current) {
      applyProcessing(imgElementRef.current);
    }
  }, [tolerance, feather, bgColor, cropPreset]);

  const downloadCleanImage = () => {
    if (!processedSrc) return;
    const a = document.createElement('a');
    a.href = processedSrc;
    a.download = (imageFile?.name ? imageFile.name.replace(/\.[^/.]+$/, '') : 'ID_Photo') + '_Clean.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/tools"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Tools</span>
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Tool 4 of 6 • Computer Vision
        </span>
      </div>

      {/* Main Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ImageIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                ID Photo & Document Background Remover
              </h1>
              <p className="text-xs text-slate-400">
                Create compliant passport/hall ticket photos, clean certificate scans, and remove backgrounds with zero data leaks.
              </p>
            </div>
          </div>

          {!imageFile && (
            <button
              onClick={loadSamplePhoto}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Load Sample Student Photo</span>
            </button>
          )}
        </div>

        {/* Upload Zone */}
        {!imageFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all p-10 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Select or Drop your Student Photo or Document
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Supports PNG, JPG, JPEG, WEBP. Instant background removal with college exam & hall-ticket presets.
            </p>
          </div>
        ) : (
          /* Editor Workspace */
          <div className="space-y-6">
            {/* Options Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Background Color Mode */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Output Background
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setBgColor('transparent')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                      bgColor === 'transparent'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Transparent
                  </button>
                  <button
                    onClick={() => setBgColor('white')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                      bgColor === 'white'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    White (ID)
                  </button>
                  <button
                    onClick={() => setBgColor('passport-blue')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                      bgColor === 'passport-blue'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Blue (Exam)
                  </button>
                </div>
              </div>

              {/* Crop Ratio Presets */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Preset Sizing
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setCropPreset('passport')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                      cropPreset === 'passport'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    35x45mm ID
                  </button>
                  <button
                    onClick={() => setCropPreset('square')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                      cropPreset === 'square'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    1:1 Square
                  </button>
                  <button
                    onClick={() => setCropPreset('original')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                      cropPreset === 'original'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Sensitivity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5 text-[11px]">
                  <span className="font-semibold text-slate-400">Color Sensitivity</span>
                  <span className="text-emerald-400 font-mono">{tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Edge Feathering Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5 text-[11px]">
                  <span className="font-semibold text-slate-400">Edge Smoothing</span>
                  <span className="text-emerald-400 font-mono">{feather}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={feather}
                  onChange={(e) => setFeather(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Split Comparison Canvas */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Original Image</span>
                  <span>Source Format</span>
                </div>
                <div className="aspect-[35/45] max-h-[420px] w-full rounded-2xl border border-slate-800 bg-slate-950/80 flex items-center justify-center overflow-hidden p-2">
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Original"
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  )}
                </div>
              </div>

              {/* Processed Result */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    Clean Background Extracted
                  </span>
                  {isProcessing && <span className="text-xs animate-pulse">Rendering...</span>}
                </div>
                <div
                  className="aspect-[35/45] max-h-[420px] w-full rounded-2xl border border-emerald-500/40 flex items-center justify-center overflow-hidden p-2 relative"
                  style={{
                    backgroundImage:
                      bgColor === 'transparent'
                        ? 'radial-gradient(#334155 1px, transparent 1px)'
                        : undefined,
                    backgroundSize: '12px 12px',
                    backgroundColor:
                      bgColor === 'white'
                        ? '#ffffff'
                        : bgColor === 'passport-blue'
                        ? '#2563eb'
                        : '#020617',
                  }}
                >
                  {processedSrc && (
                    <img
                      src={processedSrc}
                      alt="Processed"
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Download Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImageSrc(null);
                    setProcessedSrc(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Upload Another Photo
                </button>
              </div>

              <button
                onClick={downloadCleanImage}
                disabled={!processedSrc}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>Download Clean Image (PNG)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
