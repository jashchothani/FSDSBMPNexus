'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Layers,
  Upload,
  Download,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  Scissors,
  Minimize2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { mergePdfFiles, splitPdfFile, compressPdfFile, createTestPdf } from '@/lib/tools-utils';

export default function PdfManagePage() {
  const [activeTab, setActiveTab] = useState<'merge' | 'split' | 'compress'>('merge');

  // MERGE STATE
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // SPLIT STATE
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('1-2');
  const [splitBlob, setSplitBlob] = useState<Blob | null>(null);
  const [splitUrl, setSplitUrl] = useState<string | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const splitInputRef = useRef<HTMLInputElement>(null);

  // COMPRESS STATE
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [compressStats, setCompressStats] = useState<{
    originalSize: number;
    newSize: number;
    savings: number;
  } | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const compressInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // MERGE HANDLERS
  // -------------------------------------------------------------------------
  const handleMergeFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const newArr = [...mergeFiles, ...Array.from(files)];
    setMergeFiles(newArr);
    setMergedBlob(null);
  };

  const moveMergeFile = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= mergeFiles.length) return;
    const updated = [...mergeFiles];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setMergeFiles(updated);
  };

  const removeMergeFile = (idx: number) => {
    setMergeFiles(mergeFiles.filter((_, i) => i !== idx));
  };

  const executeMerge = async () => {
    if (mergeFiles.length < 2) return;
    setIsMerging(true);
    try {
      const blob = await mergePdfFiles(mergeFiles);
      setMergedBlob(blob);
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      setMergedUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Merge error:', err);
    } finally {
      setIsMerging(false);
    }
  };

  const loadSampleMerge = async () => {
    setIsMerging(true);
    try {
      const f1 = await createTestPdf('DBMS_Winter_2023_Question_Paper', 2);
      const f2 = await createTestPdf('DBMS_Winter_2023_Model_Answers', 3);
      setMergeFiles([f1, f2]);
      const blob = await mergePdfFiles([f1, f2]);
      setMergedBlob(blob);
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      setMergedUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsMerging(false);
    }
  };

  const downloadMerged = () => {
    if (!mergedBlob) return;
    const a = document.createElement('a');
    a.href = mergedUrl || URL.createObjectURL(mergedBlob);
    a.download = 'Merged_Academic_Document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // -------------------------------------------------------------------------
  // SPLIT HANDLERS
  // -------------------------------------------------------------------------
  const executeSplit = async () => {
    if (!splitFile) return;
    setIsSplitting(true);
    try {
      const result = await splitPdfFile(splitFile, pageRange);
      setSplitBlob(result.blob);
      if (splitUrl) URL.revokeObjectURL(splitUrl);
      setSplitUrl(URL.createObjectURL(result.blob));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error extracting pages. Format example: 1-2 or 1,3');
    } finally {
      setIsSplitting(false);
    }
  };

  const loadSampleSplit = async () => {
    setIsSplitting(true);
    try {
      const sample = await createTestPdf('Computer_Networks_Complete_Syllabus', 6);
      setSplitFile(sample);
      setPageRange('1-3');
      const result = await splitPdfFile(sample, '1-3');
      setSplitBlob(result.blob);
      if (splitUrl) URL.revokeObjectURL(splitUrl);
      setSplitUrl(URL.createObjectURL(result.blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSplitting(false);
    }
  };

  const downloadSplit = () => {
    if (!splitBlob) return;
    const a = document.createElement('a');
    a.href = splitUrl || URL.createObjectURL(splitBlob);
    a.download = `Extracted_Pages_${pageRange.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // -------------------------------------------------------------------------
  // COMPRESS HANDLERS
  // -------------------------------------------------------------------------
  const executeCompress = async () => {
    if (!compressFile) return;
    setIsCompressing(true);
    try {
      const res = await compressPdfFile(compressFile, compressLevel);
      setCompressStats({
        originalSize: res.originalSize,
        newSize: res.newSize,
        savings: res.savingsPercent,
      });
      setCompressedBlob(res.blob);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(URL.createObjectURL(res.blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  const loadSampleCompress = async () => {
    setIsCompressing(true);
    try {
      const sample = await createTestPdf('Scanned_Lab_Journal_HighRes', 5);
      setCompressFile(sample);
      const res = await compressPdfFile(sample, compressLevel);
      setCompressStats({
        originalSize: res.originalSize,
        newSize: res.newSize,
        savings: res.savingsPercent,
      });
      setCompressedBlob(res.blob);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(URL.createObjectURL(res.blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedBlob) return;
    const a = document.createElement('a');
    a.href = compressedUrl || URL.createObjectURL(compressedBlob);
    a.download = `Compressed_${compressFile?.name || 'Document.pdf'}`;
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
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Tool 6 of 6 • PDF Power Suite
        </span>
      </div>

      {/* Main Container */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                PDF Merge / Split / Compress Suite
              </h1>
              <p className="text-xs text-slate-400">
                Organize teaching syllabus, bind exam answer keys, and compress files for university portal upload.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('merge')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'merge'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>1. Merge Multiple PDFs</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'split'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="h-4 w-4" />
            <span>2. Split & Extract Pages</span>
          </button>

          <button
            onClick={() => setActiveTab('compress')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'compress'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Minimize2 className="h-4 w-4" />
            <span>3. Compress File Size</span>
          </button>
        </div>

        {/* TAB 1: MERGE */}
        {activeTab === 'merge' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Merge Document Sequence</h3>
                <p className="text-[11px] text-slate-400">
                  Combine question papers with model answers, or arrange multiple assignment chapters.
                </p>
              </div>

              {mergeFiles.length === 0 && (
                <button
                  onClick={loadSampleMerge}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Load Sample Question + Answer PDFs</span>
                </button>
              )}
            </div>

            {/* Upload Zone */}
            <div
              onClick={() => mergeInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center group"
            >
              <input
                ref={mergeInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(e) => handleMergeFilesAdded(e.target.files)}
              />
              <Upload className="h-7 w-7 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">Add PDF Files to Merge</p>
              <p className="text-[10px] text-slate-400">Select multiple files (reorder using Up/Down controls)</p>
            </div>

            {/* File List */}
            {mergeFiles.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {mergeFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-white">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveMergeFile(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveMergeFile(idx, 'down')}
                          disabled={idx === mergeFiles.length - 1}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeMergeFile(idx)}
                          className="p-1 rounded bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    Total: {mergeFiles.length} Documents ready to combine
                  </span>

                  <button
                    onClick={executeMerge}
                    disabled={isMerging || mergeFiles.length < 2}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Layers className="h-4 w-4" />
                    <span>{isMerging ? 'Merging Documents...' : 'Merge All into One PDF'}</span>
                  </button>
                </div>

                {mergedBlob && (
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Merge Completed Successfully!</p>
                        <p className="text-[10px] text-slate-400">{(mergedBlob.size / 1024).toFixed(1)} KB unified PDF ready</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadMerged}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Merged PDF</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPLIT */}
        {activeTab === 'split' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Split & Extract Pages</h3>
                <p className="text-[11px] text-slate-400">
                  Extract individual modules, specific questions, or chapters from large textbooks.
                </p>
              </div>

              {!splitFile && (
                <button
                  onClick={loadSampleSplit}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Load Sample 6-Page Syllabus PDF</span>
                </button>
              )}
            </div>

            {!splitFile ? (
              <div
                onClick={() => splitInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center group"
              >
                <input
                  ref={splitInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSplitFile(e.target.files[0]);
                      setSplitBlob(null);
                    }
                  }}
                />
                <Scissors className="h-8 w-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">Select PDF to Split</p>
                <p className="text-[10px] text-slate-400">Upload any multi-page document</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{splitFile.name}</h4>
                    <p className="text-[10px] text-slate-400">{(splitFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={() => {
                      setSplitFile(null);
                      setSplitBlob(null);
                      if (splitUrl) URL.revokeObjectURL(splitUrl);
                      setSplitUrl(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Change File
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Page Range to Extract (e.g. 1-3 or 2,4,5):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g. 1-2"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono w-48"
                    />
                    <button
                      onClick={executeSplit}
                      disabled={isSplitting}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      <Scissors className="h-4 w-4" />
                      <span>{isSplitting ? 'Splitting...' : 'Extract Selected Pages'}</span>
                    </button>
                  </div>
                </div>

                {splitBlob && (
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Pages Extracted Successfully!</p>
                      <p className="text-[10px] text-slate-400">Range: {pageRange} ready for download</p>
                    </div>
                    <button
                      onClick={downloadSplit}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Split PDF</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPRESS */}
        {activeTab === 'compress' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Compress & Optimize File Size</h3>
                <p className="text-[11px] text-slate-400">
                  Shrink heavy scanned exam papers and journals to meet university portal upload limits (&lt; 2MB / 5MB).
                </p>
              </div>

              {!compressFile && (
                <button
                  onClick={loadSampleCompress}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Load Sample Heavy PDF</span>
                </button>
              )}
            </div>

            {!compressFile ? (
              <div
                onClick={() => compressInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center group"
              >
                <input
                  ref={compressInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCompressFile(e.target.files[0]);
                      setCompressedBlob(null);
                      setCompressStats(null);
                    }
                  }}
                />
                <Minimize2 className="h-8 w-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">Select PDF to Compress</p>
                <p className="text-[10px] text-slate-400">Scanned papers, lab manuals, project books</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{compressFile.name}</h4>
                    <p className="text-[10px] text-slate-400">Original Size: {(compressFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={() => {
                      setCompressFile(null);
                      setCompressedBlob(null);
                      setCompressStats(null);
                      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
                      setCompressedUrl(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Change File
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 grid sm:grid-cols-3 gap-3">
                  {[
                    { id: 'low', title: 'Basic (Low)', desc: 'Slight reduction, retains ultra-crisp formulas' },
                    { id: 'medium', title: 'Recommended', desc: 'Optimal for MSBTE & college ERP portals' },
                    { id: 'high', title: 'Maximum Shrink', desc: 'Aggressive compression for strictly < 2MB' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setCompressLevel(lvl.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        compressLevel === lvl.id
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{lvl.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{lvl.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={executeCompress}
                    disabled={isCompressing}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
                  >
                    <Minimize2 className="h-4 w-4" />
                    <span>{isCompressing ? 'Compressing...' : 'Compress PDF Now'}</span>
                  </button>
                </div>

                {compressStats && (
                  <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">Compression Complete!</h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Reduced from {(compressStats.originalSize / 1024).toFixed(1)} KB to{' '}
                          <strong className="text-emerald-400">
                            {(compressStats.newSize / 1024).toFixed(1)} KB
                          </strong>{' '}
                          (<span className="text-emerald-400 font-bold">-{compressStats.savings}% saved</span>)
                        </p>
                      </div>

                      <button
                        onClick={downloadCompressed}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Optimized PDF</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
