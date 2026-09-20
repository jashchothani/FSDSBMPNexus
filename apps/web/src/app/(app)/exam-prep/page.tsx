'use client';

import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  ArrowRight,
  Flame,
  Sparkles
} from 'lucide-react';

export default function ExamPrepPage() {
  const [activeQuiz, setActiveQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const sampleQuestions = [
    {
      q: 'Which algorithm guarantees a time complexity of O(n log n) in the worst-case for sorting?',
      options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Insertion Sort'],
      correct: 1,
      explanation: 'Merge Sort divides the array into sub-arrays recursively and merges them in O(n log n) worst-case time.',
    },
    {
      q: 'In Database Systems, BCNF is stricter than which normal form?',
      options: ['1NF', '2NF', '3NF', 'All of the above'],
      correct: 3,
      explanation: 'BCNF is a stricter extension of 3NF (and thus also satisfies 1NF and 2NF).',
    },
    {
      q: 'What is the balance factor condition for a binary search tree to remain an AVL tree?',
      options: ['-1, 0, or +1', '0 or +1 only', '-2 or +2', 'Strictly 0'],
      correct: 0,
      explanation: 'The height difference between left and right subtrees of any node in an AVL tree must be at most 1.',
    },
  ];

  const handleSelect = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (selectedOption === sampleQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < sampleQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setActiveQuiz(false);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-emerald-400" />
            Exam Prep & Interactive Quiz Engine
          </h1>
          <p className="text-xs text-slate-400">
            Practice MSBTE high-frequency questions under timed exam conditions with instant AI diagnostics
          </p>
        </div>
      </div>

      {!activeQuiz ? (
        /* Quiz Selection Grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Data Structures & Algorithms Mock',
              questions: '10 Questions',
              time: '15 Mins',
              difficulty: 'Medium',
              subject: 'DSA (Paper 22316)',
            },
            {
              title: 'DBMS Normalization & SQL Test',
              questions: '8 Questions',
              time: '12 Mins',
              difficulty: 'Hard',
              subject: 'DBMS (Paper 22412)',
            },
            {
              title: 'Operating Systems Process Scheduling Drill',
              questions: '12 Questions',
              time: '18 Mins',
              difficulty: 'Easy',
              subject: 'OS (Paper 22517)',
            },
          ].map((quiz, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2 inline-block">
                  {quiz.subject}
                </span>
                <h3 className="text-sm font-bold text-white mb-2">{quiz.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 font-mono">
                  <span>{quiz.questions}</span>
                  <span>•</span>
                  <span>⏱️ {quiz.time}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveQuiz(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Start Practice Test</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : quizFinished ? (
        /* Quiz Results Screen */
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center max-w-xl mx-auto space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
            <Award className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Quiz Completed!</h2>
          <p className="text-sm text-slate-300">
            You scored <strong className="text-emerald-400">{score}</strong> out of {sampleQuestions.length} ({Math.round((score / sampleQuestions.length) * 100)}%)
          </p>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 text-left space-y-1">
            <span className="font-bold text-emerald-400 block mb-1">NexusAI Diagnostic:</span>
            <p>Your understanding of sorting algorithms is solid! Focus next on AVL tree balance rotations for maximum marks in Section B.</p>
          </div>

          <button
            onClick={resetQuiz}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake Another Test</span>
          </button>
        </div>
      ) : (
        /* Active Quiz Screen */
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <span className="text-slate-400 font-medium">
              Question <strong className="text-white">{currentQuestion + 1}</strong> of {sampleQuestions.length}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-semibold flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              14:22 Left
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-white leading-relaxed">
            {sampleQuestions[currentQuestion].q}
          </h2>

          <div className="space-y-2.5">
            {sampleQuestions[currentQuestion].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full p-3.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                  selectedOption === idx
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end border-t border-slate-800 pt-4">
            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md"
            >
              <span>{currentQuestion + 1 === sampleQuestions.length ? 'Submit Quiz' : 'Next Question'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
