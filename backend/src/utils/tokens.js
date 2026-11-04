import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'baton_jwt_access_super_secret_key_2026_dev_min_32_chars';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'baton_jwt_refresh_super_secret_key_2026_dev_min_32_chars';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

/**
 * Sign an access token (15 minutes)
 */
export function generateAccessToken(payload) {
  return jwt.sign(
    {
      id: payload._id || payload.id,
      email: payload.email,
      role: payload.role,
    },
    ACCESS_SECRET,
    {
      expiresIn: ACCESS_EXPIRES_IN,
      algorithm: 'HS256',
    }
  );
}

/**
 * Sign a refresh token (7 days)
 */
export function generateRefreshToken(payload) {
  return jwt.sign(
    {
      id: payload._id || payload.id,
      tokenVersion: payload.tokenVersion || 0,
      jti: crypto.randomUUID(),
    },
    REFRESH_SECRET,
    {
      expiresIn: REFRESH_EXPIRES_IN,
      algorithm: 'HS256',
    }
  );
}

/**
 * Verify access token
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] });
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] });
}

/**
 * SHA-256 hash helper for storing tokens safely in database
 */
export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generate a random cryptographically secure token for password reset
 */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

