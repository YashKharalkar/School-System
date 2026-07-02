const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const dirs = ['documents', 'timetables', 'exam-timetables', 'photos', 'fee-structures'];
dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', 'uploads', dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Document upload config
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'documents')),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e4)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const documentFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, PNG, and JPG files are allowed.'), false);
  }
};

const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Timetable upload config
const timetableStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'timetables')),
  filename: (req, file, cb) => {
    const uniqueName = `tt_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const timetableFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed.'), false);
};

const uploadTimetable = multer({
  storage: timetableStorage,
  fileFilter: timetableFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Exam timetable upload config
const examTimetableStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'exam-timetables')),
  filename: (req, file, cb) => {
    const uniqueName = `et_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadExamTimetable = multer({
  storage: examTimetableStorage,
  fileFilter: timetableFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Student photo upload config
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'photos')),
  filename: (req, file, cb) => {
    const uniqueName = `photo_${Date.now()}_${Math.round(Math.random() * 1e4)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const photoFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PNG, JPG, JPEG, and WEBP image files are allowed.'), false);
};

const uploadStudentPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Fee Structure upload config
const feeStructureStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'fee-structures')),
  filename: (req, file, cb) => {
    const uniqueName = `fs_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadFeeStructure = multer({
  storage: feeStructureStorage,
  fileFilter: timetableFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = { uploadDocument, uploadTimetable, uploadExamTimetable, uploadStudentPhoto, uploadFeeStructure };
