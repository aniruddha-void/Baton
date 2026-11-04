import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['On Track', 'In Progress', 'Review', 'Completed', 'On Hold'],
      default: 'In Progress',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    repositoryUrl: {
      type: String,
      trim: true,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model('Project', projectSchema);