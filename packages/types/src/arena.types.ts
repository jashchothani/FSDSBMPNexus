export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IProblem {
  _id: string;
  problemId: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  subject: string;
  topic: string;
  semester: number;
  unit: number;
  marks: number;
  concept: string;
  supportedLanguages: string[];
  constraints: string;
  hints: string[];
  editorial?: string;
  starterCode?: Record<string, string>;
  testCases: ITestCase[];
  solveCount: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmission {
  _id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'COMPILE_ERROR' | 'RUNTIME_ERROR';
  executionTimeMs?: number;
  memoryUsedKb?: number;
  passedCount: number;
  totalCount: number;
  roomId?: string;
  matchId?: string;
  xpAwarded?: number;
  createdAt: Date;
}

export interface IMatch {
  _id: string;
  matchId: string;
  type: '1V1' | 'TEAM' | 'SURVIVAL';
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  players: {
    userId: string;
    rating: number;
    score: number;
    code?: string;
    submittedAt?: Date;
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'PENDING';
  }[];
  problemId?: string;
  winnerId?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds: number;
  roomId?: string;
  createdAt: Date;
}

export interface IAchievement {
  _id: string;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: 'STREAK' | 'CLASH' | 'PRACTICE' | 'SOCIAL' | 'MILESTONE';
  criteria: {
    type: string;
    value: number;
  };
  xpReward: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface IUserAchievement {
  _id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
}

export interface IXPTransaction {
  _id: string;
  userId: string;
  amount: number;
  source: 'PROBLEM_SOLVE' | 'CLASH_WIN' | 'CLASH_LOSS' | 'DAILY_CHALLENGE' | 'STREAK_BONUS' | 'ACHIEVEMENT' | 'QUIZ';
  description: string;
  referenceId?: string;
  createdAt: Date;
}

export interface ILeaderboardEntry {
  _id: string;
  userId: string;
  subject?: string;
  rating: number;
  xp: number;
  solvedCount: number;
  winCount: number;
  rank?: number;
  updatedAt: Date;
}
