'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FileEdit,
  Upload,
  Download,
  ArrowLeft,
  Sparkles,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { convertPdfToDocx } from '@/lib/tools-utils';

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsExtracting(true);
    setDocxBlob(null);
    if (docxUrl) URL.revokeObjectURL(docxUrl);
    setDocxUrl(null);
    const cleanTitle = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setDocTitle(cleanTitle);

    try {
      const res = await convertPdfToDocx(selectedFile, undefined, { title: cleanTitle });
      setExtractedText(res.text);
      setDocxBlob(res.blob);
      setDocxUrl(URL.createObjectURL(res.blob));
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateAndGenerateDocx = async () => {
    setIsExtracting(true);
    try {
      const dummyFile = file || new File(['dummy'], 'Document.pdf', { type: 'application/pdf' });
      const res = await convertPdfToDocx(dummyFile, extractedText, { title: docTitle });
      setDocxBlob(res.blob);
      if (docxUrl) URL.revokeObjectURL(docxUrl);
      setDocxUrl(URL.createObjectURL(res.blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const loadSamplePdf = async () => {
    const mockFile = new File(['Sample PDF content'], 'MSBTE_Winter2023_Question_Paper_22416.pdf', {
      type: 'application/pdf',
    });
    setFile(mockFile);
    setDocTitle('MSBTE Winter 2023 Question Paper 22416');

    const samplePaperText = `MAHARASHTRA STATE BOARD OF TECHNICAL EDUCATION\n` +
      `COURSE: DATABASE MANAGEMENT SYSTEMS (22416) • SEMESTER 4\n` +
      `TIME: 3 HOURS | TOTAL MARKS: 70\n\n` +
      `INSTRUCTIONS:\n` +
      `1. All questions are compulsory.\n` +
      `2. Illustrate your answers with neat sketches wherever necessary.\n` +
      `3. Figures to the right indicate full marks.\n\n` +
      `Q.1 ATTEMPT ANY FIVE OF THE FOLLOWING (10 MARKS):\n` +
      `- (a) Define Data Redundancy and Data Integrity.\n` +
      `- (b) List any four advantages of DBMS over traditional file processing system.\n` +
      `- (c) State the role of Database Administrator (DBA).\n` +
      `- (d) Define candidate key and foreign key with a suitable example.\n` +
      `- (e) Write syntax for creating a view in SQL.\n` +
      `- (f) Define BCNF (Boyce-Codd Normal Form).\n\n` +
      `Q.2 ATTEMPT ANY THREE OF THE FOLLOWING (12 MARKS):\n` +
      `- (a) Describe 3-tier architecture of DBMS with a labeled block diagram.\n` +
      `- (b) Explain generalization, specialization and aggregation in E-R model.\n` +
      `- (c) Differentiate between Primary Key and Unique Key constraints with syntax.\n` +
      `- (d) Explain various DDL and DML commands with examples.\n\n` +
      `Q.3 ATTEMPT ANY THREE OF THE FOLLOWING (12 MARKS):\n` +
      `- (a) Explain relational algebra operations: Selection, Projection, Union, Cartesian Product.\n` +
      `- (b) Normalize the given relation R(A, B, C, D, E) up to 3NF showing step-by-step dependency tests.\n` +
      `- (c) Explain ACID properties of database transaction with real-world banking scenario.\n`;

    setExtractedText(samplePaperText);
    setIsExtracting(true);

    try {
      const res = await convertPdfToDocx(mockFile, samplePaperText, { title: 'MSBTE Winter 2023 Question Paper 22416' });
      setDocxBlob(res.blob);
      if (docxUrl) URL.revokeObjectURL(docxUrl);
      setDocxUrl(URL.createObjectURL(res.blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadDocxFile = () => {
    if (!docxBlob) return;
    const url = docxUrl || URL.createObjectURL(docxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (docTitle ? docTitle.replace(/\s+/g, '_') : 'Converted_Paper') + '.docx';
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
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Tool 3 of 6 • Document Intelligence
        </span>
      </div>

      {/* Main Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileEdit className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                PDF → Editable Word (.docx) Converter
              </h1>
              <p className="text-xs text-slate-400">
                Extract text, questions, and structures from PDFs into formatted Microsoft Word documents.
              </p>
            </div>
          </div>

          {!file && (
            <button
              onClick={loadSamplePdf}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Load Sample MSBTE Question Paper</span>
            </button>
          )}
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all p-10 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Select or Drop your PDF document
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Question papers, syllabus notes, model answers, or assignment sheets. Extract directly into native Word (.docx).
            </p>
          </div>
        ) : (
          /* Editor Workspace */
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  DOCX
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{file.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Ready for editing & native Microsoft Word download
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFile(null);
                    setExtractedText('');
                    setDocxBlob(null);
                    if (docxUrl) URL.revokeObjectURL(docxUrl);
                    setDocxUrl(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Choose Another PDF
                </button>

                <button
                  onClick={downloadDocxFile}
                  disabled={!docxBlob}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Word (.docx)</span>
                </button>
              </div>
            </div>

            {/* In-Place Live Text & Question Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-indigo-400" />
                    <span>Live Document & Question Editor</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    You can modify extracted questions, fix formulas, or add remarks before generating your Word (.docx) file.
                  </p>
                </div>

                <button
                  onClick={handleUpdateAndGenerateDocx}
                  disabled={isExtracting}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Update .docx Output</span>
                </button>
              </div>

              {/* Title input */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Document Title:</span>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Editable Textarea */}
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={16}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500/80 shadow-inner"
                placeholder="Extracted content from PDF will appear here..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
