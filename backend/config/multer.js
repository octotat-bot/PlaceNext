const multer = require('multer');
const path = require('path');

// Resume storage configuration
const resumeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resumes/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `resume-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// Profile image storage configuration
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// File filter for PDFs only
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

// File filter for images
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Resume upload middleware
const uploadResume = multer({
    storage: resumeStorage,
    fileFilter: pdfFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    },
});

// Profile image upload middleware
const uploadProfile = multer({
    storage: profileStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
    },
});

module.exports = { uploadResume, uploadProfile };
