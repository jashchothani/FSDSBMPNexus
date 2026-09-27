"use client";

import React, { useState } from 'react';
import { ArrowLeft, Play, Send, Settings, BookOpen, Clock, Cpu, Terminal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-500 text-xs">
      <Loader2 className="w-4 h-4 animate-spin mr-2 text-cyan-400" />
      <span>Loading Monaco Code Editor...</span>
    </div>
  ),
});

export default function NexusProblemPage() {
  const [activeTab, setActiveTab] = useState<'DESCRIPTION' | 'SOLUTIONS' | 'SUBMISSIONS'>('DESCRIPTION');
  const [code, setCode] = useState(`/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function reverseList(head: ListNode | null): ListNode | null {
    
};`);
  const [language, setLanguage] = useState('typescript');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const handleRunCode = async (isSubmit = false) => {
    setIsRunning(true);
    setExecutionResult(null);
    try {
      const res = await fetch('http://localhost:4000/api/arena/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: 'NX-DS-034', code, language, isSubmit }),
      });
      const data = await res.json();
      setExecutionResult(data.data);
    } catch (err) {
      setExecutionResult({ status: 'RUNTIME_ERROR', output: 'Network Error: Failed to execute code' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full gap-4">
      
      {/* Left Panel: Problem Description */}
      <div className="flex w-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        
        {/* Header / Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50/50 p-2 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50">
          <Link href="/arena" className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {(['DESCRIPTION', 'SOLUTIONS', 'SUBMISSIONS'] as const).map((tab) => {
            const icons = { DESCRIPTION: BookOpen, SOLUTIONS: Cpu, SUBMISSIONS: Clock };
            const Icon = icons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">206. Reverse Linked List</h1>
          </div>
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Easy</span>
            <span className="text-sm font-medium text-slate-500">Topic: Data Structures</span>
            <span className="text-sm font-medium text-slate-500">Unit 2 • Marks: 6</span>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list</em>.</p>
            
            <h3 className="mt-8 font-bold">Example 1:</h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">
              <span className="text-slate-500">Input:</span> head = [1,2,3,4,5]<br />
              <span className="text-slate-500">Output:</span> [5,4,3,2,1]
            </div>

            <h3 className="mt-8 font-bold">Example 2:</h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">
              <span className="text-slate-500">Input:</span> head = [1,2]<br />
              <span className="text-slate-500">Output:</span> [2,1]
            </div>

            <h3 className="mt-8 font-bold">Constraints:</h3>
            <ul>
              <li>The number of nodes in the list is the range <code>[0, 5000]</code>.</li>
              <li><code>-5000 &lt;= Node.val &lt;= 5000</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel: Editor & Terminal */}
      <div className="flex w-1/2 flex-col gap-4">
        
        {/* Editor */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-2">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
              <Settings className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 p-2">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            />
          </div>
        </div>

        {/* Terminal */}
        <div className="flex h-64 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-4 py-2 dark:border-slate-800/80 dark:bg-slate-950/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Terminal className="h-4 w-4" /> Test Cases / Output
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleRunCode(false)}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run
              </button>
              <button 
                onClick={() => handleRunCode(true)}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-500 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Submit
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {executionResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-1 text-xs font-bold ${
                    executionResult.status === 'ACCEPTED' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                  }`}>
                    {executionResult.status.replace('_', ' ')}
                  </span>
                  {executionResult.executionTimeMs && (
                    <span className="text-xs font-medium text-slate-500">
                      {executionResult.executionTimeMs}ms • {executionResult.memoryUsedKb} KB
                    </span>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">Output Log</p>
                  <pre className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 whitespace-pre-wrap">
                    {executionResult.output}
                  </pre>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-white">Case 1</button>
                  <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50">Case 2</button>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-500">Input =</p>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">
                      head = [1,2,3,4,5]
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-500">Expected Output =</p>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">
                      [5,4,3,2,1]
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
