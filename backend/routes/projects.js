const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  projectValidation,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect); // All routes require auth

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('admin'), projectValidation, validate, createProject);
router.put('/:id', authorize('admin'), updateProject);
router.delete('/:id', authorize('admin'), deleteProject);
router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
