import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().trim().email('Invalid email address').toLowerCase().optional(),
  role: z
    .enum([
      'Project Lead',
      'Frontend Engineer',
      'Backend Engineer',
      'Product Designer',
      'QA Engineer',
      'Product Manager',
      'Other',
    ])
    .optional(),
  location: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(500).optional(),
});

export const updateSecuritySchema = z.object({
  username: z.string().optional(),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});

export const updateNotificationsSchema = z.object({
  emailSummary: z.boolean().optional(),
  mention: z.boolean().optional(),
  decisionAlerts: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  mobilePush: z.boolean().optional(),
});

