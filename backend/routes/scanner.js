const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { getActiveScanner, uploadScanner, getAllScanners, updateScannerStatus, deleteScanner } = require('../controllers/scannerController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for Cloudinary storage
const scannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'festeats/scanners',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `scanner-${Date.now()}-${Math.round(Math.random() * 1E9)}`
  }
});

const scannerUpload = multer({
  storage: scannerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public route for students to get active scanner
router.get('/active', getActiveScanner);

// Admin routes
router.post('/upload', auth, admin, (req, res, next) => {
  scannerUpload.single('scannerImage')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}, uploadScanner);
router.get('/', auth, admin, getAllScanners);
router.put('/:id/status', auth, admin, updateScannerStatus);
router.delete('/:id', auth, admin, deleteScanner);

module.exports = router;
