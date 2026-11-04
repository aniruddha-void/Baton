import bcrypt from 'bcryptjs';
import { User } from './user.model.js';
import { AppError } from '../../utils/appError.js';

export class UserService {
  /**
   * Update profile information with whitelisted fields
   */
  async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // Check email uniqueness if changing email
    if (data.email && data.email !== user.email) {
      const emailExists = await User.findOne({ email: data.email, _id: { $ne: userId } });
      if (emailExists) {
        throw new AppError('This email address is already in use by another account.', 409);
      }
      user.email = data.email;
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.role !== undefined) user.role = data.role;
    if (data.location !== undefined) user.location = data.location;
    if (data.bio !== undefined) user.bio = data.bio;

    await user.save();
    return user.toJSON();
  }

  /**
   * Update account security / password
   */
  async updateSecurity(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Security credentials updated successfully.' };
  }

  /**
   * Update notification preferences
   */
  async updateNotifications(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const current = user.notifications || {};
    user.notifications = {
      emailSummary: preferences.emailSummary !== undefined ? preferences.emailSummary : current.emailSummary,
      mention: preferences.mention !== undefined ? preferences.mention : current.mention,
      decisionAlerts: preferences.decisionAlerts !== undefined ? preferences.decisionAlerts : current.decisionAlerts,
      weeklyDigest: preferences.weeklyDigest !== undefined ? preferences.weeklyDigest : current.weeklyDigest,
      mobilePush: preferences.mobilePush !== undefined ? preferences.mobilePush : current.mobilePush,
    };

    await user.save();
    return user.notifications;
  }

  /**
   * Update user avatar URL
   */
  async updateAvatar(userId, filename) {
    const avatarUrl = `/api/users/avatar/${filename}`;
    const user = await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return { avatarUrl };
  }
}

export const userService = new UserService();

