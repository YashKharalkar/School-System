import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MdPerson } from 'react-icons/md';
import StudentDetailsForm from '../components/StudentDetailsForm';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Detailed Profile Modal States
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [sigPreview, setSigPreview] = useState(null);

  // Password Change States
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Admin DOB States
  const [adminDob, setAdminDob] = useState('');
  const [adminDobInput, setAdminDobInput] = useState('');
  const [adminDobEditing, setAdminDobEditing] = useState(false);
  const [adminDobLoading, setAdminDobLoading] = useState(false);
  const [adminDobMsg, setAdminDobMsg] = useState('');

  const [academicYear, setAcademicYear] = useState('2026-27');

  useEffect(() => {
    const fetchAcademicYearSetting = async () => {
      try {
        const res = await api.get('/settings/academic-year');
        if (res.data.success) {
          setAcademicYear(res.data.academicYear);
        }
      } catch (err) {
        console.error('Failed to fetch academic year:', err);
      }
    };
    fetchAcademicYearSetting();
  }, []);

  // Fetch admin DOB on mount
  useEffect(() => {
    if (isAdmin) {
      api.get('/auth/admin/dob').then(res => {
        if (res.data.success && res.data.dob) {
          const d = new Date(res.data.dob).toISOString().split('T')[0];
          setAdminDob(d);
          setAdminDobInput(d);
        }
      }).catch(() => {});
    }
  }, [isAdmin]);

  const handleSaveAdminDob = async () => {
    if (!adminDobInput) { setAdminDobMsg('Please select a date.'); return; }
    setAdminDobLoading(true);
    try {
      await api.put('/auth/admin/dob', { dob: adminDobInput });
      setAdminDob(adminDobInput);
      setAdminDobEditing(false);
      setAdminDobMsg('✅ Date of Birth saved successfully.');
      setTimeout(() => setAdminDobMsg(''), 3000);
    } catch (err) {
      setAdminDobMsg(err.response?.data?.message || 'Failed to save DOB.');
    } finally {
      setAdminDobLoading(false);
    }
  };

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
      setDetailsForm(res.data.student || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = () => {
    setDetailsForm(studentDetails || {});
    setPhotoFile(null);
    setSignatureFile(null);
    setPhotoPreview(null);
    setSigPreview(null);
    setIsEditingDetails(false);
    setShowDetailsModal(true);
  };

  const handleDetailsChange = (name, value) => {
    setDetailsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = e.target.name;
    if (name === 'photo') {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else if (name === 'signature') {
      setSignatureFile(file);
      setSigPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveDetails = async () => {
    try {
      const formData = new FormData();
      Object.keys(detailsForm).forEach(key => {
        if (detailsForm[key] !== null && detailsForm[key] !== undefined && key !== 'photo_path' && key !== 'signature_path') {
          formData.append(key, detailsForm[key]);
        }
      });
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      if (signatureFile) {
        formData.append('signature', signatureFile);
      }

      await api.put('/students/profile/my', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchStudentDetails();
      setIsEditingDetails(false);
      alert('Detailed profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile details.');
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

              {/* DOB Row */}
              <div className="detail-row" style={{ alignItems: 'center', gap: '8px' }}>
                <span className="detail-label">Date of Birth</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  {adminDobEditing ? (
                    <>
                      <input
                        type="date"
                        value={adminDobInput}
                        onChange={e => setAdminDobInput(e.target.value)}
                        style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px' }}
                      />
                      <button
                        onClick={handleSaveAdminDob}
                        disabled={adminDobLoading}
                        style={{ padding: '4px 12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {adminDobLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setAdminDobEditing(false); setAdminDobInput(adminDob || ''); }}
                        style={{ padding: '4px 10px', background: '#fff', color: '#666', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="detail-value">{adminDob ? formatDate(adminDob) : 'Not set'}</span>
                      <button
                        onClick={() => { setAdminDobEditing(true); setAdminDobInput(adminDob || ''); }}
                        style={{ padding: '4px 10px', background: '#1565c0', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
              {adminDobMsg && (
                <div style={{ fontSize: '12px', color: adminDobMsg.startsWith('✅') ? '#2e7d32' : '#c62828', marginTop: '4px', textAlign: 'right' }}>
                  {adminDobMsg}
                </div>
              )}
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px', fontStyle: 'italic' }}>
                * Date of Birth is used for password reset verification.
              </p>
            </div>
          </div>

          {/* Right Side: Security / Password Change */}
          <div className="profile-security-card">
            <h3 className="card-title">Security &amp; Password</h3>
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
                  <span className="detail-value">{academicYear}</span>
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
              <div className="profile-photo-wrapper" style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
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
                <button 
                  type="button" 
                  onClick={openDetailsModal} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-dark)',
                    fontWeight: '600',
                    fontSize: '14px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  More Details
                </button>
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

      {/* Detailed Details Modal */}
      {showDetailsModal && detailsForm && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-lg" style={{ width: '900px', maxWidth: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Detailed Student Profile</h3>
                <span style={{ fontSize: '12px', color: '#666' }}>{studentDetails?.name} (Admn: {studentDetails?.admission_no})</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {isEditingDetails ? (
                  <button 
                    type="button" 
                    onClick={handleSaveDetails} 
                    className="btn-save"
                    style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                  >
                    Save
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsEditingDetails(true)} 
                    className="btn-save"
                    style={{ background: '#1565c0', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                  >
                    Edit
                  </button>
                )}
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
              </div>
            </div>
            
            <div className="modal-body" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <StudentDetailsForm 
                formData={detailsForm} 
                isEditable={isEditingDetails} 
                isAdmin={false} // Student login, so name/class/section remain read-only
                onChange={handleDetailsChange}
                onFileChange={handleFileChange}
                photoPreview={photoPreview}
                sigPreview={sigPreview}
              />
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
