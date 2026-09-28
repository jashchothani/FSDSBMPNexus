import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@repo/database';
import { getEnv, PASSWORD_SALT_ROUNDS, MAX_REFRESH_TOKENS, EMAIL_VERIFICATION_EXPIRY_HOURS, PASSWORD_RESET_EXPIRY_HOURS } from '@repo/config';
import type { RegisterInput, LoginInput, AuthTokens, JWTPayload, IUser } from '@repo/types';
import { AppError } from '../middleware/error.middleware.js';

export class AuthService {
  /**
   * Register a new user with email/password.
   */
  async register(input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Check if email is already taken
    const existing = await User.findOne({ email: input.email.toLowerCase() }).lean();
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(
      Date.now() + EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Create user
    const user = await User.create({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'STUDENT',
      authProvider: 'LOCAL',
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
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

    // Generate tokens
    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);

    // In development, log the verification token (no SMTP in dev)
    const env = getEnv();
    if (env.NODE_ENV === 'development') {
      console.log(`📧 [DEV] Email verification token for ${user.email}: ${emailVerificationToken}`);
    }

    return { user: this.sanitize(user), tokens };
  }

  /**
   * Login with email/password.
   */
  async login(input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash +refreshTokens');
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'This account has been disabled');
    }

    if (user.authProvider !== 'LOCAL' || !user.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Please use the correct sign-in method');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    return { user: this.sanitize(user), tokens };
  }

  /**
   * Refresh access token using refresh token.
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const env = getEnv();

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JWTPayload;
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not found or deactivated');
    }

    // Verify the refresh token is still in the user's token list
    if (!user.refreshTokens.includes(refreshToken)) {
      // Possible token reuse — invalidate all tokens for security
      user.refreshTokens = [];
      await user.save();
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token has been revoked');
    }

    // Remove old token and issue new pair
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  /**
   * Logout — revoke a specific refresh token.
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  /**
   * Logout from all devices — revoke all refresh tokens.
   */
  async logoutAll(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });
  }

  /**
   * Verify email with token.
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  /**
   * Forgot password — generate reset token.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists — return silently
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(
      Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000
    );
    await user.save();

    const env = getEnv();
    if (env.NODE_ENV === 'development') {
      console.log(`📧 [DEV] Password reset token for ${user.email}: ${resetToken}`);
    }
  }

  /**
   * Reset password with token.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires +passwordHash +refreshTokens');

    if (!user) {
      throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
    }

    user.passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();
  }

  /**
   * Get current user profile.
   */
  async getProfile(userId: string): Promise<IUser> {
    const user: any = await User.findById(userId).lean();
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }
    return this.sanitize(user);
  }

  // ---- Private helpers ----

  private sanitize(doc: any): IUser {
    const raw = doc && typeof doc.toObject === 'function' ? doc.toObject() : doc && typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
    const obj = JSON.parse(JSON.stringify(raw));
    delete obj.passwordHash;
    delete obj.refreshTokens;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpires;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    delete obj.__v;
    return obj as IUser;
  }

  private generateTokens(user: { _id: unknown; email: string; role: string }): AuthTokens {
    const env = getEnv();

    const payload: JWTPayload = {
      userId: user._id as string,
      email: user.email,
      role: user.role as JWTPayload['role'],
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const user = await User.findById(userId).select('+refreshTokens');
    if (!user) return;

    // Limit stored refresh tokens to MAX_REFRESH_TOKENS
    if (user.refreshTokens.length >= MAX_REFRESH_TOKENS) {
      user.refreshTokens = user.refreshTokens.slice(-MAX_REFRESH_TOKENS + 1);
    }

    user.refreshTokens.push(token);
    await user.save();
  }
}
