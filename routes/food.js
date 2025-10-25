const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all food items (public)
router.get('/', foodController.getAllFoods);

// Add new food item (admin only)
router.post('/add', auth, adminAuth, foodController.addFood);

// Update food item (admin only)
router.put('/:id', auth, adminAuth, foodController.updateFood);

// Delete food item (admin only)
router.delete('/:id', auth, adminAuth, foodController.deleteFood);

module.exports = router;
