import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MdPerson } from 'react-icons/md';
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
  }, [user, isAdmin]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students/${user.student_id}`);
      setStudentDetails(res.data.student);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

      {isAdmin ? (
        <div className="profile-layout">
          {/* Left Side: Profile Information */}
          <div className="profile-info-card">
            <div className="profile-avatar-header">
              <div className="profile-avatar-large"><MdPerson /></div>
              <h3 className="profile-display-name">System Administrator</h3>
              <span className="profile-display-role">Admin Account</span>
            </div>

            <div className="profile-details-list">
              <h4 className="section-subtitle">Account Details</h4>
              <div className="detail-row">
                <span className="detail-label">User ID / Username</span>
                <span className="detail-value">{user?.user_id}</span>
              </div>
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
      ) : (
        <div className="profile-student-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: Personal Information */}
          <div className="profile-info-card" style={{ padding: '30px' }}>
            <h3 className="card-title" style={{ borderBottom: '2px solid var(--primary-dark)', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: 'var(--primary-dark)' }}>Personal Information</h3>
            <div className="personal-info-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '30px' }}>
              
              {/* Left side details */}
              <div className="profile-details-list" style={{ flex: '1 1 500px' }}>
                <div className="detail-row">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{studentDetails?.name || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Admission Number</span>
                  <span className="detail-value">{studentDetails?.admission_no || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Class</span>
                  <span className="detail-value">Class {studentDetails?.class || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Section</span>
                  <span className="detail-value">{studentDetails?.section || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Academic Year</span>
                  <span className="detail-value">2026-27</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-value">{formatDate(studentDetails?.dob)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{studentDetails?.gender || '-'}</span>
                </div>
              </div>

              {/* Right side photo */}
              <div className="profile-photo-wrapper" style={{ flex: '0 0 150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {studentDetails?.photo_path ? (
                  <img 
                    src={`${import.meta.env.VITE_IMAGE_URL}${studentDetails.photo_path}`} 
                    alt={studentDetails?.name} 
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid #f0f4f8',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }} 
                  />
                ) : (
                  <div className="profile-avatar-large" style={{ width: '120px', height: '120px', margin: 0, fontSize: '64px' }}><MdPerson /></div>
                )}
              </div>

            </div>
          </div>

          {/* Card 2: Parent Information */}
          <div className="profile-info-card" style={{ padding: '30px' }}>
            <h3 className="card-title" style={{ borderBottom: '2px solid var(--primary-dark)', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: 'var(--primary-dark)' }}>Parent Information</h3>
            <div className="profile-details-list">
              <div className="detail-row">
                <span className="detail-label">Father's Name</span>
                <span className="detail-value">{studentDetails?.father_name || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Father's Mobile Number</span>
                <span className="detail-value">{studentDetails?.parent_mobile || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mother's Name</span>
                <span className="detail-value">{studentDetails?.mother_name || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mother's Mobile Number</span>
                <span className="detail-value">{studentDetails?.parent_mobile || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Permanent Address</span>
                <span className="detail-value">{studentDetails?.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Security & Password */}
          <div className="profile-security-card" style={{ padding: '30px' }}>
            <h3 className="card-title" style={{ borderBottom: '2px solid var(--primary-dark)', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: 'var(--primary-dark)' }}>Security & Password</h3>
            <p className="security-info-text">We recommend changing your password regularly to maintain account security.</p>

            {passwordSuccess && <div className="success-banner">{passwordSuccess}</div>}
            {passwordError && <div className="error-banner">{passwordError}</div>}

            <form onSubmit={handlePasswordChange} className="password-change-form" style={{ maxWidth: '500px' }}>
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
      )}
    </div>
  );
};

export default Profile;
