const { body } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all projects (admin sees all, member sees assigned)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    // Members only see their projects
    if (req.user.role !== 'admin') {
      query.members = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar role')
      .sort({ updatedAt: -1 });

    // Attach task counts
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const [total, done, inProgress] = await Promise.all([
          Task.countDocuments({ project: project._id }),
          Task.countDocuments({ project: project._id, status: 'done' }),
          Task.countDocuments({ project: project._id, status: 'in-progress' }),
        ]);
        return {
          ...project.toObject(),
          taskStats: { total, done, inProgress, todo: total - done - inProgress },
        };
      })
    );

    res.json({ success: true, count: projects.length, data: projectsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check access
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { name, description, members, color } = req.body;

    // Validate members exist
    if (members && members.length > 0) {
      const validUsers = await User.find({ _id: { $in: members } });
      if (validUsers.length !== members.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more member IDs are invalid',
        });
      }
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || [],
      color: color || '#6366f1',
    });

    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar role');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res, next) => {
  try {
    const { name, description, members, status, color } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Validate members if provided
    if (members && members.length > 0) {
      const validUsers = await User.find({ _id: { $in: members } });
      if (validUsers.length !== members.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more member IDs are invalid',
        });
      }
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, members, status, color },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar role');

    res.json({ success: true, message: 'Project updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all tasks in project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and all its tasks deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email avatar role');

    res.json({ success: true, message: 'Member added', data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner',
      });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    // Unassign tasks from removed member in this project
    await Task.updateMany(
      { project: req.params.id, assignedTo: req.params.userId },
      { $set: { assignedTo: null } }
    );

    res.json({ success: true, message: 'Member removed from project' });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('description').optional().isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  projectValidation,
};
