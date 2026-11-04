import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const avatarPalette = ['#7c3aed', '#6366f1', '#d97706', '#16a34a', '#0284c7', '#db2777'];

const notificationSchema = new mongoose.Schema(
  {
    emailSummary: { type: Boolean, default: true },
    mention: { type: Boolean, default: true },
    decisionAlerts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
    mobilePush: { type: Boolean, default: true },
  },
  { _id: false }
);

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: function () {
        // Only required if status is not 'invited'
        return this.status !== 'invited';
      },
      select: false,
    },
    role: {
      type: String,
      enum: [
        'Project Lead',
        'Frontend Engineer',
        'Backend Engineer',
        'Product Designer',
        'QA Engineer',
        'Product Manager',
        'Other',
      ],
      default: 'Project Lead',
    },
    initials: {
      type: String,
      uppercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: function () {
        return avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
      },
    },
    status: {
      type: String,
      enum: ['active', 'on-leave', 'invited'],
      default: 'active',
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    notifications: {
      type: notificationSchema,
      default: () => ({}),
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.passwordResetTokenHash;
        delete ret.passwordResetExpiresAt;
        return ret;
      },
    },
  }
);

/**
 * Pre-save middleware to compute initials
 */
userSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.initials) {
    const parts = this.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      this.initials = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (parts[0]) {
      this.initials = parts[0].slice(0, 2).toUpperCase();
    } else {
      this.initials = 'U';
    }
  }
  next();
});

/**
 * Compare plain password against hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);

