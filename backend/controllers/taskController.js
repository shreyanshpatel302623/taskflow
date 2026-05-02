const { body } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// Helper: check if user has access to task's project
const checkProjectAccess = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, hasAccess: false };
  const isMember = project.members.some((m) => m.toString() === userId.toString());
  return { project, hasAccess: role === 'admin' || isMember };
};

// @desc    Get tasks (with filters: project, status, assignedTo, search, priority)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const {
      project,
      status,
      priority,
      assignedTo,
      search,
      overdue,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Non-admins only see tasks from their projects
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      query.project = { $in: userProjects.map((p) => p._id) };
    }

    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo === 'me' ? req.user._id : assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'done' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('project', 'name color')
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for current user (dashboard)
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res, next) => {
  try {
    const now = new Date();
    const [allTasks, doneTasks, overdueTasks] = await Promise.all([
      Task.find({ assignedTo: req.user._id })
        .populate('project', 'name color')
        .populate('assignedTo', 'name avatar')
        .sort({ dueDate: 1, createdAt: -1 }),
      Task.countDocuments({ assignedTo: req.user._id, status: 'done' }),
      Task.countDocuments({
        assignedTo: req.user._id,
        status: { $ne: 'done' },
        dueDate: { $lt: now },
      }),
    ]);

    // Group by status for chart data
    const statusBreakdown = {
      todo: allTasks.filter((t) => t.status === 'todo').length,
      'in-progress': allTasks.filter((t) => t.status === 'in-progress').length,
      done: doneTasks,
    };

    res.json({
      success: true,
      data: {
        tasks: allTasks,
        stats: {
          total: allTasks.length,
          done: doneTasks,
          overdue: overdueTasks,
          inProgress: statusBreakdown['in-progress'],
          todo: statusBreakdown.todo,
        },
        statusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name color members')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Access check
    const { hasAccess } = await checkProjectAccess(
      task.project._id,
      req.user._id,
      req.user.role
    );
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo, tags } =
      req.body;

    const { project: proj, hasAccess } = await checkProjectAccess(
      project,
      req.user._id,
      req.user.role
    );
    if (!proj) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Validate assignee is project member
    if (assignedTo) {
      const isMember = proj.members.some((m) => m.toString() === assignedTo);
      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      tags: tags || [],
    });

    await task.populate('project', 'name color');
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Admin or assigned user)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'members');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Authorization: admin or assigned user
    const isAdmin = req.user.role === 'admin';
    const isAssigned =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or the assigned user can update this task',
      });
    }

    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;

    // Only admin can change assignee
    if (assignedTo !== undefined && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can reassign tasks',
      });
    }

    const updateData = { title, description, status, priority, dueDate, tags };
    if (isAdmin && assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const updated = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({ success: true, message: 'Task updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task stats for admin dashboard
// @route   GET /api/tasks/stats
// @access  Private/Admin
const getTaskStats = async (req, res, next) => {
  try {
    const now = new Date();
    const [total, done, inProgress, todo, overdue] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'done' }),
      Task.countDocuments({ status: 'in-progress' }),
      Task.countDocuments({ status: 'todo' }),
      Task.countDocuments({ status: { $ne: 'done' }, dueDate: { $lt: now } }),
    ]);

    // Tasks created in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTasks = await Task.find({ createdAt: { $gte: weekAgo } })
      .select('status createdAt')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { total, done, inProgress, todo, overdue, recentTasks },
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 150 }).withMessage('Title must be 2-150 characters'),
  body('project').notEmpty().withMessage('Project ID is required'),
  body('status').optional().isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be: todo, in-progress, or done'),
  body('priority').optional().isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be: low, medium, or high'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

module.exports = {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  taskValidation,
};
