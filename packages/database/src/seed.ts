/**
 * Seed script for development/demo data.
 * ⚠️ ALL DATA CREATED HERE IS CLEARLY DEVELOPMENT/DEMO DATA.
 * Do NOT run this in production.
 *
 * Usage: pnpm --filter @repo/database seed
 */

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './connection.js';
import { University, College, Department, Course, Branch, Subject, Unit, Topic } from './models/university.model.js';
import { User } from './models/user.model.js';
import { Paper } from './models/paper.model.js';
import { Question } from './models/question.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sbmpnexus';

async function seed() {
  console.log('🌱 Starting seed...');
  console.log('⚠️  This creates DEVELOPMENT/DEMO data only.\n');

  await connectDB(MONGODB_URI);

  // Clear existing data
  await Promise.all([
    University.deleteMany({}),
    College.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    Branch.deleteMany({}),
    Subject.deleteMany({}),
    Unit.deleteMany({}),
    Topic.deleteMany({}),
    Paper.deleteMany({}),
    Question.deleteMany({}),
  ]);

  // ---- University ----
  const university = await University.create({
    name: '[DEMO] Maharashtra Technical University',
    slug: 'demo-mtu',
    abbreviation: 'MTU',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    website: 'https://example.com',
    isActive: true,
  });

  // ---- College ----
  const college = await College.create({
    name: '[DEMO] Institute of Engineering & Technology',
    slug: 'demo-iet',
    universityId: university._id,
    location: { city: 'Mumbai', state: 'Maharashtra' },
    isActive: true,
  });

  // ---- Department ----
  const csDept = await Department.create({
    name: 'Computer Science & Engineering',
    slug: 'cse',
    collegeId: college._id,
    isActive: true,
  });

  // ---- Course ----
  const btech = await Course.create({
    name: 'Bachelor of Technology',
    slug: 'btech',
    abbreviation: 'B.Tech',
    departmentId: csDept._id,
    durationYears: 4,
    totalSemesters: 8,
    isActive: true,
  });

  // ---- Branch ----
  const cseBranch = await Branch.create({
    name: 'Computer Science & Engineering',
    slug: 'cse',
    abbreviation: 'CSE',
    courseId: btech._id,
    isActive: true,
  });

  // ---- Subjects (Semester 3 & 4) ----
  const subjects = await Subject.insertMany([
    {
      name: 'Database Management Systems',
      slug: 'dbms',
      code: 'CS301',
      branchId: cseBranch._id,
      semester: 3,
      credits: 4,
      description: 'Fundamentals of database design, SQL, normalization, transactions, and recovery.',
      isActive: true,
    },
    {
      name: 'Operating Systems',
      slug: 'operating-systems',
      code: 'CS302',
      branchId: cseBranch._id,
      semester: 3,
      credits: 4,
      description: 'Process management, memory management, file systems, and synchronization.',
      isActive: true,
    },
    {
      name: 'Data Structures & Algorithms',
      slug: 'dsa',
      code: 'CS303',
      branchId: cseBranch._id,
      semester: 3,
      credits: 4,
      description: 'Arrays, linked lists, trees, graphs, sorting, searching, and complexity analysis.',
      isActive: true,
    },
    {
      name: 'Computer Networks',
      slug: 'computer-networks',
      code: 'CS401',
      branchId: cseBranch._id,
      semester: 4,
      credits: 4,
      description: 'OSI model, TCP/IP, routing, network security, and protocols.',
      isActive: true,
    },
    {
      name: 'Software Engineering',
      slug: 'software-engineering',
      code: 'CS402',
      branchId: cseBranch._id,
      semester: 4,
      credits: 3,
      description: 'SDLC models, requirements engineering, testing, and project management.',
      isActive: true,
    },
  ]);

  const dbms = subjects[0]!;
  const os = subjects[1]!;

  // ---- Units for DBMS ----
  const dbmsUnits = await Unit.insertMany([
    { name: 'Introduction to DBMS', number: 1, subjectId: dbms._id, isActive: true },
    { name: 'Relational Model & SQL', number: 2, subjectId: dbms._id, isActive: true },
    { name: 'Normalization', number: 3, subjectId: dbms._id, isActive: true },
    { name: 'Transaction Management', number: 4, subjectId: dbms._id, isActive: true },
    { name: 'Recovery & Concurrency', number: 5, subjectId: dbms._id, isActive: true },
  ]);

  // ---- Topics for DBMS ----
  const dbmsTopics = await Topic.insertMany([
    { name: 'ER Model', slug: 'er-model', unitId: dbmsUnits[0]!._id, subjectId: dbms._id, isActive: true },
    { name: 'Relational Algebra', slug: 'relational-algebra', unitId: dbmsUnits[1]!._id, subjectId: dbms._id, isActive: true },
    { name: 'SQL Queries', slug: 'sql-queries', unitId: dbmsUnits[1]!._id, subjectId: dbms._id, isActive: true },
    { name: 'Functional Dependencies', slug: 'functional-dependencies', unitId: dbmsUnits[2]!._id, subjectId: dbms._id, isActive: true },
    { name: 'Normal Forms', slug: 'normal-forms', unitId: dbmsUnits[2]!._id, subjectId: dbms._id, isActive: true },
    { name: 'ACID Properties', slug: 'acid-properties', unitId: dbmsUnits[3]!._id, subjectId: dbms._id, isActive: true },
    { name: 'Concurrency Control', slug: 'concurrency-control', unitId: dbmsUnits[4]!._id, subjectId: dbms._id, isActive: true },
    { name: 'Deadlock', slug: 'deadlock', unitId: dbmsUnits[4]!._id, subjectId: dbms._id, isActive: true },
  ]);

  // ---- Units for OS ----
  const osUnits = await Unit.insertMany([
    { name: 'Introduction to OS', number: 1, subjectId: os._id, isActive: true },
    { name: 'Process Management', number: 2, subjectId: os._id, isActive: true },
    { name: 'Memory Management', number: 3, subjectId: os._id, isActive: true },
    { name: 'File Systems', number: 4, subjectId: os._id, isActive: true },
  ]);

  // ---- Demo Questions (showing repeated question detection) ----
  const acidTopic = dbmsTopics[5]!;
  const normalFormsTopic = dbmsTopics[4]!;

  await Question.insertMany([
    {
      text: 'Explain ACID properties of a transaction.',
      subjectId: dbms._id,
      unitId: dbmsUnits[3]!._id,
      topicIds: [acidTopic._id],
      marks: 5,
      questionType: 'LONG_ANSWER',
      difficulty: 'MEDIUM',
      year: 2022,
      examType: 'END_SEM',
      frequency: 3,
      tags: ['acid', 'transactions'],
      isVerified: true,
    },
    {
      text: 'Explain ACID properties with a suitable example.',
      subjectId: dbms._id,
      unitId: dbmsUnits[3]!._id,
      topicIds: [acidTopic._id],
      marks: 10,
      questionType: 'LONG_ANSWER',
      difficulty: 'MEDIUM',
      year: 2023,
      examType: 'END_SEM',
      frequency: 3,
      tags: ['acid', 'transactions'],
      isVerified: true,
    },
    {
      text: 'What are ACID properties? Explain each with an example.',
      subjectId: dbms._id,
      unitId: dbmsUnits[3]!._id,
      topicIds: [acidTopic._id],
      marks: 5,
      questionType: 'LONG_ANSWER',
      difficulty: 'MEDIUM',
      year: 2024,
      examType: 'END_SEM',
      frequency: 3,
      tags: ['acid', 'transactions'],
      isVerified: true,
    },
    {
      text: 'Explain different normal forms (1NF, 2NF, 3NF, BCNF) with examples.',
      subjectId: dbms._id,
      unitId: dbmsUnits[2]!._id,
      topicIds: [normalFormsTopic._id],
      marks: 10,
      questionType: 'LONG_ANSWER',
      difficulty: 'HARD',
      year: 2023,
      examType: 'END_SEM',
      frequency: 2,
      tags: ['normalization', 'normal-forms'],
      isVerified: true,
    },
    {
      text: 'Define normalization. Explain 1NF, 2NF, 3NF with suitable examples.',
      subjectId: dbms._id,
      unitId: dbmsUnits[2]!._id,
      topicIds: [normalFormsTopic._id],
      marks: 10,
      questionType: 'LONG_ANSWER',
      difficulty: 'HARD',
      year: 2024,
      examType: 'END_SEM',
      frequency: 2,
      tags: ['normalization', 'normal-forms'],
      isVerified: true,
    },
    {
      text: 'Write SQL queries for the following operations on a Student table.',
      subjectId: dbms._id,
      unitId: dbmsUnits[1]!._id,
      topicIds: [dbmsTopics[2]!._id],
      marks: 5,
      questionType: 'SHORT_ANSWER',
      difficulty: 'EASY',
      year: 2024,
      examType: 'MID_SEM',
      frequency: 1,
      tags: ['sql'],
      isVerified: true,
    },
  ]);

  // ---- Demo Admin User ----
  // Note: password is hashed with bcrypt in the actual auth system.
  // This is just a placeholder — real auth creates users through the API.
  await User.create({
    email: 'admin@sbmpnexus.dev',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    authProvider: 'LOCAL',
    isEmailVerified: true,
    isActive: true,
    preferences: {
      theme: 'system',
      notifications: {
        newPaper: true,
        contributorApproval: true,
        studyReminders: true,
        quizResults: true,
        examCountdown: true,
        announcements: true,
      },
    },
    gamification: {
      xp: 0,
      streak: 0,
      longestStreak: 0,
      badges: [],
      papersViewed: 0,
      questionsSolved: 0,
      quizzesCompleted: 0,
    },
  });

  console.log('\n✅ Seed completed successfully!');
  console.log(`   Universities: 1`);
  console.log(`   Colleges: 1`);
  console.log(`   Departments: 1`);
  console.log(`   Courses: 1`);
  console.log(`   Branches: 1`);
  console.log(`   Subjects: ${subjects.length}`);
  console.log(`   Units: ${dbmsUnits.length + osUnits.length}`);
  console.log(`   Topics: ${dbmsTopics.length}`);
  console.log(`   Questions: 6`);
  console.log(`   Users: 1 (admin)`);

  await disconnectDB();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
