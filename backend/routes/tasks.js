const express = require('express');
const router = express.Router();
const {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  taskValidation,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect); // All routes require auth

router.get('/my-tasks', getMyTasks);
router.get('/stats', authorize('admin'), getTaskStats);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', authorize('admin'), taskValidation, validate, createTask);
router.put('/:id', updateTask); // Handled by controller (admin or assigned)
router.delete('/:id', authorize('admin'), deleteTask);

module.exports = router;
