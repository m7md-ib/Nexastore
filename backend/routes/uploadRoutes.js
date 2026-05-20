const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../config/cloudinary');

// @route   POST /api/upload/product
// @access  Admin
router.post('/product', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      alt: file.originalname,
    }));

    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/upload/:publicId
// @access  Admin
router.delete('/:publicId', protect, admin, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
