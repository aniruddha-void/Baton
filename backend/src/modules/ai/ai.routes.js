import { Router } from 'express';
import { protect } from '../../middlewares/auth.js';
import { askAssistant } from './ai.controller.js';

const router = Router();

router.use(protect);

router.post('/', askAssistant);

export default router;
