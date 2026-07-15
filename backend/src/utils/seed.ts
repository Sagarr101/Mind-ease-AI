import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Mood } from '../models/Mood';
import { Journal } from '../models/Journal';
import { MeditationSession } from '../models/Meditation';
import { WellnessReport } from '../models/Report';
import { Notification } from '../models/Notification';
import { ChatMessage } from '../models/ChatMessage';

dotenv.config();

const SEED_USER_EMAIL = 'seeker@mindease.ai';
const ADMIN_USER_EMAIL = 'admin@mindease.ai';

const cleanDatabase = async () => {
  console.log('Cleaning existing collection data...');
  await User.deleteMany({});
  await Mood.deleteMany({});
  await Journal.deleteMany({});
  await MeditationSession.deleteMany({});
  await WellnessReport.deleteMany({});
  await Notification.deleteMany({});
  await ChatMessage.deleteMany({});
  console.log('Database cleaned.');
};

const createUsers = async () => {
  console.log('Creating seed users...');
  const salt = await bcrypt.genSalt(10);
  
  const seekerPassword = await bcrypt.hash('password123', salt);
  const adminPassword = await bcrypt.hash('adminpassword', salt);

  const user = await User.create({
    username: 'wellness_seeker',
    email: SEED_USER_EMAIL,
    passwordHash: seekerPassword,
    role: 'user',
    streak: {
      current: 5,
      longest: 18,
      lastActive: new Date(),
    },
  });

  const admin = await User.create({
    username: 'admin_therapist',
    email: ADMIN_USER_EMAIL,
    passwordHash: adminPassword,
    role: 'admin',
    streak: {
      current: 1,
      longest: 1,
      lastActive: new Date(),
    },
  });

  console.log(`Users created: Seeker ID = ${user._id}, Admin ID = ${admin._id}`);
  return { user, admin };
};

