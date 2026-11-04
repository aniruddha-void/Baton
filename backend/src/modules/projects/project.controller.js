import { Project } from './project.model.js';
import { AppError } from '../../utils/appError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/response.js';

// Create a project
export const createProject = asyncHandler(async (req, res) => {
    const { name, description, status, repositoryUrl, technologies } = req.body;

    const project = await Project.create({
        name,
        description,
        status,
        repositoryUrl,
        technologies,
        owner: req.user._id,
    });

    sendResponse(res, 201, { project }, 'Project created successfully');
});

// Get projects belonging to logged-in user
export const getProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({
        owner: req.user._id,
    }).sort({ createdAt: -1 });

    sendResponse(res, 200, { projects }, 'Projects fetched successfully');
});

// Get one project
export const getProjectById = asyncHandler(async (req, res, next) => {
    const project = await Project.findOne({
        _id: req.params.projectId,
        owner: req.user._id,
    });

    if (!project) {
        return next(new AppError('Project not found', 404));
    }

    sendResponse(res, 200, { project }, 'Project fetched successfully');
});

// Update a project (owner only)
export const updateProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findOne({
        _id: req.params.projectId,
        owner: req.user._id,
    });

    if (!project) {
        return next(new AppError('Project not found', 404));
    }

    const { name, description, status, progress, repositoryUrl, technologies } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (progress !== undefined) project.progress = progress;
    if (repositoryUrl !== undefined) project.repositoryUrl = repositoryUrl;
    if (technologies !== undefined) project.technologies = technologies;

    await project.save();
    sendResponse(res, 200, { project }, 'Project updated successfully');
});

// Delete a project (owner only)
export const deleteProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findOneAndDelete({
        _id: req.params.projectId,
        owner: req.user._id,
    });

    if (!project) {
        return next(new AppError('Project not found', 404));
    }

    sendResponse(res, 200, null, 'Project deleted successfully');
});