import path from 'path';
import fs from 'fs';
import { userService } from './user.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../utils/appError.js';

export class UserController {
  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    sendResponse(res, 200, { user }, 'Profile updated successfully');
  });

  updateSecurity = asyncHandler(async (req, res) => {
    const result = await userService.updateSecurity(req.user.id, req.body);
    sendResponse(res, 200, null, result.message);
  });

  updateNotifications = asyncHandler(async (req, res) => {
    const notifications = await userService.updateNotifications(req.user.id, req.body);
    sendResponse(res, 200, { notifications }, 'Notification preferences updated');
  });

  uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Please upload an image file.', 400);
    }
    const result = await userService.updateAvatar(req.user.id, req.file.filename);
    sendResponse(res, 200, result, 'Avatar uploaded successfully');
  });

  getAvatar = asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const sanitizedFilename = path.basename(filename);
    const uploadBaseDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = path.resolve(uploadBaseDir, 'avatars', sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      throw new AppError('Avatar image not found.', 404);
    }

    res.sendFile(filePath);
  });
}

export const userController = new UserController();

