import { Router } from 'express';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '@repo/types';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import type { ApiResponse } from '@repo/types';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/auth/register
 * Register a new user.
 */
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { user, tokens } = await authService.register(req.body);
    const response: ApiResponse = {
      success: true,
      data: { user, tokens },
      message: 'Registration successful. Please verify your email.',
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login with email/password.
 */
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { user, tokens } = await authService.login(req.body);
    const response: ApiResponse = {
      success: true,
      data: { user, tokens },
      message: 'Login successful',
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token.
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' },
      });
      return;
    }
    const tokens = await authService.refreshToken(refreshToken);
    const response: ApiResponse = {
      success: true,
      data: { tokens },
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout (revoke refresh token).
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user!.userId, refreshToken ?? '');
    res.json({ success: true, data: null, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout-all
 * Logout from all devices.
 */
router.post('/logout-all', authenticate, async (req, res, next) => {
  try {
    await authService.logoutAll(req.user!.userId);
    res.json({ success: true, data: null, message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token.
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Verification token is required' },
      });
      return;
    }
    await authService.verifyEmail(token);
    res.json({ success: true, data: null, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset.
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return success (don't reveal if email exists)
    res.json({
      success: true,
      data: null,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token.
 */
router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, data: null, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile.
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
