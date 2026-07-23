import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MdAssignment, MdCheckCircle, MdPendingActions, MdSend, MdClose, MdWarning, MdPrint, MdSchool, MdAssignmentInd, MdPoll, MdSearch, MdPerson } from 'react-icons/md';
import sankalpLogo from '../assets/sankalp_logo.png';
import './Applications.css';

const CLASSES = ['All Classes', 'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SECTIONS = ['Everyone', 'A', 'B', 'C'];
const GENDERS = ['Everyone', 'Male', 'Female'];

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

  // Admin state
  const [adminTab, setAdminTab] = useState('requests'); // 'requests' | 'generate'
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showStudentList, setShowStudentList] = useState(true);

  const [genCertType, setGenCertType] = useState('Bonafide Certificate');
  const [genAcademicYear, setGenAcademicYear] = useState('2026-2027');
  const [genRefNo, setGenRefNo] = useState('');
  const [genAttendancePct, setGenAttendancePct] = useState('75%');
  const [genDate, setGenDate] = useState(new Date().toISOString().split('T')[0]);

  // Extra Bonafide fields
  const [genDob, setGenDob] = useState('');
  const [genAadhaar, setGenAadhaar] = useState('');
  const [genCaste, setGenCaste] = useState('');
  const [genStudentIdNo, setGenStudentIdNo] = useState('');
  const [genApaarId, setGenApaarId] = useState('');
  const [genPenNo, setGenPenNo] = useState('');

  // Admin student filters
  const [genFilterName, setGenFilterName] = useState('');
  const [genFilterAdmissionNo, setGenFilterAdmissionNo] = useState('');
  const [genFilterClass, setGenFilterClass] = useState('All Classes');
  const [genFilterSection, setGenFilterSection] = useState('Everyone');
  const [genFilterGender, setGenFilterGender] = useState('Everyone');
  const [genHasSearched, setGenHasSearched] = useState(false);

  const handleSelectStudent = (student) => {
    setSelectedStudentId(student.id.toString());
    setGenDob(student.dob ? new Date(student.dob).toISOString().split('T')[0] : '');
    setGenAadhaar(student.aadhaar_no || '');
    setGenStudentIdNo(student.student_id || student.admission_no || '');
    setShowStudentList(false);
  };

  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const [confirm, setConfirm] = useState({
    open: false, title: '', message: '', confirmLabel: '', confirmColor: '#2e7d32', onConfirm: null
  });
  const openConfirm = (opts) => setConfirm({ open: true, ...opts });
  const closeConfirm = () => setConfirm(prev => ({ ...prev, open: false }));

  useEffect(() => {
    fetchApplications();
    if (user?.role === 'admin') {
      fetchStudentsList();
    }
  }, [user]);

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

  const fetchStudentsList = async () => {
    try {
      const res = await api.get('/students', { params: { limit: 500 } });
      if (res.data.students) setStudentsList(res.data.students);
    } catch (err) {
      console.error('Failed to load students list for certificates:', err);
    }
  };

  const openCertificateWindow = (app) => {
    const certWindow = window.open('', '_blank');
    if (!certWindow) {
      showToast('Pop-up blocker is preventing opening the certificate. Please allow popups.', 'error');
      return;
    }

    const todayDate = app.date ? new Date(app.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const studentName = app.student_name || app.name || user?.name || 'Student';
    const studentClass = app.class ? `${app.class} - ${app.section || 'A'}` : (user?.class ? `${user.class} - ${user.section || 'A'}` : 'N/A');
    const admissionNo = app.admission_no || user?.admission_no || 'N/A';
    const certType = app.certificate_type;
    const academicYear = app.academic_year || '2025-2026';
    const attendancePct = app.attendance_pct || '75%';
    const refNo = app.ref_no || `SMT/ADM/${app.id || '2026'}/${new Date().getFullYear()}`;

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
              <span class="highlight-val">${studentName}</span>, student of Class <strong>${studentClass}</strong> (Admission No: <strong>${admissionNo}</strong>), has more than <strong>${attendancePct}</strong> attended school during the educational session <strong>${academicYear}</strong> without loss of time from absence or tardiness, and is therefore awarded this Certificate.
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
            <span><strong>Ref No:</strong> ${refNo}</span>
            <span><strong>Date:</strong> ${todayDate}</span>
          </div>
          <div class="cert-title-box">
            TO WHOMSOEVER IT MAY CONCERN
          </div>
          <div class="cert-body">
            <p class="cert-paragraph">
              This is to certify that <strong>${app.gender === 'Female' ? 'Miss' : 'Master'} ${studentName}</strong> has been provisionally admitted to <strong>${studentClass}</strong> for Academic Year <strong>${academicYear}</strong> in our school.
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
      const dobFormatted = app.dob ? new Date(app.dob).toLocaleDateString('en-GB') : 'N/A';
      const aadhaarNo = app.aadhaar_no || 'N/A';
      const caste = app.caste || 'N/A';
      const studentIdNo = app.student_id_no || 'N/A';
      const apaarId = app.apaar_id || 'N/A';
      const penNo = app.pen_no || 'N/A';

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
            <p class="cert-paragraph" style="font-size: 15px; line-height: 1.8;">
              This is to certify that Shri/Kum. <strong>${studentName}</strong> is an Bonafide student of <strong>Smt. Rajeshwari Reddy Scholar Convent Kodamendhi</strong> Educational Session <strong>${academicYear}</strong>.
            </p>
            <p class="cert-paragraph" style="font-size: 15px; line-height: 1.8; margin-top: 10px;">
              He / She presently appeared in Class <strong>${studentClass}</strong>.
            </p>

            <div class="cert-details-grid">
              <div class="detail-row">
                <span class="detail-label">General Reg. No. :</span>
                <span class="detail-value">${admissionNo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date of Birth :</span>
                <span class="detail-value">${dobFormatted}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Aadhaar No. :</span>
                <span class="detail-value">${aadhaarNo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Caste :</span>
                <span class="detail-value">${caste}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Student ID :</span>
                <span class="detail-value">${studentIdNo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Apaar ID :</span>
                <span class="detail-value">${apaarId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">PEN No. :</span>
                <span class="detail-value">${penNo}</span>
              </div>
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
            font-size: 22px;
            font-weight: 800;
            color: #1a237e;
            background: transparent;
            padding: 8px 0;
            margin: 15px auto 25px auto;
            display: block;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border: none;
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
          .cert-details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px 28px;
            margin: 28px 0 20px 0;
            padding: 20px 24px;
            background: #f8fafc;
            border: 1.5px solid #1a237e;
            border-radius: 8px;
          }
          .detail-row {
            display: flex;
            align-items: center;
            font-size: 14px;
          }
          .detail-label {
            font-weight: 700;
            color: #1a237e;
            width: 145px;
          }
          .detail-value {
            font-weight: 600;
            color: #2c3e50;
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

  const handleAccept = (app) => {
    openConfirm({
      title: 'Accept Application',
      message: `Are you sure you want to accept the ${app.certificate_type} application for ${app.student_name}?`,
      confirmLabel: 'Accept',
      confirmColor: '#2e7d32',
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await api.put(`/applications/${app.id}/accept`);
          if (res.data.success) {
            showToast('Application accepted successfully.', 'success');
            window.dispatchEvent(new Event('applicationStatusChanged'));
            fetchApplications();
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

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Please select a student.', 'error');
      return;
    }
    const student = studentsList.find(s => s.id.toString() === selectedStudentId.toString());
    if (!student) {
      showToast('Selected student record not found.', 'error');
      return;
    }

    openCertificateWindow({
      certificate_type: genCertType,
      student_name: student.name,
      admission_no: student.admission_no,
      class: student.class,
      section: student.section,
      gender: student.gender,
      academic_year: genAcademicYear,
      dob: genDob || student.dob || '',
      aadhaar_no: genAadhaar,
      caste: genCaste,
      student_id_no: genStudentIdNo || student.student_id || '',
      apaar_id: genApaarId,
      pen_no: genPenNo,
      ref_no: genRefNo || `SMT/ADM/${student.admission_no}/${new Date().getFullYear()}`,
      attendance_pct: genAttendancePct,
      date: genDate
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (user?.role === 'admin') {
    const selectedStudentObj = studentsList.find(s => s.id.toString() === selectedStudentId.toString());

    return (
      <div className="applications-page" id="applications-page-admin">
        <div className="page-header">
          <h2 className="page-title">Certificate Management</h2>
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

        <div className="admin-cert-tabs">
          <button
            className={`admin-cert-tab-btn ${adminTab === 'requests' ? 'active' : ''}`}
            onClick={() => setAdminTab('requests')}
          >
            <MdAssignment /> Certificate Requests
          </button>
          <button
            className={`admin-cert-tab-btn ${adminTab === 'generate' ? 'active' : ''}`}
            onClick={() => setAdminTab('generate')}
          >
            <MdPrint /> Generate Certificate
          </button>
        </div>

        {adminTab === 'requests' && (
          <div className="dashboard-card applications-list-card">
            <h3 className="card-title">Certificate Requests List</h3>
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
                                onClick={() => handleAccept(app)}
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-sm reject-btn"
                                onClick={() => handleReject(app.id)}
                              >
                                Reject
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
        )}

        {adminTab === 'generate' && (
          <div className="dashboard-card application-form-card">
            <h3 className="card-title">Generate Certificate</h3>

            {(!selectedStudentObj || showStudentList) ? (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Filter &amp; Select Student
                </h4>
                <div className="filter-bar" style={{ marginBottom: '16px' }}>
                  <div className="filter-left">
                    <div className="filter-group">
                      <label>Name</label>
                      <input
                        type="text"
                        placeholder="Filter by name"
                        value={genFilterName}
                        onChange={(e) => setGenFilterName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setGenHasSearched(true)}
                      />
                    </div>
                    <div className="filter-group">
                      <label>Admission No</label>
                      <input
                        type="text"
                        placeholder="Filter by admission no"
                        value={genFilterAdmissionNo}
                        onChange={(e) => setGenFilterAdmissionNo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setGenHasSearched(true)}
                      />
                    </div>
                    <div className="filter-group">
                      <label>Class</label>
                      <select value={genFilterClass} onChange={(e) => setGenFilterClass(e.target.value)}>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Section</label>
                      <select value={genFilterSection} onChange={(e) => setGenFilterSection(e.target.value)}>
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Gender</label>
                      <select value={genFilterGender} onChange={(e) => setGenFilterGender(e.target.value)}>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <button type="button" className="btn-search" onClick={() => setGenHasSearched(true)}>
                      <MdSearch /> Show
                    </button>
                  </div>
                </div>

                {!genHasSearched ? (
                  <div className="table-placeholder-card">
                    <p>Please select filters and click "Show" to search student records for certificate generation.</p>
                  </div>
                ) : (() => {
                  const filteredGenStudents = studentsList.filter(s => {
                    if (genFilterClass !== 'All Classes' && s.class !== genFilterClass) return false;
                    if (genFilterSection !== 'Everyone' && (s.section || 'A') !== genFilterSection) return false;
                    if (genFilterGender !== 'Everyone' && s.gender !== genFilterGender) return false;
                    if (genFilterName && !s.name.toLowerCase().includes(genFilterName.toLowerCase())) return false;
                    if (genFilterAdmissionNo && !s.admission_no.toLowerCase().includes(genFilterAdmissionNo.toLowerCase())) return false;
                    return true;
                  });

                  if (filteredGenStudents.length === 0) {
                    return (
                      <div className="table-placeholder-card">
                        <p>No matching student records found for the applied filters.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Admission No.</th>
                            <th>Student Name</th>
                            <th>Class</th>
                            <th>Section</th>
                            <th>Gender</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredGenStudents.map(s => (
                            <tr key={s.id}>
                              <td>{s.admission_no}</td>
                              <td><strong>{s.name}</strong></td>
                              <td>{s.class}</td>
                              <td>{s.section || 'A'}</td>
                              <td>{s.gender || 'Male'}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-view-docs"
                                  onClick={() => handleSelectStudent(s)}
                                >
                                  Select Student
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="selected-student-banner" style={{ background: '#e8eaf6', padding: '16px 20px', borderRadius: '8px', border: '1px solid #c5cae9', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ background: '#1a237e', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    <MdPerson />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a237e' }}>
                      {selectedStudentObj.name} <span style={{ fontSize: '12px', fontWeight: '500', color: '#555', marginLeft: '6px' }}>({selectedStudentObj.gender || 'Student'})</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>
                      Admission No: <strong>{selectedStudentObj.admission_no}</strong> &nbsp;|&nbsp; Class &amp; Section: <strong>Class {selectedStudentObj.class} - {selectedStudentObj.section || 'A'}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#ffffff', border: '1px solid #1a237e', color: '#1a237e', fontWeight: '600', padding: '7px 16px', borderRadius: '6px' }}
                  onClick={() => setShowStudentList(true)}
                >
                  Change / Reselect Student
                </button>
              </div>
            )}

            {selectedStudentObj && !showStudentList && (
              <>
                <div className="cert-type-picker">
                  <div
                    className={`cert-type-card ${genCertType === 'Bonafide Certificate' ? 'selected' : ''}`}
                    onClick={() => setGenCertType('Bonafide Certificate')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                      <MdSchool style={{ fontSize: '20px', color: '#1a237e' }} />
                      <h4 style={{ margin: 0 }}>Bonafide Certificate</h4>
                    </div>
                    <p>Official bonafide proof for student</p>
                  </div>
                  <div
                    className={`cert-type-card ${genCertType === 'Admission Certificate' ? 'selected' : ''}`}
                    onClick={() => setGenCertType('Admission Certificate')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                      <MdAssignmentInd style={{ fontSize: '20px', color: '#1a237e' }} />
                      <h4 style={{ margin: 0 }}>Admission Certificate</h4>
                    </div>
                    <p>Provisional school admission certificate</p>
                  </div>
                  <div
                    className={`cert-type-card ${genCertType === 'Attendance Certificate' ? 'selected' : ''}`}
                    onClick={() => setGenCertType('Attendance Certificate')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                      <MdPoll style={{ fontSize: '20px', color: '#1a237e' }} />
                      <h4 style={{ margin: 0 }}>Attendance Certificate</h4>
                    </div>
                    <p>Student attendance record certificate</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateSubmit} className="application-form">
                  <div className="generate-cert-grid">
                    <div className="form-group">
                      <label className="form-label">Issue Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={genDate}
                        onChange={(e) => setGenDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Educational Session / Academic Year *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 2026-2027"
                        value={genAcademicYear}
                        onChange={(e) => setGenAcademicYear(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {genCertType === 'Bonafide Certificate' && (
                    <div className="generate-cert-grid">
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={genDob}
                          onChange={(e) => setGenDob(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Aadhaar No.</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 1234-5678-9012"
                          value={genAadhaar}
                          onChange={(e) => setGenAadhaar(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Caste</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. OBC / General"
                          value={genCaste}
                          onChange={(e) => setGenCaste(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Student ID</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Student ID No."
                          value={genStudentIdNo}
                          onChange={(e) => setGenStudentIdNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Apaar ID</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="APAAR ID"
                          value={genApaarId}
                          onChange={(e) => setGenApaarId(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">PEN No.</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Permanent Education Number"
                          value={genPenNo}
                          onChange={(e) => setGenPenNo(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="generate-cert-grid">
                    {genCertType === 'Admission Certificate' && (
                      <div className="form-group">
                        <label className="form-label">Reference Number (Ref No)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`SMT/ADM/${selectedStudentObj?.admission_no || '2026'}/${new Date().getFullYear()}`}
                          value={genRefNo}
                          onChange={(e) => setGenRefNo(e.target.value)}
                        />
                      </div>
                    )}

                    {genCertType === 'Attendance Certificate' && (
                      <div className="form-group">
                        <label className="form-label">Attendance Percentage</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 75%"
                          value={genAttendancePct}
                          onChange={(e) => setGenAttendancePct(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                    <button
                      type="submit"
                      className="btn btn-primary view-cert-btn"
                      style={{ padding: '12px 28px', fontSize: '15px' }}
                    >
                      <MdPrint /> Generate &amp; Print {genCertType}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="applications-page" id="applications-page-student">
      <div className="page-header">
        <h2 className="page-title">Applications</h2>
        <span className="breadcrumb">Home / Applications</span>
      </div>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

      <div className="applications-student-grid">

        <div className="dashboard-card application-form-card">
          <h3 className="card-title">Application For Certificate</h3>
          <form onSubmit={handleApply} className="application-form">
            <div className="form-group">
              <label className="form-label">Certificate Type</label>
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
                          {app.status === 'Pending' ? <MdPendingActions /> : app.status === 'Done' ? <MdCheckCircle /> : <MdClose />}
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
