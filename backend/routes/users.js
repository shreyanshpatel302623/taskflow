const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All user routes require auth + admin
router.use(protect, authorize('admin'));

router.get('/stats', getUserStats);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
