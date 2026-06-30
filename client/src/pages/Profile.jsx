import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Password Change States
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin && user?.student_id) {
      fetchStudentDetails();
    }
  }, []);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      // We can use the existing student get API or a profile specific one. Let's use the student detail api.
      const res = await api.get(`/students/${user.student_id}`);
      setStudentDetails(res.data.student);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(true);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="profile-page" id="profile-page">
      <div className="page-header">
        <h2 className="page-title">My Profile</h2>
        <span className="breadcrumb">Home / Profile</span>
      </div>

      <div className="profile-layout">
        {/* Left Side: Profile Information */}
        <div className="profile-info-card">
          <div className="profile-avatar-header">
            <div className="profile-avatar-large">👤</div>
            <h3 className="profile-display-name">{isAdmin ? 'System Administrator' : studentDetails?.name}</h3>
            <span className="profile-display-role">{isAdmin ? 'Admin Account' : `Student (Class ${studentDetails?.class} - ${studentDetails?.section})`}</span>
          </div>

          <div className="profile-details-list">
            <h4 className="section-subtitle">Account Details</h4>
            <div className="detail-row">
              <span className="detail-label">User ID / Username</span>
              <span className="detail-value">{user?.user_id}</span>
            </div>

            {!isAdmin && studentDetails && (
              <>
                <div className="detail-row">
                  <span className="detail-label">Admission Number</span>
                  <span className="detail-value">{studentDetails.admission_no}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Roll Number</span>
                  <span className="detail-value">{studentDetails.roll_no || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Class & Section</span>
                  <span className="detail-value">Class {studentDetails.class} (Section {studentDetails.section})</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{studentDetails.gender}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-value">{formatDate(studentDetails.dob)}</span>
                </div>

                <h4 className="section-subtitle" style={{ marginTop: '20px' }}>Guardian Details</h4>
                <div className="detail-row">
                  <span className="detail-label">Father's Name</span>
                  <span className="detail-value">{studentDetails.father_name || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Mother's Name</span>
                  <span className="detail-value">{studentDetails.mother_name || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Contact Number</span>
                  <span className="detail-value">{studentDetails.contact_no || '-'}</span>
                </div>

                <h4 className="section-subtitle" style={{ marginTop: '20px' }}>Address Details</h4>
                <div className="detail-row">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{studentDetails.address || '-'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Security / Password Change */}
        <div className="profile-security-card">
          <h3 className="card-title">Security & Password</h3>
          <p className="security-info-text">We recommend changing your password regularly to maintain account security.</p>

          {passwordSuccess && <div className="success-banner">{passwordSuccess}</div>}
          {passwordError && <div className="error-banner">{passwordError}</div>}

          <form onSubmit={handlePasswordChange} className="password-change-form">
            <div className="form-group">
              <label>Current Password *</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-password-submit" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
