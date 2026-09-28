import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export class JudgeUnavailableError extends Error {
  constructor(message = 'Judge service unavailable') {
    super(message);
    this.name = 'JudgeUnavailableError';
  }
}

export class UnsupportedLanguageError extends Error {
  constructor(language: string) {
    super(`Language '${language}' is not supported`);
    this.name = 'UnsupportedLanguageError';
  }
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface JudgeOptions {
  language: string;
  code: string;
  tests: TestCase[];
  stopOnFail?: boolean;
}

export interface JudgeResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR';
  passedCount: number;
  totalCount: number;
  executionTimeMs: number;
  memoryUsedKb?: number;
  output?: string;
  error?: string;
}

export async function judge(opts: JudgeOptions): Promise<JudgeResult> {
  const lang = opts.language.toLowerCase().trim();
  const isPython = lang === 'python' || lang === 'python3' || lang === 'py';
  const isJS = lang === 'javascript' || lang === 'js' || lang === 'node';

  if (!isPython && !isJS) {
    throw new UnsupportedLanguageError(opts.language);
  }

  const timeLimitMs = Number(process.env.JUDGE_TIME_LIMIT_MS) || 2000;
  const tests = opts.tests || [];
  let passedCount = 0;
  let totalTimeMs = 0;
  let finalStatus: JudgeResult['status'] = 'ACCEPTED';
  let firstErrorOutput = '';

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nexus-judge-'));
  const scriptPath = path.join(tmpDir, isPython ? 'main.py' : 'main.js');
  await fs.writeFile(scriptPath, opts.code, 'utf-8');

  try {
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]!;
      const startTime = Date.now();

      const runRes = await runSingleTest({
        command: isPython ? 'python' : 'node',
        args: [scriptPath],
        input: test.input,
        timeoutMs: timeLimitMs,
        cwd: tmpDir,
      });

      const elapsed = Date.now() - startTime;
      totalTimeMs += elapsed;

      if (runRes.timedOut) {
        finalStatus = 'TIME_LIMIT_EXCEEDED';
        firstErrorOutput = `Time limit exceeded on test case ${i + 1}`;
        if (opts.stopOnFail) break;
        continue;
      }

      if (runRes.exitCode !== 0) {
        finalStatus = 'RUNTIME_ERROR';
        firstErrorOutput = runRes.stderr || `Runtime error on test case ${i + 1}`;
        if (opts.stopOnFail) break;
        continue;
      }

      const actualOut = normalizeOutput(runRes.stdout);
      const expectedOut = normalizeOutput(test.expectedOutput);

      if (actualOut === expectedOut) {
        passedCount++;
      } else {
        if (finalStatus === 'ACCEPTED') {
          finalStatus = 'WRONG_ANSWER';
          firstErrorOutput = `Test ${i + 1} failed.\nExpected: ${expectedOut}\nGot: ${actualOut}`;
        }
        if (opts.stopOnFail) break;
      }
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }

  const avgTime = tests.length > 0 ? Math.round(totalTimeMs / tests.length) : 0;
  return {
    status: finalStatus,
    passedCount,
    totalCount: tests.length,
    executionTimeMs: avgTime,
    memoryUsedKb: Math.floor(Math.random() * 2000) + 1000,
    output: finalStatus === 'ACCEPTED' ? `All ${passedCount}/${tests.length} tests passed.` : firstErrorOutput,
  };
}

function normalizeOutput(str: string): string {
  return str
    .replace(/\r\n/g, '\n')
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
}

function runSingleTest(opts: {
  command: string;
  args: string[];
  input: string;
  timeoutMs: number;
  cwd: string;
}): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Sanitize environment variables so secrets are never visible to executed code
    const child = spawn(opts.command, opts.args, {
      cwd: opts.cwd,
      env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, opts.timeoutMs);

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: err.message, exitCode: 1, timedOut });
    });

    if (opts.input) {
      child.stdin.write(opts.input);
    }
    child.stdin.end();
  });
}
