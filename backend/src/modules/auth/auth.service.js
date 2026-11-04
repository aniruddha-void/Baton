import bcrypt from 'bcryptjs';
import { User } from '../users/user.model.js';
import { AppError } from '../../utils/appError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} from '../../utils/tokens.js';

export class AuthService {
  /**
   * Register a new user
   */
  async signup({ fullName, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name: fullName,
      email,
      passwordHash,
      role: 'Project Lead',
      status: 'active',
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token in DB with 7 days expiry
    const hashedRefresh = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens = [{ tokenHash: hashedRefresh, expiresAt }];
    await user.save();

    const safeUser = user.toJSON();

    return {
      token: accessToken,
      refreshToken,
      user: safeUser,
    };
  }

  /**
   * Log in existing user
   */
  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.status === 'on-leave') {
      throw new AppError('Your account is currently inactive. Please contact your workspace administrator.', 403);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Clean expired tokens and add new hashed refresh token
    const now = new Date();
    const activeTokens = (user.refreshTokens || []).filter((t) => t.expiresAt > now);

    const hashedRefresh = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    activeTokens.push({ tokenHash: hashedRefresh, expiresAt });
    // Cap stored active sessions at 5
    if (activeTokens.length > 5) {
      activeTokens.shift();
    }

    user.refreshTokens = activeTokens;
    await user.save();

    const safeUser = user.toJSON();

    return {
      token: accessToken,
      refreshToken,
      user: safeUser,
    };
  }

  /**
   * Refresh access token & rotate refresh token
   */
  async refresh(providedRefreshToken) {
    if (!providedRefreshToken) {
      throw new AppError('Refresh token is required.', 400);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(providedRefreshToken);
    } catch (err) {
      throw new AppError('Refresh token is invalid or expired. Please log in again.', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    const incomingHash = hashToken(providedRefreshToken);
    const now = new Date();

    const tokenIndex = (user.refreshTokens || []).findIndex(
      (t) => t.tokenHash === incomingHash && t.expiresAt > now
    );

    if (tokenIndex === -1) {
      // Possible token reuse attack: revoke all sessions
      user.refreshTokens = [];
      await user.save();
      throw new AppError('Invalid refresh session. Please log in again.', 401);
    }

    // Token rotation: generate new pair and replace old one
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const newHashed = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.splice(tokenIndex, 1, {
      tokenHash: newHashed,
      expiresAt: newExpiresAt,
    });
    await user.save();

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Log out user: revoke refresh token
   */
  async logout(userId, providedRefreshToken) {
    if (!userId) return;

    if (providedRefreshToken) {
      const targetHash = hashToken(providedRefreshToken);
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { tokenHash: targetHash } },
      });
    } else {
      // Clear all refresh sessions for this user
      await User.findByIdAndUpdate(userId, { refreshTokens: [] });
    }
  }

  /**
   * Request password reset token
   * Returns consistent response whether email exists or not to prevent user enumeration
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');

    if (user) {
      const resetToken = generateRandomToken(32);
      const hashedToken = hashToken(resetToken);

      user.passwordResetTokenHash = hashedToken;
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
      await user.save();

      // Log reset link in development console for easy testing
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      console.log(`\n============================================================`);
      console.log(`[PASSWORD RESET] For ${email}`);
      console.log(`[RESET LINK] ${resetUrl}`);
      console.log(`[RESET TOKEN] ${resetToken}`);
      console.log(`============================================================\n`);
    }

    return {
      message: 'If an account with that email exists, password reset instructions have been sent.',
    };
  }

  /**
   * Reset password with single-use token
   */
  async resetPassword({ token, password }) {
    const hashed = hashToken(token);
    const now = new Date();

    const user = await User.findOne({
      passwordResetTokenHash: hashed,
      passwordResetExpiresAt: { $gt: now },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt +passwordHash +refreshTokens');

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);

    // Single use: clear reset token fields and revoke all existing sessions
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshTokens = [];
    await user.save();

    return {
      message: 'Password reset successful. Please log in with your new password.',
    };
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user.toJSON();
  }
}

export const authService = new AuthService();

