import { AppError } from '../utils/appError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { User } from '../modules/users/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Protect routes: verifies JWT access token and attaches authenticated User
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in to access this resource.', 401));
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = user;
  next();
});

/**
 * Role-based authorization guard
 */
export function restrictTo(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
}

