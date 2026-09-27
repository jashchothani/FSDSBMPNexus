import { Router, Request, Response } from 'express';
import { Problem, Submission, Room, RoomMember, Match, Leaderboard, User, XPTransaction, Achievement, UserAchievement } from '@repo/database';

export const arenaRoutes = Router();

// ============================================================
// PROBLEMS
// ============================================================

// GET /arena/problems — List problems with filters
arenaRoutes.get('/problems', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, topic, difficulty, semester, unit, page = '1', limit = '20', search } = req.query;
    
    const filter: any = {};
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = (difficulty as string).toUpperCase();
    if (semester) filter.semester = Number(semester);
    if (unit) filter.unit = Number(unit);
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    
    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .select('problemId title difficulty subject topic semester unit marks solveCount attemptCount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Problem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: problems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch problems' });
  }
});

// GET /arena/problems/:problemId — Get single problem
arenaRoutes.get('/problems/:problemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findOne({ problemId: req.params.problemId });
    if (!problem) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }
    
    const safeProblem = problem.toJSON();
    safeProblem.testCases = safeProblem.testCases.map((tc: any) => 
      tc.isHidden ? { isHidden: true, input: '', expectedOutput: '' } : tc
    );

    res.json({ success: true, data: safeProblem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch problem' });
  }
});

// GET /arena/problems/subjects — Get all unique subjects for filters
arenaRoutes.get('/subjects', async (_req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await Problem.distinct('subject');
    const topics = await Problem.aggregate([
      { $group: { _id: { subject: '$subject', topic: '$topic' } } },
      { $group: { _id: '$_id.subject', topics: { $push: '$_id.topic' } } },
    ]);
    res.json({ success: true, data: { subjects, topicsBySubject: topics } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch subjects' });
  }
});

// ============================================================
// CODE EXECUTION & SUBMISSIONS
// ============================================================

// POST /arena/execute — Run code (mocked engine)
arenaRoutes.post('/execute', async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, code, language, isSubmit } = req.body;
    
    const problem = await Problem.findOne({ problemId });
    if (!problem) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }

    // Simulate execution (in production, use Judge0 / Piston / Docker runner)
    const executionTimeMs = Math.floor(Math.random() * 50) + 10;
    const memoryUsedKb = Math.floor(Math.random() * 5000) + 1000;
    const isAccepted = code.length > 50;
    
    const result = {
      status: isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER',
      passedCount: isAccepted ? problem.testCases.length : Math.floor(problem.testCases.length / 2),
      totalCount: problem.testCases.length,
      executionTimeMs,
      memoryUsedKb,
      output: isAccepted 
        ? `All ${problem.testCases.length} test cases passed!\nExecution Time: ${executionTimeMs}ms | Memory: ${memoryUsedKb}KB`
        : `Failed at Test Case ${Math.floor(problem.testCases.length / 2) + 1}.\nExpected: ${problem.testCases[0]?.expectedOutput || '[2,1]'}\nGot: different output`,
    };

    // If submitting, persist to DB and award XP
    if (isSubmit && req.body.userId) {
      const submission = await Submission.create({
        userId: req.body.userId,
        problemId: problem._id,
        code,
        language,
        status: result.status,
        executionTimeMs,
        memoryUsedKb,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
      });

      // Update problem stats
      await Problem.findByIdAndUpdate(problem._id, {
        $inc: { attemptCount: 1, ...(isAccepted ? { solveCount: 1 } : {}) },
      });

      // Award XP if accepted
      if (isAccepted && req.body.userId) {
        const xpAmount = problem.difficulty === 'EASY' ? 50 : problem.difficulty === 'MEDIUM' ? 100 : 200;
        
        await XPTransaction.create({
          userId: req.body.userId,
          amount: xpAmount,
          source: 'PROBLEM_SOLVE',
          description: `Solved: ${problem.title}`,
          referenceId: submission._id.toString(),
        });

        await User.findByIdAndUpdate(req.body.userId, {
          $inc: { 
            'gamification.xp': xpAmount,
            'gamification.problemsSolved': 1,
          },
        });

        (result as any).xpAwarded = xpAmount;
      }
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Execution failed' });
  }
});

