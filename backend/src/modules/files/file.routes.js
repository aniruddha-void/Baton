import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../../middlewares/auth.js';
import { AppError } from '../../utils/appError.js';
import { uploadFile, listFiles, downloadFile, deleteFile } from './file.controller.js';

const router = Router();

// In-memory storage — the file is forwarded to Backblaze B2 (not written to disk).
const storage = multer.memoryStorage();

function documentFileFilter(req, file, cb) {
  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file type: ${ext}. Allowed formats: PDF, DOCX, TXT, MD, PNG, JPG, ZIP`, 400), false);
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: documentFileFilter,
});

router.use(protect);

router.post('/projects/:projectId', upload.single('file'), uploadFile);
router.get('/projects/:projectId', listFiles);
router.get('/:fileId/download', downloadFile);
router.delete('/:fileId', deleteFile);

export default router;
