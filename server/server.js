const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const smsRoutes = require('./routes/smsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const examTimetableRoutes = require('./routes/examTimetableRoutes');
const feeRoutes = require('./routes/feeRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const backupRoutes = require('./routes/backupRoutes');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: ['http://localhost:5173', 'https://school-system-udzq.vercel.app'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/exam-timetable', examTimetableRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
