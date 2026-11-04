import express from 'express';
import { protect } from '../../middlewares/auth.js';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from './project.controller.js';
import { validate } from '../../middlewares/validate.js';
import { z } from 'zod';

const router = express.Router();

// Zod schemas for project create/update
const projectSchema = z.object({
    name: z.string().trim().min(1, 'Project name is required').max(100),
    description: z.string().trim().max(2000).optional()
        .transform((v) => v || ''),
    status: z
        .enum(['On Track', 'In Progress', 'Review', 'Completed', 'On Hold'])
        .optional(),
    progress: z.number().min(0).max(100).optional(),
    repositoryUrl: z.string().trim().max(500).optional(),
    technologies: z.array(z.string().trim().max(80)).max(50).optional(),
});

const updateProjectSchema = z.object({
    name: z.string().trim().min(1, 'Project name is required').max(100).optional(),
    description: z.string().trim().max(2000).optional(),
    status: z
        .enum(['On Track', 'In Progress', 'Review', 'Completed', 'On Hold'])
        .optional(),
    progress: z.number().min(0).max(100).optional(),
    repositoryUrl: z.string().trim().max(500).optional(),
    technologies: z.array(z.string().trim().max(80)).max(50).optional(),
});

router.use(protect);

router.route('/')
    .get(getProjects)
    .post(validate({ body: projectSchema }), createProject);

router.route('/:projectId')
    .get(getProjectById)
    .put(validate({ body: updateProjectSchema }), updateProject)
    .delete(deleteProject);

export default router;