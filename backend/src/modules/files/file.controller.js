import path from 'path';
import crypto from 'crypto';
import { Project } from '../projects/project.model.js';
import { FileAsset } from './file.model.js';
import { AppError } from '../../utils/appError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/response.js';
import { uploadToB2, createSignedDownloadUrl, deleteFromB2, b2Config } from '../../config/b2.js';

/**
 * Authorization helper: a user may only access files of a project they own or
 * that they are a member of.
 */
async function assertProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }
  const isOwner = project.owner && project.owner.toString() === userId.toString();
  const isMember = Array.isArray(project.team) && project.team.some((m) => m && m.toString() === userId.toString());
  if (!isOwner && !isMember) {
    throw new AppError('You do not have access to this project.', 403);
  }
  return project;
}

function makeKey(projectId, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60);
  const suffix = crypto.randomBytes(8).toString('hex');
  return `projects/${projectId}/${base}_${suffix}${ext}`;
}

/** Upload one file to B2 and record metadata in MongoDB */
export const uploadFile = asyncHandler(async (req, res) => {
  const project = await assertProjectAccess(req.params.projectId, req.user._id);

  if (!req.file) {
    throw new AppError('Please attach a file.', 400);
  }

  const key = makeKey(project.id, req.file.originalname);
  await uploadToB2({
    key,
    body: req.file.buffer,
    contentType: req.file.mimetype || 'application/octet-stream',
  });

  const fileAsset = await FileAsset.create({
    project: project.id,
    uploader: req.user._id,
    key,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype || 'application/octet-stream',
    size: req.file.size,
    bucket: b2Config.bucket,
  });

  sendResponse(res, 201, { file: fileAsset }, 'File uploaded successfully');
});

/** List files for a project */
export const listFiles = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.projectId, req.user._id);

  const files = await FileAsset.find({ project: req.params.projectId }).sort({ createdAt: -1 });
  sendResponse(res, 200, { files }, 'Files fetched successfully');
});

/** Generate a short-lived signed download URL for a private file */
export const downloadFile = asyncHandler(async (req, res) => {
  const fileAsset = await FileAsset.findById(req.params.fileId);
  if (!fileAsset) {
    throw new AppError('File not found.', 404);
  }

  await assertProjectAccess(fileAsset.project, req.user._id);

  const url = await createSignedDownloadUrl(fileAsset.key);
  sendResponse(res, 200, { url, originalName: fileAsset.originalName }, 'Download link generated');
});

/** Delete a file from B2 and MongoDB */
export const deleteFile = asyncHandler(async (req, res) => {
  const fileAsset = await FileAsset.findById(req.params.fileId);
  if (!fileAsset) {
    throw new AppError('File not found.', 404);
  }

  await assertProjectAccess(fileAsset.project, req.user._id);

  await deleteFromB2(fileAsset.key);
  await FileAsset.findByIdAndDelete(fileAsset._id);

  sendResponse(res, 200, null, 'File deleted successfully');
});
