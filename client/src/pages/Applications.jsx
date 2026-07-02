import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MdAssignment, MdCheckCircle, MdPendingActions, MdSend } from 'react-icons/md';
import './Applications.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [certType, setCertType] = useState('Bonafide Certificate');
  const [purpose, setPurpose] = useState('');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      alert('Please provide the purpose or remarks for the application.');
      return;
    }
    setFormSubmitLoading(true);
    try {
      const res = await api.post('/applications', {
        certificate_type: certType,
        purpose: purpose.trim()
      });
      if (res.data.success) {
        alert('Application submitted successfully!');
        window.dispatchEvent(new Event('applicationStatusChanged'));
        setPurpose('');
        fetchApplications();
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleAccept = async (appId) => {
    if (!window.confirm('Are you sure you want to accept and mark this application as Done?')) {
      return;
    }
    try {
      const res = await api.put(`/applications/${appId}/accept`);
      if (res.data.success) {
        alert('Application accepted successfully.');
        window.dispatchEvent(new Event('applicationStatusChanged'));
        fetchApplications();
      }
    } catch (err) {
      console.error('Failed to accept application:', err);
      alert(err.response?.data?.message || 'Failed to accept application.');
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (user?.role === 'admin') {
    return (
      <div className="applications-page" id="applications-page-admin">
        <div className="page-header">
          <h2 className="page-title">Certificate Applications</h2>
          <span className="breadcrumb">Home / Applications</span>
        </div>

        <div className="dashboard-card applications-list-card">
          <h3 className="card-title">Pending Requests</h3>
          {loading ? (
            <div className="loading-state">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">No certificate applications found.</div>
          ) : (
            <div className="table-responsive">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Admission No</th>
                    <th>Class & Section</th>
                    <th>Certificate Type</th>
                    <th>Remarks / Purpose</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="date-cell">{formatDateTime(app.created_at)}</td>
                      <td>
                        <div className="student-profile-cell">
                          <span className="student-name">{app.student_name}</span>
                          <span className="student-gender-sub">{app.gender}</span>
                        </div>
                      </td>
                      <td>{app.admission_no}</td>
                      <td>{app.class} - {app.section}</td>
                      <td>
                        <span className="badge-cert">{app.certificate_type}</span>
                      </td>
                      <td className="purpose-cell" title={app.purpose}>{app.purpose}</td>
                      <td>
                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                          {app.status === 'Pending' ? <MdPendingActions /> : <MdCheckCircle />}
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status === 'Pending' ? (
                          <button 
                            className="btn btn-primary btn-sm accept-btn"
                            onClick={() => handleAccept(app.id)}
                          >
                            Accept
                          </button>
                        ) : (
                          <span className="text-muted">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Student view
  return (
    <div className="applications-page" id="applications-page-student">
      <div className="page-header">
        <h2 className="page-title">Applications</h2>
        <span className="breadcrumb">Home / Applications</span>
      </div>

      <div className="applications-student-grid">
        {/* Request Form */}
        <div className="dashboard-card application-form-card">
          <h3 className="card-title">Application For Certificate</h3>
          <form onSubmit={handleApply} className="application-form">
            <div className="form-group">
              <label className="form-label">Select Certificate Type</label>
              <select 
                className="form-control" 
                value={certType} 
                onChange={(e) => setCertType(e.target.value)}
              >
                <option value="Bonafide Certificate">Bonafide Certificate</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks / Purpose</label>
              <textarea 
                className="form-control text-area-purpose" 
                rows="4"
                placeholder="Enter details, reason, or purpose for requesting this certificate..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary submit-app-btn" 
              disabled={formSubmitLoading}
            >
              <MdSend /> {formSubmitLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Status Table */}
        <div className="dashboard-card application-status-card">
          <h3 className="card-title">Application Status</h3>
          {loading ? (
            <div className="loading-state">Loading your applications...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">No previous application history.</div>
          ) : (
            <div className="table-responsive">
              <table className="status-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Certificate Type</th>
                    <th>Remarks / Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="date-cell">{formatDateTime(app.created_at)}</td>
                      <td><span className="badge-cert">{app.certificate_type}</span></td>
                      <td className="purpose-cell" title={app.purpose}>{app.purpose}</td>
                      <td>
                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                          {app.status === 'Pending' ? <MdPendingActions /> : <MdCheckCircle />}
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
