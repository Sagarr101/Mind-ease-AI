import { Response, NextFunction } from 'express';
import { WellnessReport } from '../models/Report';
import { Mood } from '../models/Mood';
import { Journal } from '../models/Journal';
import { MeditationSession } from '../models/Meditation';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export const getReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const reports = await WellnessReport.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // 1. Gather stats
    const moodLogs = await Mood.find({
      userId,
      loggedAt: { $gte: startDate, $lte: endDate },
    });

    const meditations = await MeditationSession.find({
      userId,
      completedAt: { $gte: startDate, $lte: endDate },
    });

    const journalsCount = await Journal.countDocuments({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate averages and totals
    const averageMood = moodLogs.length > 0 
      ? parseFloat((moodLogs.reduce((acc, curr) => acc + curr.score, 0) / moodLogs.length).toFixed(1)) 
      : 3.0; // default middle score if no logs

    const meditationTotalMinutes = meditations.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    // 2. Local insight builder
    let moodAdvice = '';
    if (averageMood >= 4.0) {
      moodAdvice = "Your mood has been consistently high this week! You are experiencing positive emotional energy. Continue prioritizing your current routines, as they are building solid resilience.";
    } else if (averageMood >= 3.0) {
      moodAdvice = "Your mood was moderate and stable. You successfully navigated the week's challenges. Incorporating a regular morning meditation or stepping up reflective journaling might lift your baseline further.";
    } else {
      moodAdvice = "Your mood has been running lower than usual. This is a clear indicator to pause, slow down, and extend gentle self-compassion. Reach out to supportive circles or step up your grounding practices.";
    }

    let meditationAdvice = '';
    if (meditationTotalMinutes >= 30) {
      meditationAdvice = `Excellent dedication to mindfulness! Spending ${meditationTotalMinutes} minutes meditating directly supports your nervous system, reduces stress hormones, and aids focus.`;
    } else if (meditationTotalMinutes > 0) {
      meditationAdvice = `Good job logging ${meditationTotalMinutes} minutes of meditation. Consistency is key; building up to 10 minutes daily will provide compounding benefits for emotional balance.`;
    } else {
      meditationAdvice = "No meditation sessions were recorded this week. Try starting with a simple 5-minute breathing exercise in the Meditation Center to build back your habit.";
    }

    let journalAdvice = '';
    if (journalsCount >= 3) {
      journalAdvice = `You did a fantastic job journaling ${journalsCount} times. Getting your thoughts onto paper is a powerful CBT tool that helps clarify unconscious stress and identify cognitive distortions.`;
    } else if (journalsCount > 0) {
      journalAdvice = "You did some reflective journaling this week. Increasing the frequency will help you build a richer chronicle of your emotional patterns.";
    } else {
      journalAdvice = "You didn't write any journal entries. Setting aside just 5 minutes before bed to write about your day can release cognitive load and improve sleep.";
    }

    const insights = `### Weekly Wellness Insight Summary

**Mood Baseline:**
${moodAdvice}

**Mindfulness & Meditation:**
${meditationAdvice}

**Self-Reflection & Journaling:**
${journalAdvice}

**Actionable CBT Recommendation for Next Week:**
- Practice **cognitive reframing** whenever a self-limiting thought arises.
- Aim for a **10-minute mindfulness break** during high-stress hours.
- Log your mood daily to build accurate awareness of your patterns.`;

    // 3. Create report
    const report = await WellnessReport.create({
      userId,
      startDate,
      endDate,
      averageMood,
      meditationTotalMinutes,
      journalsWritten: journalsCount,
      insights,
    });

    // 4. Send notification
    await Notification.create({
      userId,
      title: 'New Weekly Report compiled! 📊',
      message: `Your wellness summary is ready. Average mood: ${averageMood}/5.0. Check it out now!`,
      type: 'report',
    });

    res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};
