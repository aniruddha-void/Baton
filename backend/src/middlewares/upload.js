import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppError } from '../utils/appError.js';

const uploadBaseDir = process.env.UPLOAD_DIR || 'uploads';

// Ensure necessary upload directories exist
const documentsDir = path.join(uploadBaseDir, 'documents');
const avatarsDir = path.join(uploadBaseDir, 'avatars');

[uploadBaseDir, documentsDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Sanitize filename to prevent directory traversal and filesystem attacks
 */
function sanitizeFileName(originalName) {
  const baseName = path.basename(originalName);
  const ext = path.extname(baseName).toLowerCase();
  const cleanName = baseName
    .replace(ext, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60);
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  return `${cleanName}_${randomSuffix}${ext}`;
}

/**
 * Multer storage for documents
 */
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    cb(null, sanitizeFileName(file.originalname));
  },
});

/**
 * Multer storage for avatars
 */
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar_${sanitizeFileName(file.originalname)}`);
  },
});

/**
 * Filter for allowed document types: PDF, DOCX, TXT, MD, Images, ZIP
 */
function documentFileFilter(req, file, cb) {
  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type: ${ext}. Allowed formats: PDF, DOCX, TXT, MD, PNG, JPG, ZIP`,
        400
      ),
      false
    );
  }
}

/**
 * Filter for allowed avatar image types
 */
function avatarFileFilter(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WEBP, GIF) are allowed for avatars.', 400), false);
  }
}

export const uploadDocuments = multer({
  storage: documentStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max per file
    files: 10, // max 10 files per upload batch
  },
  fileFilter: documentFileFilter,
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max for avatar
    files: 1,
  },
  fileFilter: avatarFileFilter,
});