const seedHistoricalData = async (user: any) => {
  console.log('Seeding 60 days of historical data...');
  const now = new Date();
  
  const moodJournalPrompts = [
    { title: "Finding Quiet in Chaos", content: "Today was incredibly fast-paced. Felt overwhelmed by meetings, but took 5 minutes to breathe in the afternoon which helped reset my focus. Grateful for the progress made.", sentiment: "Positive" as const },
    { title: "Dealing with Heavy Anxiety", content: "Woke up with a tight chest and a general sense of dread. Tried to pinpoint the source but couldn't. Decided to focus on small chores to ground myself. It was a tough, anxious day.", sentiment: "Negative" as const },
    { title: "Midweek Energy Slump", content: "Feeling quite exhausted and low energy. Work is winding down, but I have little motivation to exercise. Think I just need a long sleep tonight.", sentiment: "Negative" as const },
    { title: "A Joyful Walk and Fresh Air", content: "Had a wonderful walk in the park today after work. The weather was perfect and the trees are starting to bloom. It's amazing how much a little nature can shift my mindset.", sentiment: "Positive" as const },
    { title: "Uncertainty and Planning", content: "Spent the morning planning the upcoming month. A lot of unknowns which usually makes me nervous, but writing them out in bullet points helped clear the mental fog. Feeling neutral.", sentiment: "Neutral" as const },
    { title: "Reflections on Friendship", content: "Caught up with an old friend over coffee. It was so comforting to laugh about old memories and realize that even with distance, the bond is strong. Feeling connected and happy.", sentiment: "Positive" as const },
    { title: "Frustrated by Tech Issues", content: "Spent three hours trying to fix a software bug. Felt so angry and ready to throw my laptop. Had to walk away. Realized I was linking my self-worth to my speed of fixing it.", sentiment: "Negative" as const }
  ];

  const meditationsList = [
    { title: "Deep Sleep relaxation", duration: 15 },
    { title: "5-Min Breathing Focus", duration: 5 },
    { title: "Body Scan Meditation", duration: 10 },
    { title: "Mindful Walk Guide", duration: 12 },
    { title: "Stress Release Session", duration: 15 },
    { title: "Loving-Kindness Meditation", duration: 8 }
  ];

  const moodPool = [
    { score: 5, tags: ['happy', 'calm', 'productive', 'inspired'], notes: ["Had an excellent day! Everything went smoothly and felt very connected to my goals.", "Felt inspired and full of energy. Finished a major project!"] },
    { score: 4, tags: ['good', 'calm', 'rested', 'social'], notes: ["Good day. Spent nice time chatting with colleagues, slept well last night.", "Felt peaceful and content. Managed my workload effectively."] },
    { score: 3, tags: ['tired', 'busy', 'neutral', 'calm'], notes: ["Just a normal busy day. A bit tired but overall fine.", "Neutral feelings. Got work done but didn't have much time for rest."] },
    { score: 2, tags: ['anxious', 'sad', 'stressed', 'tired'], notes: ["A bit anxious about future deadlines. Felt isolated in the evening.", "Felt stressed and rushed. Need to establish better boundaries."] },
    { score: 1, tags: ['stressed', 'anxious', 'sad', 'angry', 'lonely'], notes: ["Extremely difficult day. Felt completely overwhelmed and lonely.", "Felt low all day. Everything felt like a struggle."] }
  ];

  // Seed daily entries
  for (let i = 60; i >= 0; i--) {
    const targetDate = new Date(now.getTime());
    targetDate.setDate(now.getDate() - i);
    
    // 1. Seed Mood Log (80% probability)
    if (Math.random() < 0.85 || i === 0) {
      // Pick a random mood index, biased slightly toward better moods
      const moodIndex = Math.floor(Math.random() * 5); // 0 (5 stars) to 4 (1 star)
      const moodItem = moodPool[moodIndex];
      const note = moodItem.notes[Math.floor(Math.random() * moodItem.notes.length)];

      await Mood.create({
        userId: user._id,
        score: moodItem.score,
        tags: moodItem.tags,
        note,
        loggedAt: targetDate,
      });
    }

    // 2. Seed Journal (30% probability)
    if (Math.random() < 0.35) {
      const template = moodJournalPrompts[Math.floor(Math.random() * moodJournalPrompts.length)];
      await Journal.create({
        userId: user._id,
        title: template.title,
        content: template.content,
        moodScore: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5
        sentiment: template.sentiment,
        createdAt: targetDate,
        updatedAt: targetDate,
      });
    }

    // 3. Seed Meditation Session (40% probability)
    if (Math.random() < 0.45) {
      const medItem = meditationsList[Math.floor(Math.random() * meditationsList.length)];
      await MeditationSession.create({
        userId: user._id,
        title: medItem.title,
        durationMinutes: medItem.duration,
        completedAt: targetDate,
      });
    }
  }

  // 4. Seed weekly report summaries (8 reports for 60 days)
  for (let w = 8; w >= 1; w--) {
    const reportEndDate = new Date(now.getTime());
    reportEndDate.setDate(now.getDate() - (w - 1) * 7);
    const reportStartDate = new Date(reportEndDate.getTime());
    reportStartDate.setDate(reportEndDate.getDate() - 7);

    // Calculate actual counts inside the ranges
    const mLogs = await Mood.find({ userId: user._id, loggedAt: { $gte: reportStartDate, $lte: reportEndDate } });
    const meds = await MeditationSession.find({ userId: user._id, completedAt: { $gte: reportStartDate, $lte: reportEndDate } });
    const jCount = await Journal.countDocuments({ userId: user._id, createdAt: { $gte: reportStartDate, $lte: reportEndDate } });

    const avgMood = mLogs.length > 0 
      ? parseFloat((mLogs.reduce((acc, curr) => acc + curr.score, 0) / mLogs.length).toFixed(1)) 
      : 3.5;

    const medMinutes = meds.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const reportInsights = `### Weekly Summary - Week ${9 - w}
- **Average Mood Score:** ${avgMood}/5.0
- **Total Meditation Minutes:** ${medMinutes} minutes
- **Journals Written:** ${jCount} entries

**AI Wellness Analysis:**
Your mood averages represent a stable emotional baseline. You logged healthy sessions of self-reflection and breathing exercises. Based on your inputs, practicing cognitive reframing in times of stress has significantly reduced feelings of anxiety. Keep up this wonderful habit.`;

    await WellnessReport.create({
      userId: user._id,
      startDate: reportStartDate,
      endDate: reportEndDate,
      averageMood: avgMood,
      meditationTotalMinutes: medMinutes,
      journalsWritten: jCount,
      insights: reportInsights,
      createdAt: reportEndDate,
    });
  }

  // 5. Seed Welcome Notifications
  await Notification.create([
    {
      userId: user._id,
      title: 'Welcome to MindEase AI! 🌿',
      message: 'Your workspace is setup. Log your mood or try talking to the AI Therapist.',
      read: true,
      type: 'system',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    },
    {
      userId: user._id,
      title: 'First Streak Unlocked! 🔥',
      message: 'You have logged your mood 3 days in a row. Incredible consistency!',
      read: false,
      type: 'streak',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: user._id,
      title: 'Weekly Wellness Report Ready 📊',
      message: 'Your report for last week has been generated. Open reports to view deep CBT reflections.',
      read: false,
      type: 'report',
      createdAt: new Date(),
    }
  ]);

  // 6. Seed initial chat messages
  await ChatMessage.create([
    {
      userId: user._id,
      sender: 'therapist',
      content: 'Hello! I am MindEase AI, your personal mental wellness guide. How are you feeling today?',
      sentiment: 'Neutral',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
    {
      userId: user._id,
      sender: 'user',
      content: 'I have been feeling quite anxious about a presentation I have to give at work tomorrow.',
      sentiment: 'Negative (anxious)',
      createdAt: new Date(now.getTime() - 58 * 60 * 1000),
    },
    {
      userId: user._id,
      sender: 'therapist',
      content: 'It is completely natural to feel anxious before a major presentation. That shows that you care about your work. Let\'s break this down: what is the worst-case scenario that you are anticipating, and what is the actual likelihood of it happening? We can also do a quick breathing exercise together to quiet the physical tension.',
      sentiment: 'Neutral',
      createdAt: new Date(now.getTime() - 57 * 60 * 1000),
    },
    {
      userId: user._id,
      sender: 'user',
      content: 'Thanks, that makes me feel a bit better. I think I\'m worried I\'ll forget my slides.',
      sentiment: 'Negative (anxious)',
      createdAt: new Date(now.getTime() - 50 * 60 * 1000),
    }
  ]);

  console.log('Historical data seeding completed.');
};

const runSeeder = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindease';
  console.log(`Connecting to database at ${connUri} for seeding...`);
  
  await mongoose.connect(connUri);
  
  try {
    await cleanDatabase();
    const { user } = await createUsers();
    await seedHistoricalData(user);
    console.log('🌿 Database successfully seeded with rich history! 🌿');
  } catch (error) {
    console.error('Error during seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

runSeeder();
