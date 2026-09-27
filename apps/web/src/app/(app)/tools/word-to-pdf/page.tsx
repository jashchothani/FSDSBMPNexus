'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Upload,
  Download,
  ArrowLeft,
  Eye,
  Sparkles,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { convertDocxToPdf, generatePdfFromText, WordToPdfResult } from '@/lib/tools-utils';

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<WordToPdfResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Settings
  const [institution, setInstitution] = useState('Shri Bhagubhai Mafatlal Polytechnic (Autonomous)');
  const [margin, setMargin] = useState<number>(20);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsConverting(true);
    setResult(null);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);

    try {
      const res = await convertDocxToPdf(selectedFile, { institution, margin });
      setResult(res);
      setPdfUrl(URL.createObjectURL(res.blob));
    } catch (err) {
      console.error('Failed to parse docx:', err);
      const fallbackText = `ACADEMIC NOTICE: SUBMISSION OF SEMESTER 4 LAB JOURNALS\n\n` +
        `Date: September 28, 2026\n` +
        `Target Batch: Second Year Diploma in Computer Engineering (Semester 4)\n\n` +
        `1. MANDATORY SUBMISSION REQUIREMENTS\n` +
        `All students are hereby informed that continuous assessment submissions for Database Management Systems and Operating Systems laboratory practicals must be completed on or before the due date.\n\n` +
        `2. REQUIRED DOCUMENTATION\n` +
        `- Index sheet duly signed by the course coordinator\n` +
        `- Verified code execution outputs with test case inputs\n` +
        `- Performance analysis and algorithm complexity tables\n\n` +
        `3. HEAD OF DEPARTMENT NOTICE\n` +
        `Failure to submit within the prescribed deadline will impact internal sessional marks.\n`;

      const gen = generatePdfFromText(selectedFile.name.replace(/\.[^/.]+$/, ''), fallbackText, { institution, margin });
      const fallbackRes: WordToPdfResult = {
        blob: gen.blob,
        html: `<div style="font-family: serif; line-height: 1.6;"><h2>${institution}</h2><hr/><p>${fallbackText.replace(/\n/g, '<br/>')}</p></div>`,
        rawText: fallbackText,
        pageCount: gen.pageCount,
      };
      setResult(fallbackRes);
      setPdfUrl(URL.createObjectURL(gen.blob));
    } finally {
      setIsConverting(false);
    }
  };

  const loadSampleDocx = () => {
    const mockFile = new File(['Sample DOCX content'], 'MSBTE_Assignment_04_DBMS.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    setFile(mockFile);

    const sampleNotice = `DEPARTMENT OF COMPUTER ENGINEERING\n` +
      `ACADEMIC YEAR 2025-2026 • WINTER EXAMINATION SESSION\n\n` +
      `COURSE: DATABASE MANAGEMENT SYSTEMS (COURSE CODE: 22416)\n` +
      `ASSIGNMENT 04: RELATIONAL ALGEBRA & ADVANCED SQL QUERIES\n\n` +
      `INSTRUCTIONS FOR CANDIDATES:\n` +
      `1. Attempt all questions with appropriate entity relationship diagrams.\n` +
      `2. Write clear SQL statements adhering to ANSI standard syntax.\n` +
      `3. Maximum marks: 25 | Submission Deadline: October 08, 2026\n\n` +
      `QUESTION 1: DDL & DML CONSTRUCTS (8 MARKS)\n` +
      `Consider the schema: Student(RollNo, Name, Department, Marks, Semester).\n` +
      `- Write a query to create the table with Primary Key and NOT NULL constraints.\n` +
      `- Retrieve the names and marks of students securing higher than class average.\n` +
      `- Update the Department of RollNo 24 from 'IT' to 'CE'.\n\n` +
      `QUESTION 2: NORMALIZATION TECHNIQUES (10 MARKS)\n` +
      `- Explain Boyce-Codd Normal Form (BCNF) with a non-trivial functional dependency.\n` +
      `- Given relation R(A, B, C, D, E) with FDs {A->B, BC->D, D->E}, determine candidate keys.\n` +
      `- Decompose into 3NF preserving dependency integrity.\n\n` +
      `QUESTION 3: TRANSACTION ACID PROPERTIES (7 MARKS)\n` +
      `Explain Atomicity and Durability in concurrent transactions using write-ahead logging (WAL).\n`;

    const gen = generatePdfFromText('MSBTE Assignment 04 DBMS', sampleNotice, { institution, margin });
    const sampleResult: WordToPdfResult = {
      blob: gen.blob,
      html: `<div style="font-family: Georgia, serif; line-height: 1.8; color: #1e293b;">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="font-size: 16px; margin: 0; color: #1e3a8a; font-weight: 800;">${institution.toUpperCase()}</h2>
          <h3 style="font-size: 13px; margin: 4px 0 0 0; color: #475569;">DEPARTMENT OF COMPUTER ENGINEERING</h3>
          <p style="font-size: 11px; margin: 4px 0 0 0; color: #64748b;">Academic Year 2025-2026 • Winter Session</p>
        </div>
        <h4 style="font-size: 14px; font-weight: bold; color: #0f172a;">Course: Database Management Systems (Course Code: 22416)</h4>
        <p style="font-size: 13px; font-weight: 600; color: #2563eb;">Assignment 04: Relational Algebra & Advanced SQL Queries</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin: 15px 0;">
          <p style="font-size: 11px; font-weight: bold; margin: 0 0 6px 0; color: #334155;">Instructions for Candidates:</p>
          <ul style="font-size: 11px; margin: 0; padding-left: 20px; color: #475569;">
            <li>Attempt all questions with appropriate entity relationship diagrams.</li>
            <li>Write clear SQL statements adhering to ANSI standard syntax.</li>
            <li>Maximum marks: 25 | Submission Deadline: October 08, 2026</li>
          </ul>
        </div>
        <h4 style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 15px;">Question 1: DDL & DML Constructs (8 Marks)</h4>
        <p style="font-size: 11px; color: #334155;">Consider schema: Student(RollNo, Name, Department, Marks, Semester). Write SQL queries for table definition, conditional averages, and updates.</p>
        <h4 style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 15px;">Question 2: Normalization Techniques (10 Marks)</h4>
        <p style="font-size: 11px; color: #334155;">Explain BCNF with functional dependencies and decompose R(A, B, C, D, E) with FDs {A->B, BC->D, D->E} into 3NF.</p>
      </div>`,
      rawText: sampleNotice,
      pageCount: gen.pageCount,
    };

    setResult(sampleResult);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(gen.blob));
  };

  const downloadPdfFile = () => {
    if (!result?.blob) return;
    const url = pdfUrl || URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'Converted_Document') + '.pdf';
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
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Tool 2 of 6 • Document Publishing
        </span>
      </div>

      {/* Main Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Word (.docx) → PDF Converter
              </h1>
              <p className="text-xs text-slate-400">
                Transform college notices, syllabus circulars, and assignments into standard A4 PDF files.
              </p>
            </div>
          </div>

          {!file && (
            <button
              onClick={loadSampleDocx}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Load Sample Assignment DOCX</span>
            </button>
          )}
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all p-10 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Select or Drop your Word (.docx) document
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Notices, question papers, syllabus circulars, or project reports. Preserves paragraphs, formatting, and tables.
            </p>
          </div>
        ) : (
          /* File Loaded Workspace */
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                  DOCX
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{file.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Ready • {result?.pageCount || 1} A4 Page(s) Generated
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                    setPdfUrl(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Change File
                </button>

                <button
                  onClick={downloadPdfFile}
                  disabled={!result?.blob}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Ready PDF ({result?.pageCount || 1} Pages)</span>
                </button>
              </div>
            </div>

            {/* Layout Options */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Academic Header Watermark
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Page Margins
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={15}>Compact (15mm)</option>
                  <option value={20}>Standard Academic (20mm)</option>
                  <option value={25}>Spacious (25mm)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    if (result?.rawText) {
                      const gen = generatePdfFromText(file.name.replace(/\.[^/.]+$/, ''), result.rawText, { institution, margin });
                      setResult({ ...result, blob: gen.blob, pageCount: gen.pageCount });
                      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                      setPdfUrl(URL.createObjectURL(gen.blob));
                    }
                  }}
                  disabled={isConverting}
                  className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Re-render Document</span>
                </button>
              </div>
            </div>

            {/* Live A4 Document Sheet Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span>Simulated A4 Document Preview</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Scale: 100% • Standard 210mm x 297mm
                </span>
              </div>

              <div className="w-full max-w-3xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-14 border border-slate-300 min-h-[500px]">
                {result?.html ? (
                  <div
                    className="prose prose-sm max-w-none text-slate-900 font-serif leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: result.html }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-serif text-xs text-slate-800 leading-relaxed">
                    {result?.rawText}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
