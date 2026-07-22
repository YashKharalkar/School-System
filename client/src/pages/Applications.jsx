import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MdAssignment, MdCheckCircle, MdPendingActions, MdSend, MdClose, MdWarning, MdPrint } from 'react-icons/md';
import sankalpLogo from '../assets/sankalp_logo.png';
import './Applications.css';

// ── Custom Confirm Modal ──────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = '#2e7d32' }) => {
  if (!isOpen) return null;
  return (
    <div className="app-confirm-overlay" onClick={onCancel}>
      <div className="app-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="app-confirm-icon">
          <MdWarning />
        </div>
        <h3 className="app-confirm-title">{title}</h3>
        <p className="app-confirm-msg">{message}</p>
        <div className="app-confirm-btns">
          <button className="app-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="app-confirm-ok" style={{ background: confirmColor }} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Toast / Info Banner ───────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  if (!msg) return null;
  return (
    <div className={`app-toast app-toast--${type}`}>
      <span>{msg}</span>
      <button className="app-toast-close" onClick={onClose}><MdClose /></button>
    </div>
  );
};

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [certType, setCertType] = useState('Bonafide Certificate');
  const [purpose, setPurpose] = useState('');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  // Confirm modal state
  const [confirm, setConfirm] = useState({
    open: false, title: '', message: '', confirmLabel: '', confirmColor: '#2e7d32', onConfirm: null
  });
  const openConfirm = (opts) => setConfirm({ open: true, ...opts });
  const closeConfirm = () => setConfirm(prev => ({ ...prev, open: false }));

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

  const openCertificateWindow = (app) => {
    const certWindow = window.open('', '_blank');
    if (!certWindow) {
      showToast('Pop-up blocker is preventing opening the certificate. Please allow popups.', 'error');
      return;
    }

    const todayDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const studentName = app.student_name || user?.name || 'Student';
    const studentClass = app.class ? `${app.class} - ${app.section || 'A'}` : (user?.class ? `${user.class} - ${user.section || 'A'}` : 'N/A');
    const admissionNo = app.admission_no || user?.admission_no || 'N/A';
    const certType = app.certificate_type;

    let certContent = '';

    if (certType === 'Attendance Certificate') {
      certContent = `
        <div class="cert-card">
          <div class="cert-header">
            <img class="cert-logo" src="${sankalpLogo}" alt="School Logo" />
            <div class="cert-header-text">
              <p class="org-sub">Learning Revolution by</p>
              <h2 class="org-title">SANKALP MULTIPURPOSE SOCIETY, RAMTEK</h2>
              <h4 class="campus-title">EDUCATIONAL CAMPUS</h4>
              <h1 class="school-title">Smt. Rajeshwari Reddy Scholar Convent</h1>
              <p class="school-address">Kodamendhi, Th. Mouda, Dist. Nagpur</p>
              <p class="school-meta">U-Dise No. 27090711806 &nbsp;|&nbsp; Index No. 06.09.031 &nbsp;|&nbsp; Mob. 8855925216</p>
            </div>
          </div>
          <div class="cert-date-row">
            <span><strong>Date:</strong> ${todayDate}</span>
          </div>
          <div class="cert-title-box">
            ATTENDANCE CERTIFICATE
          </div>
          <div class="cert-body">
            <p class="field-line">
              <strong>Name of the student:</strong> <span class="highlight-val">${studentName}</span>
            </p>
            <p class="cert-paragraph">
              <span class="highlight-val">${studentName}</span>, student of Class <strong>${studentClass}</strong> (Admission No: <strong>${admissionNo}</strong>), has more than <strong>75%</strong> attended school during the educational session <strong>2025-2026</strong> without loss of time from absence or tardiness, and is therefore awarded this Certificate.
            </p>
          </div>
          <div class="cert-footer">
            <div class="footer-left">
              <p><strong>Place:</strong> Kodamendhi</p>
              <p><strong>Date:</strong> ${todayDate}</p>
            </div>
            <div class="footer-right">
              <div class="sig-line"></div>
              <p><strong>Principal</strong></p>
            </div>
          </div>
        </div>
      `;
    } else if (certType === 'Admission Certificate') {
      certContent = `
        <div class="cert-card">
          <div class="cert-header">
            <img class="cert-logo" src="${sankalpLogo}" alt="School Logo" />
            <div class="cert-header-text">
              <p class="org-sub">Learning Revolution by</p>
              <h2 class="org-title">SANKALP MULTIPURPOSE SOCIETY, RAMTEK</h2>
              <h4 class="campus-title">EDUCATIONAL CAMPUS</h4>
              <h1 class="school-title">Smt. Rajeshwari Reddy Scholar Convent</h1>
              <p class="school-address">Kodamendhi, Th. Mouda, Dist. Nagpur</p>
              <p class="school-meta">U-Dise No. 27090711806 &nbsp;|&nbsp; Index No. 06.09.031 &nbsp;|&nbsp; Mob. 8855925216</p>
            </div>
          </div>
          <div class="cert-meta-row">
            <span><strong>Ref No:</strong> SMT/ADM/${app.id || '2026'}/${new Date().getFullYear()}</span>
            <span><strong>Date:</strong> ${todayDate}</span>
          </div>
          <div class="cert-title-box">
            TO WHOMSOEVER IT MAY CONCERN
          </div>
          <div class="cert-body">
            <p class="cert-paragraph">
              This is to certify that <strong>${app.gender === 'Female' ? 'Miss' : 'Master'} ${studentName}</strong> has been provisionally admitted to <strong>${studentClass}</strong> for Academic Year <strong>2025-2026</strong> in our school.
            </p>
            <p class="cert-paragraph">
              So you are requested to give him/her at the earliest necessary documents.
            </p>
            <div class="doc-checklist-box">
              <h4>Essential documents for confirm the Admission:</h4>
              <ol class="doc-list">
                <li>Cumulative record of student (previous class)</li>
                <li>T.C</li>
                <li>U-DISE CODE (previous school) + Student ID</li>
                <li>Mark list Xerox (previous class)</li>
              </ol>
            </div>
          </div>
          <div class="cert-footer">
            <div class="footer-left">
              <p><strong>Place:</strong> Kodamendhi</p>
              <p><strong>Date:</strong> ${todayDate}</p>
            </div>
            <div class="footer-right">
              <div class="sig-line"></div>
              <p><strong>Principal</strong></p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Default Bonafide Certificate render
      certContent = `
        <div class="cert-card">
          <div class="cert-header">
            <img class="cert-logo" src="${sankalpLogo}" alt="School Logo" />
            <div class="cert-header-text">
              <p class="org-sub">SANKALP BAHU-UDHESHIYA SANSTHA</p>
              <h2 class="org-title">SOUTH INDIAN EDUCATIONAL CAMPUS, KODAMENDHI</h2>
              <h4 class="campus-title">Learn It Live It & Pass It on</h4>
              <h1 class="school-title">Smt. Rajeshwari Reddy Scholar Convent</h1>
              <p class="school-address">Kodamendhi</p>
              <p class="school-meta">Mob: 8855925216, 7721040550</p>
            </div>
          </div>
          <div class="cert-meta-row">
            <span><strong>Place:</strong> Kodamendhi</span>
            <span><strong>Date:</strong> ${todayDate}</span>
          </div>
          <div class="cert-title-box">
            BONAFIDE CERTIFICATE
          </div>
          <div class="cert-body">
            <p class="cert-paragraph">
              This is to certify that Shri/Kum. <strong>${studentName}</strong> is a Bonafide student of Smt. Rajeshwari Reddy Scholar Convent Kodamendhi for Educational Session <strong>2025-2026</strong>.
            </p>
            <p class="cert-paragraph">
              He / She is presently appearing in Class <strong>${studentClass}</strong>. General Reg. No.: <strong>${admissionNo}</strong>.
            </p>
          </div>
          <div class="cert-footer">
            <div class="footer-left">
              <p><strong>Place:</strong> Kodamendhi</p>
              <p><strong>Date:</strong> ${todayDate}</p>
            </div>
            <div class="footer-right">
              <div class="sig-line"></div>
              <p><strong>Principal</strong></p>
            </div>
          </div>
        </div>
      `;
    }

    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${certType} - ${studentName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: 'Outfit', sans-serif;
            background-color: #f4f6f8;
            color: #2c3e50;
          }
          body {
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .no-print-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 210mm;
            max-width: 100%;
            margin: 0 auto 20px auto;
            background: #fff;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .btn-action {
            background: #1a237e;
            color: #fff;
            border: none;
            padding: 8px 18px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .btn-action:hover {
            background: #0d1b60;
          }
          .cert-card {
            width: 210mm;
            min-height: 275mm;
            margin: 0 auto;
            background: #fff;
            border: 4px double #1a237e;
            border-radius: 4px;
            padding: 45px 55px 55px 55px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .cert-header {
            display: flex;
            align-items: center;
            gap: 20px;
            border-bottom: 2px solid #1a237e;
            padding-bottom: 18px;
            margin-bottom: 25px;
          }
          .cert-logo {
            width: 100px;
            height: 100px;
            object-fit: contain;
          }
          .cert-header-text {
            flex: 1;
            text-align: center;
          }
          .org-sub {
            font-size: 12px;
            color: #555;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .org-title {
            font-size: 17px;
            font-weight: 700;
            color: #1a237e;
            margin: 3px 0;
            letter-spacing: 0.5px;
          }
          .campus-title {
            font-size: 13px;
            color: #c62828;
            margin: 3px 0;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .school-title {
            font-size: 23px;
            font-weight: 800;
            color: #1a237e;
            margin: 5px 0 3px 0;
            text-transform: uppercase;
          }
          .school-address {
            font-size: 12px;
            color: #444;
            margin: 3px 0;
          }
          .school-meta {
            font-size: 12px;
            font-weight: 600;
            color: #333;
            margin: 5px 0 0 0;
          }
          .cert-date-row {
            text-align: right;
            font-size: 14px;
            color: #333;
            margin-bottom: 20px;
          }
          .cert-meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #333;
            margin-bottom: 20px;
          }
          .cert-title-box {
            text-align: center;
            font-size: 20px;
            font-weight: 800;
            color: #fff;
            background: #1a237e;
            padding: 10px 30px;
            margin: 15px auto 25px auto;
            display: table;
            border-radius: 4px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .cert-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            font-size: 17px;
            line-height: 2.1;
            color: #2c3e50;
            padding: 15px 0 20px 0;
          }
          .field-line {
            font-size: 18px;
            margin-bottom: 22px;
          }
          .highlight-val {
            font-weight: 700;
            color: #1a237e;
            border-bottom: 1px dotted #1a237e;
            padding: 0 6px;
          }
          .cert-paragraph {
            margin-bottom: 22px;
            text-align: justify;
          }
          .doc-checklist-box {
            background: #f8f9fa;
            border-left: 4px solid #1a237e;
            padding: 18px 24px;
            margin-top: 30px;
            border-radius: 4px;
          }
          .doc-checklist-box h4 {
            margin: 0 0 12px 0;
            font-size: 15px;
            color: #1a237e;
          }
          .doc-list {
            margin: 0;
            padding-left: 22px;
            font-size: 15px;
            line-height: 1.8;
          }
          .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: auto;
            padding-top: 40px;
          }
          .footer-left p {
            margin: 5px 0;
            font-size: 14px;
          }
          .footer-right {
            text-align: center;
            width: 200px;
          }
          .sig-line {
            border-bottom: 1.5px dashed #1a237e;
            height: 55px;
            margin-bottom: 8px;
          }
          .footer-right p {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            color: #1a237e;
          }
          @media print {
            html, body {
              width: 210mm;
              height: 297mm;
              background: #fff;
              padding: 0;
              margin: 0;
            }
            body {
              display: block;
            }
            .no-print-bar {
              display: none !important;
            }
            .cert-card {
              width: 210mm;
              height: 297mm;
              min-height: 297mm;
              max-width: none;
              box-shadow: none;
              border: 4px double #1a237e;
              border-radius: 0;
              padding: 25mm 20mm 25mm 20mm;
              margin: 0;
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <span style="font-weight:600; font-size:15px; color:#1a237e;">${certType} Preview (A4 Size)</span>
          <div>
            <button class="btn-action" onclick="window.print()">
              🖨️ Print / Download PDF
            </button>
          </div>
        </div>
        ${certContent}
      </body>
      </html>
    `);
    certWindow.document.close();
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      showToast('Please provide the purpose or remarks for the application.', 'error');
      return;
    }
    setFormSubmitLoading(true);
    try {
      const res = await api.post('/applications', {
        certificate_type: certType,
        purpose: purpose.trim()
      });
      if (res.data.success) {
        showToast('Application submitted successfully!', 'success');
        window.dispatchEvent(new Event('applicationStatusChanged'));
        setPurpose('');
        fetchApplications();
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
      showToast(err.response?.data?.message || 'Failed to submit application.', 'error');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleAcceptAndGenerate = (app) => {
    openConfirm({
      title: 'Accept & Print Certificate',
      message: `Are you sure you want to accept and print the ${app.certificate_type} for ${app.student_name}?`,
      confirmLabel: 'Accept & Print',
      confirmColor: '#2e7d32',
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await api.put(`/applications/${app.id}/accept`);
          if (res.data.success) {
            showToast('Application accepted and certificate generated successfully.', 'success');
            window.dispatchEvent(new Event('applicationStatusChanged'));
            fetchApplications();
            openCertificateWindow(app);
          }
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to accept application.', 'error');
        }
      }
    });
  };

  const handleReject = (appId) => {
    openConfirm({
      title: 'Reject Application',
      message: 'Are you sure you want to reject this application? This action cannot be undone.',
      confirmLabel: 'Reject',
      confirmColor: '#c62828',
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await api.put(`/applications/${appId}/reject`);
          if (res.data.success) {
            showToast('Application rejected.', 'error');
            window.dispatchEvent(new Event('applicationStatusChanged'));
            fetchApplications();
          }
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to reject application.', 'error');
        }
      }
    });
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

        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

        <ConfirmModal
          isOpen={confirm.open}
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmColor={confirm.confirmColor}
          onConfirm={confirm.onConfirm}
          onCancel={closeConfirm}
        />

        <div className="dashboard-card applications-list-card">
          <h3 className="card-title">Certificate Requests</h3>
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
                    <th>Class &amp; Section</th>
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
                          {app.status === 'Pending' ? <MdPendingActions /> : app.status === 'Done' ? <MdCheckCircle /> : <MdClose />}
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status === 'Pending' ? (
                          <div className="app-action-btns">
                            <button
                              className="btn btn-sm accept-btn"
                              onClick={() => handleAcceptAndGenerate(app)}
                            >
                              Accept &amp; Print
                            </button>
                            <button
                              className="btn btn-sm reject-btn"
                              onClick={() => handleReject(app.id)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : app.status === 'Done' ? (
                          <div className="app-action-btns">
                            <span className="text-muted" style={{ marginRight: '4px' }}>Done</span>
                            <button
                              className="btn btn-sm view-cert-btn"
                              onClick={() => openCertificateWindow(app)}
                              title="Print Certificate"
                            >
                              <MdPrint /> Print
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">{app.status}</span>
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

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

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
                <option value="Attendance Certificate">Attendance Certificate</option>
                <option value="Admission Certificate">Admission Certificate</option>
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
                    <th>Action</th>
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
                          {app.status === 'Pending' ? <MdPendingActions /> : app.status === 'Done' ? <MdCheckCircle /> : <MdClose />}
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status === 'Done' ? (
                          <button
                            className="btn btn-sm view-cert-btn"
                            onClick={() => openCertificateWindow(app)}
                            title="Print Certificate"
                          >
                            <MdPrint /> Print
                          </button>
                        ) : (
                          <span className="text-muted">-</span>
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
    </div>
  );
};

export default Applications;