// GET /arena/submissions — User's submission history
arenaRoutes.get('/submissions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, problemId, page = '1', limit = '20' } = req.query;
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (problemId) filter.problemId = problemId;

    const skip = (Number(page) - 1) * Number(limit);
    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate('problemId', 'problemId title difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Submission.countDocuments(filter),
    ]);

    res.json({ success: true, data: submissions, pagination: { page: Number(page), total } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

// ============================================================
// ROOMS
// ============================================================

// POST /arena/rooms — Create room
arenaRoutes.post('/rooms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, type, privacy, hostId, maxParticipants } = req.body;

    const room = await Room.create({
      name,
      description,
      type: type || 'STUDY',
      privacy: privacy || 'PUBLIC',
      hostId,
      maxParticipants: maxParticipants || 50,
    });

    // Add host as member
    await RoomMember.create({
      roomId: room._id,
      userId: hostId,
      role: 'HOST',
      status: 'ONLINE',
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create room' });
  }
});

// GET /arena/rooms — List active rooms
arenaRoutes.get('/rooms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, privacy, status = 'WAITING,ACTIVE' } = req.query;
    const filter: any = { status: { $in: (status as string).split(',') } };
    if (type) filter.type = type;
    if (privacy) filter.privacy = privacy;

    const rooms = await Room.find(filter)
      .populate('hostId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get member counts for each room
    const roomIds = rooms.map(r => r._id);
    const memberCounts = await RoomMember.aggregate([
      { $match: { roomId: { $in: roomIds }, status: 'ONLINE' } },
      { $group: { _id: '$roomId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(memberCounts.map(m => [m._id.toString(), m.count]));
    const roomsWithCounts = rooms.map(r => ({
      ...r.toJSON(),
      memberCount: countMap.get(r._id.toString()) || 0,
    }));

    res.json({ success: true, data: roomsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch rooms' });
  }
});

// GET /arena/rooms/:id — Room detail
arenaRoutes.get('/rooms/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id).populate('hostId', 'firstName lastName avatar');
    if (!room) {
      res.status(404).json({ success: false, error: 'Room not found' });
      return;
    }

    const members = await RoomMember.find({ roomId: room._id, status: 'ONLINE' })
      .populate('userId', 'firstName lastName avatar gamification.rating');

    res.json({ success: true, data: { ...room.toJSON(), members } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch room' });
  }
});

// POST /arena/rooms/:id/join — Join room
arenaRoutes.post('/rooms/:id/join', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ success: false, error: 'Room not found' });
      return;
    }

    const existingMember = await RoomMember.findOne({ roomId: room._id, userId });
    if (existingMember) {
      existingMember.status = 'ONLINE';
      existingMember.leftAt = undefined;
      await existingMember.save();
    } else {
      await RoomMember.create({ roomId: room._id, userId, role: 'MEMBER', status: 'ONLINE' });
    }

    res.json({ success: true, data: { message: 'Joined room successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to join room' });
  }
});

// ============================================================
// LEADERBOARD
// ============================================================

// GET /arena/leaderboard — Global + per-subject leaderboards
arenaRoutes.get('/leaderboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, sortBy = 'rating', page = '1', limit = '50' } = req.query;
    const filter: any = {};
    if (subject) filter.subject = subject;

    const sortField = sortBy === 'xp' ? { xp: -1 } : { rating: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const entries = await Leaderboard.find(filter)
      .populate('userId', 'firstName lastName avatar gamification')
      .sort(sortField as any)
      .skip(skip)
      .limit(Number(limit));

    // Add rank numbers
    const ranked = entries.map((entry, i) => ({
      ...entry.toJSON(),
      rank: skip + i + 1,
    }));

    const total = await Leaderboard.countDocuments(filter);

    res.json({ success: true, data: ranked, pagination: { page: Number(page), total } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// ============================================================
// USER STATS
// ============================================================

// GET /arena/stats/:userId — User's skill map, progress, streaks
arenaRoutes.get('/stats/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select('firstName lastName avatar gamification');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Get solved problems by subject
    const solvedBySubject = await Submission.aggregate([
      { $match: { userId: user._id, status: 'ACCEPTED' } },
      { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'problem' } },
      { $unwind: '$problem' },
      { $group: { _id: '$problem.subject', solved: { $addToSet: '$problemId' }, totalAttempts: { $sum: 1 } } },
      { $project: { subject: '$_id', solvedCount: { $size: '$solved' }, totalAttempts: 1 } },
    ]);

    // Get total problems per subject
    const totalBySubject = await Problem.aggregate([
      { $group: { _id: '$subject', total: { $sum: 1 } } },
    ]);
    const totalMap = new Map(totalBySubject.map(s => [s._id, s.total]));

    const skillMap = solvedBySubject.map(s => ({
      subject: s.subject,
      solved: s.solvedCount,
      total: totalMap.get(s.subject) || 0,
      percentage: Math.round((s.solvedCount / (totalMap.get(s.subject) || 1)) * 100),
    }));

    // Get recent XP transactions
    const recentXP = await XPTransaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get achievements
    const achievements = await UserAchievement.find({ userId: req.params.userId })
      .populate('achievementId');

    // Get match history
    const recentMatches = await Match.find({ 'players.userId': req.params.userId, status: 'FINISHED' })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        skillMap,
        recentXP,
        achievements,
        recentMatches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ============================================================
// CHAT (REST endpoints for history)
// ============================================================

// GET /arena/chat/conversations — User's conversations
arenaRoutes.get('/chat/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }

    const conversations = await (await import('@repo/database')).Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .limit(50);

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// GET /arena/chat/conversations/:id/messages — Message history
arenaRoutes.get('/chat/conversations/:id/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await (await import('@repo/database')).Message.find({
      conversationId: req.params.id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});
