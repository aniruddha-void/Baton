import { authService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/response.js';

export class AuthController {
  signup = asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);
    sendResponse(res, 201, result, 'Account created successfully');
  });

  login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    sendResponse(res, 200, result, 'Logged in successfully');
  });

  refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    const result = await authService.refresh(refreshToken);
    sendResponse(res, 200, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken;
    await authService.logout(req.user?.id, refreshToken);
    sendResponse(res, 200, null, 'Logged out successfully');
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    sendResponse(res, 200, null, result.message);
  });

  resetPassword = asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(req.body);
    sendResponse(res, 200, null, result.message);
  });

  getMe = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    sendResponse(res, 200, { user });
  });
}

export const authController = new AuthController();

