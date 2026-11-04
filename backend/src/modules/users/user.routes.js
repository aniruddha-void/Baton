import { Router } from 'express';
import { userController } from './user.controller.js';
import { protect } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateProfileSchema,
  updateSecuritySchema,
  updateNotificationsSchema,
} from './user.validation.js';
import { uploadAvatar } from '../../middlewares/upload.js';

const router = Router();

// Publicly serve avatar images by filename
router.get('/avatar/:filename', userController.getAvatar);

// All user management routes require authentication
router.use(protect);

router.put('/profile', validate({ body: updateProfileSchema }), userController.updateProfile);
router.put('/security', validate({ body: updateSecuritySchema }), userController.updateSecurity);
router.put('/notifications', validate({ body: updateNotificationsSchema }), userController.updateNotifications);
router.post('/avatar', uploadAvatar.single('avatar'), userController.uploadAvatar);

export default router;

