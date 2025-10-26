const express = require('express');
const { register, login, updateProfile } = require('../controllers/authController');
const { body } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').notEmpty().withMessage('Department is required'),
  body('class').notEmpty().withMessage('Class is required'),
  body('phone').notEmpty().withMessage('Phone is required')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.put('/profile', auth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('department').optional().notEmpty().withMessage('Department cannot be empty'),
  body('class').optional().notEmpty().withMessage('Class cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty')
], updateProfile);

module.exports = router;
