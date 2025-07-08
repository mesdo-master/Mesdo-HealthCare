const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Mesdo Images', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg','pdf','docx'], // Supported formats
  },
});

const upload = multer({ storage });

module.exports = upload;
