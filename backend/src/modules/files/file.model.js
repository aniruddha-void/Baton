import mongoose from 'mongoose';

/**
 * Metadata for files stored in the (private) Backblaze B2 bucket.
 * The binary content itself lives in B2 — only metadata is stored in MongoDB.
 */
const fileAssetSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [255, 'Filename is too long'],
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    bucket: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const FileAsset = mongoose.model('FileAsset', fileAssetSchema);
