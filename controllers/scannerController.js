const Scanner = require('../models/Scanner');

// Get active scanner image for students
exports.getActiveScanner = async (req, res) => {
  try {
    const scanner = await Scanner.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!scanner) {
      return res.status(404).json({ message: 'No active scanner image found' });
    }
    res.json(scanner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload scanner image (admin only)
exports.uploadScanner = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    console.log('User:', req.user);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type (JPG and PNG allowed)
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only JPG and PNG images are allowed' });
    }

    // Validate file size (max 5MB) - handled by multer limits
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size must be less than 5MB' });
    }

    // Deactivate all existing scanners
    await Scanner.updateMany({}, { isActive: false });

    // Create new scanner with Cloudinary URL
    const scanner = new Scanner({
      image: req.file.path, // Cloudinary secure URL from multer-storage-cloudinary
      uploadedBy: req.user, // User ID from auth middleware
      isActive: true,
      description: req.body.description || ''
    });

    await scanner.save();

    console.log('Scanner saved successfully:', scanner);

    res.json({
      message: 'Scanner image uploaded successfully',
      scanner: {
        id: scanner._id,
        image: scanner.image,
        isActive: scanner.isActive,
        description: scanner.description
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Something went wrong!', error: error.message });
  }
};

// Get all scanner images (admin only)
exports.getAllScanners = async (req, res) => {
  try {
    const scanners = await Scanner.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 });
    res.json(scanners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update scanner status (admin only)
exports.updateScannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive) {
      // If activating, deactivate all others
      await Scanner.updateMany({}, { isActive: false });
    }

    const scanner = await Scanner.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!scanner) {
      return res.status(404).json({ message: 'Scanner not found' });
    }

    res.json({ message: 'Scanner status updated', scanner });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete scanner (admin only)
exports.deleteScanner = async (req, res) => {
  try {
    const { id } = req.params;
    const scanner = await Scanner.findByIdAndDelete(id);
    if (!scanner) {
      return res.status(404).json({ message: 'Scanner not found' });
    }

    res.json({ message: 'Scanner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
