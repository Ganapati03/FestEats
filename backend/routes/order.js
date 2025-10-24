const express = require('express');
const multer = require('multer');
const path = require('path');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, updatePaymentStatus, uploadScannerImage } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Configure multer for scanner image uploads
const scannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/scanner/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'scanner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const scannerUpload = multer({
  storage: scannerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG images are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/', auth, createOrder);
router.get('/my', auth, getMyOrders);
router.get('/', auth, admin, getAllOrders);
router.put('/:id/status', auth, admin, updateOrderStatus);
router.put('/:id/payment-status', auth, admin, updatePaymentStatus);
router.post('/:id/scanner', auth, admin, scannerUpload.single('scannerImage'), uploadScannerImage);

module.exports = router;
