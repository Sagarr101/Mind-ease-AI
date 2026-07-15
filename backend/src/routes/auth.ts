import { Router } from 'express';
import { z } from 'zod';
import { register, login, getMe, forgotPassword, resetPassword, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: z.string().min(1, 'Email or Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Username or Email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Username or Email is required'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long').optional(),
    email: z.string().min(1, 'Email is required').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional().or(z.literal('')),
    settings: z.object({
      theme: z.enum(['light', 'dark']).optional(),
      remindersEnabled: z.boolean().optional(),
    }).optional(),
  }),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

export default router;
