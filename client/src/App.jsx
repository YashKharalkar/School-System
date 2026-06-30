import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import Documents from './pages/Documents';
import SMS from './pages/SMS';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import ExamTimetable from './pages/ExamTimetable';
import Fees from './pages/Fees';
import Notices from './pages/Notices';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={
              <ProtectedRoute roles={['admin']}>
                <StudentManagement />
              </ProtectedRoute>
            } />
            <Route path="students/add" element={
              <ProtectedRoute roles={['admin']}>
                <StudentManagement />
              </ProtectedRoute>
            } />
            <Route path="documents" element={<Documents />} />
            <Route path="sms" element={
              <ProtectedRoute roles={['admin']}>
                <SMS />
              </ProtectedRoute>
            } />
            <Route path="attendance" element={<Attendance />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="exam-timetable" element={<ExamTimetable />} />
            <Route path="fees" element={<Fees />} />
            <Route path="notices" element={<Notices />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
