import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/db';
import { AuthRequest, IUser } from '../middleware/auth';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'mindease_development_jwt_secret_token_12345';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '30d',
  });
};

// Check and update user streak
const checkAndUpdateStreak = async (user: IUser): Promise<boolean> => {
  const now = new Date();
  const lastActive = user.streakLastActive;

  if (!lastActive) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        streakCurrent: 1,
        streakLongest: 1,
        streakLastActive: now,
      },
    });
    return true;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activeDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const differenceInTime = today.getTime() - activeDate.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);

  let streakUpdated = false;

  if (differenceInDays === 1) {
    // Active yesterday, increment streak
    const newCurrent = user.streakCurrent + 1;
    const newLongest = newCurrent > user.streakLongest ? newCurrent : user.streakLongest;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        streakCurrent: newCurrent,
        streakLongest: newLongest,
        streakLastActive: now,
      },
    });

    streakUpdated = true;

    // Push notification for streak milestone
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Streak Increased! 🔥',
        message: `You've kept your wellness streak going! It's now ${newCurrent} days. Keep it up!`,
        type: 'streak',
      },
    });
  } else if (differenceInDays > 1) {
    // Missed a day, reset streak to 1
    await prisma.user.update({
      where: { id: user.id },
      data: {
        streakCurrent: 1,
        streakLastActive: now,
      },
    });
  } else if (differenceInDays === 0 && user.streakCurrent === 0) {
    // Current streak is zero but active today
    await prisma.user.update({
      where: { id: user.id },
      data: {
        streakCurrent: 1,
        streakLongest: user.streakLongest === 0 ? 1 : user.streakLongest,
        streakLastActive: now,
      },
    });
  }

  return streakUpdated;
};

// Register User
export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const isEmail = email.includes('@');
    const finalEmail = isEmail ? email.toLowerCase() : `${email.toLowerCase()}@mindease.ai`;

    const emailExists = await prisma.user.findUnique({ where: { email: finalEmail } });
    if (emailExists) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    const usernameExists = await prisma.user.findUnique({ where: { username } });
    if (usernameExists) {
      res.status(400).json({ success: false, message: 'Username already taken' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email: finalEmail,
        passwordHash,
        streakCurrent: 1,
        streakLongest: 1,
        streakLastActive: new Date(),
      },
    });

    const token = generateToken(user.id);

    // Seed a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to MindEase AI 🌿',
        message: 'Your mental wellness journey begins here. Explore the AI Therapist, log your mood, or start a journal.',
        type: 'system',
      },
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        streak: {
          current: user.streakCurrent,
          longest: user.streakLongest,
          lastActive: user.streakLastActive,
        },
        settings: {
          theme: user.theme,
          remindersEnabled: user.remindersEnabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login User
export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Search by email or username
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: email }
        ]
      }
    });

    if (!user) {
      // Auto-signup!
      console.log(`User matching "${email}" not found. Performing auto-signup...`);
      
      const isEmail = email.includes('@');
      const finalEmail = isEmail ? email.toLowerCase() : `${email.toLowerCase()}@mindease.ai`;
      const finalUsername = isEmail ? email.split('@')[0] : email;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      user = await prisma.user.create({
        data: {
          username: finalUsername,
          email: finalEmail,
          passwordHash,
          streakCurrent: 1,
          streakLongest: 1,
          streakLastActive: new Date(),
        },
      });

      // Seed a welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to MindEase AI 🌿',
          message: 'Your mental wellness journey begins here. Explore the AI Therapist, log your mood, or start a journal.',
          type: 'system',
        },
      });
    } else {
      // Validate password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }
    }

    // Check & update streak
    await checkAndUpdateStreak(user);

    // Re-fetch user to get latest streak details
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const token = generateToken(updatedUser.id);

    res.json({
      success: true,
      token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        streak: {
          current: updatedUser.streakCurrent,
          longest: updatedUser.streakLongest,
          lastActive: updatedUser.streakLastActive,
        },
        settings: {
          theme: updatedUser.theme,
          remindersEnabled: updatedUser.remindersEnabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Also update streak upon profile loading to capture daily logins active
    await checkAndUpdateStreak(req.user);

    const updatedUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        streak: {
          current: updatedUser.streakCurrent,
          longest: updatedUser.streakLongest,
          lastActive: updatedUser.streakLastActive,
        },
        settings: {
          theme: updatedUser.theme,
          remindersEnabled: updatedUser.remindersEnabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password Request
export const forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: email }
        ]
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Generate random hex token
    const resetToken = crypto.randomBytes(20).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour expiry
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log(`[PASSWORD RESET LINK for ${user.username}]: ${resetUrl}`);

    res.json({
      success: true,
      message: 'Password reset link simulated and logged to server console.',
      token: resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() }
      }
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile settings
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { username, email, password, settings } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const updateData: any = {};

    // If username is changing, ensure unique
    if (username && username !== user.username) {
      const usernameExists = await prisma.user.findUnique({ where: { username } });
      if (usernameExists) {
        res.status(400).json({ success: false, message: 'Username is already taken' });
        return;
      }
      updateData.username = username;
    }

    // If email is changing, ensure unique
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (emailExists) {
        res.status(400).json({ success: false, message: 'Email is already registered' });
        return;
      }
      updateData.email = email.toLowerCase();
    }

    // If password is changed
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    // If settings are changed
    if (settings) {
      if (settings.theme) updateData.theme = settings.theme;
      if (settings.remindersEnabled !== undefined) updateData.remindersEnabled = settings.remindersEnabled;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        streak: {
          current: updatedUser.streakCurrent,
          longest: updatedUser.streakLongest,
          lastActive: updatedUser.streakLastActive,
        },
        settings: {
          theme: updatedUser.theme,
          remindersEnabled: updatedUser.remindersEnabled,
        },
      }
    });
  } catch (error) {
    next(error);
  }
};
