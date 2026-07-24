import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MdUploadFile, MdEdit, MdDelete, MdSearch, MdSettings, MdPayment, MdAttachMoney, MdDescription, MdHistory } from 'react-icons/md';
import logo from '../assets/logo.png';
import sankalpLogo from '../assets/sankalp_logo.png';
import ConfirmModal from '../components/ConfirmModal';
import './Fees.css';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const CLASSES_WITH_ALL = ['All Classes', ...CLASSES];
const SECTIONS = ['Everyone', 'A', 'B', 'C'];
const GENDERS = ['Everyone', 'Male', 'Female'];

const Fees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const getStatusBadge = (status) => {
    let displayStatus = status;
    let badgeClass = 'pending';
    if (status === 'Confirmed') {
      displayStatus = 'Success';
      badgeClass = 'success';
    } else if (status === 'Denied') {
      displayStatus = 'Failure';
      badgeClass = 'failure';
    }
    return <span className={`payment-status-badge ${badgeClass}`}>{displayStatus}</span>;
  };

  const [adminTab, setAdminTab] = useState('upload');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null, confirmLabel: 'Confirm', confirmColor: '#1a237e', isAlert: false, iconType: 'warning' });

  const todayStr = new Date().toISOString().split('T')[0];
  const [receiptNo, setReceiptNo] = useState('');
  const [receiptDate, setReceiptDate] = useState(todayStr);
  const [receiptStudentName, setReceiptStudentName] = useState('');
  const [receiptAdmissionNo, setReceiptAdmissionNo] = useState('');
  const [receiptClassSection, setReceiptClassSection] = useState('');
  const [receiptAcademicYear, setReceiptAcademicYear] = useState('2026-27');
  const [receiptPaymentName, setReceiptPaymentName] = useState('School Fees');
  const [receiptPaidAmount, setReceiptPaidAmount] = useState('');
  const [receiptPaymentDate, setReceiptPaymentDate] = useState(todayStr);
  const [receiptPaymentMode, setReceiptPaymentMode] = useState('Online');

  const [structures, setStructures] = useState([]);
  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadClass, setUploadClass] = useState('All Classes');
  const [uploadSection, setUploadSection] = useState('Everyone');

  const [students, setStudents] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterAdmissionNo, setFilterAdmissionNo] = useState('');
  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterSection, setFilterSection] = useState('Everyone');
  const [filterGender, setFilterGender] = useState('Everyone');
  const [loading, setLoading] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newPaidAmount, setNewPaidAmount] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [setClass, setSetClass] = useState('1st');
  const [classFeeAmount, setClassFeeAmount] = useState('');
  const [classFeesList, setClassFeesList] = useState([]);

  const [studentFee, setStudentFee] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [studentTab, setStudentTab] = useState('balance');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [myPayments, setMyPayments] = useState([]);

  const [qrCodePath, setQrCodePath] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  const [paymentsActivity, setPaymentsActivity] = useState([]);
  const [selectedActivityPayment, setSelectedActivityPayment] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [confirmingActivity, setConfirmingActivity] = useState(false);

  const [balStudents, setBalStudents] = useState([]);
  const [balFilterName, setBalFilterName] = useState('');
  const [balFilterAdmissionNo, setBalFilterAdmissionNo] = useState('');
  const [balFilterClass, setBalFilterClass] = useState('All Classes');
  const [balFilterSection, setBalFilterSection] = useState('Everyone');
  const [balLoading, setBalLoading] = useState(false);
  const [balHasSearched, setBalHasSearched] = useState(false);
  const [balFeeStatusFilter, setBalFeeStatusFilter] = useState('all');

  const handleFeeStatusChange = (status) => {
    if (status === 'all') {
      setBalFeeStatusFilter('all');
    } else if (status === balFeeStatusFilter) {
      setBalFeeStatusFilter('all');
    } else {
      setBalFeeStatusFilter(status);
    }
  };

  useEffect(() => {
    const fetchDefaultYear = async () => {
      try {
        const res = await api.get('/settings/academic-year');
        if (res.data.success) {
          setReceiptAcademicYear(res.data.academicYear);
        }
      } catch (err) {
        console.error('Failed to load active academic year settings:', err);
      }
    };
    fetchDefaultYear();
  }, []);

  useEffect(() => {
    fetchQrCode();
    if (isAdmin) {
      if (adminTab === 'upload') {
        fetchStructures();
      } else if (adminTab === 'update') {
        fetchFeesList();
      } else if (adminTab === 'set') {
        fetchClassFees();
      } else if (adminTab === 'activity') {
        fetchPaymentsActivity();
      } else if (adminTab === 'balance') {
        fetchBalanceFees();
      } else if (adminTab === 'receipt') {
        fetchNextReceiptNo();
      }
    } else if (user?.student_id) {
      if (studentTab === 'activity') {
        fetchMyPayments();
      } else {
        fetchStudentFeeDetails();
        fetchStructures();
      }
    }
  }, [adminTab, studentTab]);

  const fetchNextReceiptNo = async () => {
    try {
      const res = await api.get('/fees/next-receipt-no');
      if (res.data.success) {
        setReceiptNo(res.data.receiptNo);
      }
    } catch (err) {
      console.error('Failed to fetch next receipt number:', err);
    }
  };

  const fetchBalanceFees = async () => {
    setBalLoading(true);
    setBalHasSearched(true);
    try {
      const params = {};
      if (balFilterClass !== 'All Classes') params.class = balFilterClass;
      if (balFilterSection !== 'Everyone') params.section = balFilterSection;
      if (balFilterName) params.name = balFilterName;
      if (balFilterAdmissionNo) params.admission_no = balFilterAdmissionNo;

      const res = await api.get('/fees/all', { params });
      setBalStudents(res.data.fees || []);
    } catch (err) {
      console.error('Error fetching balance fees:', err);
    } finally {
      setBalLoading(false);
    }
  };

  const fetchQrCode = async () => {
    try {
      const res = await api.get('/fees/qr-code');
      if (res.data?.qrCode) {
        setQrCodePath(res.data.qrCode.file_path);
      }
    } catch (err) {
      console.error('Error fetching QR Code:', err);
    }
  };

  const handleQrUploadSubmit = async (e) => {
    e.preventDefault();
    if (!qrFile) return alert('Please select a QR code image.');
    setUploadingQr(true);
    setErrorMsg('');
    setSuccessMsg('');
    const formData = new FormData();
    formData.append('file', qrFile);
    try {
      const res = await api.post('/fees/qr-code', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Payment QR Code uploaded successfully.');
      setQrCodePath(res.data.file_path);
      setQrFile(null);
      const fileInput = document.getElementById('qr-file-input');
      if (fileInput) fileInput.value = '';
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'QR code upload failed.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setUploadingQr(false);
    }
  };

  const handleStudentPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!upiTransactionId.trim() || !paymentAmount) {
      return alert('Please enter both UPI Transaction ID and Amount Paid.');
    }
    setSubmittingPayment(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('upi_transaction_id', upiTransactionId.trim());
      formData.append('amount', parseFloat(paymentAmount));
      if (paymentScreenshot) {
        formData.append('screenshot', paymentScreenshot);
      }

      await api.post('/fees/student-payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Payment submitted successfully! Pending admin confirmation.');
      setUpiTransactionId('');
      setPaymentAmount('');
      setPaymentScreenshot(null);
      const screenInput = document.getElementById('payment-screenshot-input');
      if (screenInput) screenInput.value = '';
      fetchStudentFeeDetails();
      fetchMyPayments();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit payment.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const fetchPaymentsActivity = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees/payments-activity');
      setPaymentsActivity(res.data.payments);
    } catch (err) {
      console.error('Error fetching payments activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Payment',
      message: 'Are you sure you want to confirm this payment submission?',
      confirmLabel: 'Yes, Confirm',
      confirmColor: '#2e7d32',
      iconType: 'info',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setConfirmingActivity(true);
        try {
          await api.post(`/fees/confirm-payment/${paymentId}`);
          setSuccessMsg('Payment confirmed and student balance updated successfully.');
          setShowActivityModal(false);
          setSelectedActivityPayment(null);
          fetchPaymentsActivity();
          setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
          setConfirmModal({
            isOpen: true,
            title: 'Error',
            message: err.response?.data?.message || 'Failed to confirm payment.',
            isAlert: true,
            iconType: 'danger',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
          });
        } finally {
          setConfirmingActivity(false);
        }
      },
      onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const handleDenyPayment = async (paymentId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Deny Payment',
      message: 'Are you sure you want to deny this payment submission?',
      confirmLabel: 'Yes, Deny',
      confirmColor: '#c62828',
      iconType: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setConfirmingActivity(true);
        try {
          await api.post(`/fees/deny-payment/${paymentId}`);
          setSuccessMsg('Payment denied successfully.');
          setShowActivityModal(false);
          setSelectedActivityPayment(null);
          fetchPaymentsActivity();
          setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
          setConfirmModal({
            isOpen: true,
            title: 'Error',
            message: err.response?.data?.message || 'Failed to deny payment.',
            isAlert: true,
            iconType: 'danger',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
          });
        } finally {
          setConfirmingActivity(false);
        }
      },
      onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const fetchMyPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees/my-payments');
      setMyPayments(res.data.payments || []);
    } catch (err) {
      console.error('Error fetching my payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      const res = await api.get('/fees/structures');
      setStructures(res.data.structures);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Please select a file.');
    if (!uploadName.trim()) return alert('Please specify a structure name.');

    setUploading(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('name', uploadName.trim());
    formData.append('class', uploadClass);
    formData.append('section', uploadSection);

    try {
      await api.post('/fees/structures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Fee structure uploaded successfully.');
      setUploadName('');
      setUploadFile(null);
      setUploadClass('All Classes');
      setUploadSection('Everyone');
      const fileInput = document.getElementById('fee-structure-file-input');
      if (fileInput) fileInput.value = '';
      fetchStructures();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRenameStructure = async (id, currentName) => {
    const newName = prompt('Enter a new name for the fee structure:', currentName);
    if (!newName || !newName.trim()) return;
    try {
      await api.put(`/fees/structures/${id}/rename`, { name: newName.trim() });
      setSuccessMsg('Fee structure renamed successfully.');
      fetchStructures();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Rename failed.');
    }
  };

  const handleDeleteStructure = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Fee Structure',
      message: 'Are you sure you want to delete this fee structure?',
      confirmLabel: 'Delete',
      confirmColor: '#c62828',
      iconType: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/fees/structures/${id}`);
          setSuccessMsg('Fee structure deleted successfully.');
          fetchStructures();
          setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
          setConfirmModal({
            isOpen: true,
            title: 'Error',
            message: 'Delete failed.',
            isAlert: true,
            iconType: 'danger',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
          });
        }
      },
      onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const fetchFeesList = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = {};
      if (filterClass !== 'All Classes') params.class = filterClass;
      if (filterSection !== 'Everyone') params.section = filterSection;
      if (filterGender !== 'Everyone') params.gender = filterGender;
      if (filterName) params.name = filterName;
      if (filterAdmissionNo) params.admission_no = filterAdmissionNo;

      const res = await api.get('/fees/all', { params });
      setStudents(res.data.fees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchFeesList();
  };

  const openUpdatePaidModal = (student) => {
    setSelectedStudent(student);
    setNewPaidAmount(student.paid_amount || '0');
    setShowPaidModal(true);
  };

  const handlePaidAmountSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await api.post('/fees/update-paid', {
        student_id: selectedStudent.student_id,
        paid_amount: parseFloat(newPaidAmount)
      });
      setSuccessMsg(`Paid fees updated for ${selectedStudent.name}.`);
      setShowPaidModal(false);
      fetchFeesList();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to update paid amount.');
    }
  };

  const fetchClassFees = async () => {
    try {
      const res = await api.get('/fees/class-fees');
      setClassFeesList(res.data.classFees);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetClassFeeSubmit = async (e) => {
    e.preventDefault();
    if (classFeeAmount === '') return alert('Please enter a fee amount.');
    try {
      await api.post('/fees/class-fees', {
        class: setClass,
        amount: parseFloat(classFeeAmount)
      });
      setSuccessMsg(`Fee set successfully for Class ${setClass}.`);
      setClassFeeAmount('');
      fetchClassFees();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to configure class fee.');
    }
  };

  const fetchStudentFeeDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/fees/student/${user.student_id}`);
      setStudentFee(res.data.fee);
      setPaymentHistory(res.data.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStructure = async (st) => {
    try {
      const res = await api.get(`/fees/structures/download/${st.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', st.file_name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download fee structure.');
    }
  };

  if (!isAdmin) {
    const remaining = studentFee ? (studentFee.total_fee - studentFee.paid_amount) : 0;
    return (
      <div className="fees-page" id="fees-page">
        <div className="page-header">
          <h2 className="page-title">Fees Summary</h2>
          <span className="breadcrumb">Home / Fees</span>
        </div>

        {successMsg && <div className="success-banner">{successMsg}</div>}
        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <div className="fees-tab-header">
          <button
            className={`tab-btn ${studentTab === 'structure' ? 'active' : ''}`}
            onClick={() => setStudentTab('structure')}
          >
            <MdUploadFile /> Fees Structure
          </button>
          <button
            className={`tab-btn ${studentTab === 'balance' ? 'active' : ''}`}
            onClick={() => setStudentTab('balance')}
          >
            <MdAttachMoney /> Fee Balance
          </button>
          <button
            className={`tab-btn ${studentTab === 'payment' ? 'active' : ''}`}
            onClick={() => setStudentTab('payment')}
          >
            <MdPayment /> Fee Payment
          </button>
          <button
            className={`tab-btn ${studentTab === 'activity' ? 'active' : ''}`}
            onClick={() => setStudentTab('activity')}
          >
            <MdHistory /> Payment Activity
          </button>
        </div>

        {studentTab === 'structure' && (
          <div className="fee-tab-content">
            <div className="uploaded-structures-card">
              <h3 className="card-title">Fee Structures</h3>
              <div className="structures-grid-layout">
                {structures.length === 0 ? (
                  <p className="no-structures-text" style={{ padding: '16px 0', color: 'var(--text-light)', fontSize: '14px' }}>
                    No fee structures uploaded yet.
                  </p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Uploaded Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {structures.map(st => (
                          <tr key={st.id}>
                            <td>{st.name}</td>
                            <td>{new Date(st.created_at).toLocaleDateString('en-GB')}</td>
                            <td>
                              <button
                                className="btn-table-action"
                                onClick={() => window.open(`${import.meta.env.VITE_IMAGE_URL}/uploads/fee-structures/${st.file_path}`, '_blank')}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}
                              >
                                View PDF
                              </button>
                              <button
                                className="btn-table-action"
                                onClick={() => handleDownloadStructure(st)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--green-accent, #2e7d32)', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                Download
                              </button>
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
        )}

        {studentTab === 'balance' && (
          <div className="fee-tab-content">
            {studentFee ? (
              <>
                <div className="fee-student-details-card">
                  <div><strong>Class:</strong> {user.class}</div>
                  <div><strong>Section:</strong> {user.section || 'A'}</div>
                  <div><strong>Academic Year:</strong> {studentFee.academic_year || '2026-27'}</div>
                </div>

                <div className="fees-summary-cards">
                  <div className="fee-card">
                    <span className="fee-card-num">₹{studentFee.total_fee}</span>
                    <span>Total Fee</span>
                  </div>
                  <div className="fee-card green">
                    <span className="fee-card-num">₹{studentFee.paid_amount}</span>
                    <span>Paid Amount</span>
                  </div>
                  <div className="fee-card red">
                    <span className="fee-card-num">₹{remaining}</span>
                    <span>Remaining Balance</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="fee-placeholder-card">
                <p>Fee structure information not yet configured for your class. Please check back later.</p>
              </div>
            )}
          </div>
        )}

        {studentTab === 'payment' && (
          <div className="fee-tab-content">
            <div className="student-payment-card">
              <h3 className="card-title text-center">Pay Fees via QR Code</h3>

              <div className="qr-code-wrapper">
                {qrCodePath ? (
                  <img
                    src={`${import.meta.env.VITE_IMAGE_URL}/uploads/qr-codes/${qrCodePath}`}
                    alt="Payment QR Code"
                    className="qr-code-image"
                  />
                ) : (
                  <div className="qr-code-placeholder">
                    <p>No payment QR Code uploaded by Admin yet.</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleStudentPaymentSubmit} className="student-payment-form">
                <div className="payment-form-row">
                  <div className="form-group">
                    <label>UPI Transaction ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. 12-digit transaction ID"
                      value={upiTransactionId}
                      onChange={e => setUpiTransactionId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount Paid (₹) *</label>
                    <input
                      type="number"
                      placeholder="Enter amount paid"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Upload Payment Screenshot / Receipt (PNG, JPG, PDF)</label>
                  <input
                    type="file"
                    id="payment-screenshot-input"
                    accept=".png,.jpg,.jpeg,.pdf,.webp"
                    onChange={e => setPaymentScreenshot(e.target.files[0])}
                    style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', width: '100%', background: '#fff' }}
                  />
                </div>

                <div className="submit-btn-wrapper">
                  <button type="submit" className="btn-payment-submit" disabled={submittingPayment}>
                    {submittingPayment ? 'Submitting...' : 'Submit Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {studentTab === 'activity' && (
          <div className="fee-tab-content">
            <div className="uploaded-structures-card">
              <h3 className="card-title">My Payment Activity</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Submission Date</th>
                      <th>UPI Transaction ID</th>
                      <th>Amount Paid</th>
                      <th>Screenshot</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="table-loading">Loading...</td></tr>
                    ) : myPayments.length === 0 ? (
                      <tr><td colSpan="5" className="table-empty">No payment activity logs found.</td></tr>
                    ) : (
                      myPayments.map(p => (
                        <tr key={p.id}>
                          <td>{new Date(p.created_at).toLocaleString('en-GB')}</td>
                          <td style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>{p.upi_transaction_id}</td>
                          <td style={{ fontWeight: '600' }}>₹{p.amount}</td>
                          <td>
                            {p.screenshot_path ? (
                              <a
                                href={`${import.meta.env.VITE_IMAGE_URL}/uploads/payment-screenshots/${p.screenshot_path}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#1565c0', fontWeight: '500', textDecoration: 'underline' }}
                              >
                                View Proof
                              </a>
                            ) : (
                              <span style={{ color: '#999' }}>-</span>
                            )}
                          </td>
                          <td>{getStatusBadge(p.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const numberToWords = (num) => {
    const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
  };

  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleGenerateReceipt = async (e) => {
    e.preventDefault();
    if (!receiptNo.trim() || !receiptPaidAmount) {
      alert('Please fill out all fields.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing opening the receipt. Please allow popups.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${receiptNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
          @page {
            size: A5 landscape;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #fff;
            box-sizing: border-box;
            overflow: hidden;
            font-family: 'Outfit', sans-serif;
          }
          .receipt-container {
            width: calc(100% - 20px);
            height: calc(100% - 20px);
            margin: 10px;
            background: #fff;
            border: 3px double #1a237e;
            padding: 0.45cm 0.7cm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .receipt-header {
            border-bottom: 1.5px solid #1a237e;
            padding-bottom: 5px;
            margin-bottom: 5px;
          }
          .header-logos {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }
          .logo-left {
            width: 58px;
            height: 58px;
            object-fit: contain;
          }
          .header-text {
            text-align: center;
            flex: 1;
          }
          .org-name {
            font-size: 9.5px;
            font-weight: 700;
            color: #555;
            letter-spacing: 0.5px;
            margin: 0;
            text-transform: uppercase;
          }
          .campus-name {
            font-size: 8px;
            color: #666;
            margin: 1px 0 0 0;
            text-transform: uppercase;
          }
          .school-name {
            font-size: 15px;
            font-weight: 700;
            color: #1a237e;
            margin: 2px 0 0 0;
            text-transform: uppercase;
          }
          .tagline {
            font-size: 8px;
            font-style: italic;
            color: #777;
            margin: 1px 0 0 0;
          }
          .contact-info {
            font-size: 8px;
            color: #333;
            margin: 2px 0 0 0;
            font-weight: 500;
          }
          .receipt-title {
            text-align: center;
            font-size: 12px;
            font-weight: 700;
            color: white;
            text-transform: uppercase;
            margin: 5px auto;
            letter-spacing: 1px;
            border: 1px solid #1a237e;
            display: inline-block;
            padding: 3px 18px;
            position: relative;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 3px;
            background-color: #1a237e;
          }
          .receipt-meta {
            margin-top: 3px;
            margin-bottom: 5px;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
          }
          .meta-table td {
            padding: 3px 0;
            font-size: 11.5px;
            color: #2c3e50;
            border-bottom: 1px dashed #e2e8f0;
          }
          .text-right {
            text-align: right;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
            margin-bottom: 5px;
          }
          .receipt-table th, .receipt-table td {
            border: 1px solid #bdc3c7;
            padding: 5px 8px;
            font-size: 11.5px;
            color: #2c3e50;
          }
          .receipt-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            text-align: left;
          }
          .empty-row td {
            height: 20px;
          }
          .receipt-summary {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
          }
          .summary-left {
            font-size: 11.5px;
            color: #2c3e50;
            line-height: 1.5;
          }
          .amount-words {
            margin-top: 3px;
            font-style: italic;
          }
          .summary-right {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-end;
          }
          .total-box {
            border: 2px solid #1a237e;
            background-color: #f8f9fa;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 700;
            color: #1a237e;
            border-radius: 4px;
          }
          .receipt-footer {
            margin-top: 6px;
            display: flex;
            justify-content: flex-end;
          }
          .signature-section {
            text-align: center;
            width: 180px;
          }
          .signature-line {
            border-bottom: 1px solid #1a237e;
            margin-bottom: 4px;
            height: 22px;
          }
          .signature-label {
            font-size: 10px;
            color: #7f8c8d;
            font-weight: 600;
          }
          @media print {
            body {
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <div class="header-logos">
              <img class="logo-left" src="${sankalpLogo}" alt="School Logo" style="width: 62px; height: 62px; object-fit: contain;" />
              <div class="header-text">
                <h2 class="org-name">Sankalp Bahu-Udheshiya Sanstha</h2>
                <h3 class="campus-name">South Indian Educational Campus, Kodamendhi</h3>
                <h1 class="school-name">Smt. Rajeshwari Reddy Scholar Convent</h1>
                <p class="tagline">Learn It Live It & Pass It on</p>
                <p class="contact-info">Ph: 8855925216, 7721040550 | Kodamendhi</p>
              </div>
            </div>
          </div>

          <div class="receipt-title">Fee Payment Receipt</div>

          <div class="receipt-meta">
            <table class="meta-table">
              <tr>
                <td><strong>Receipt No.:</strong> ${receiptNo}</td>
                <td class="text-right"><strong>Receipt Date:</strong> ${formatDateString(receiptDate)}</td>
              </tr>
              <tr>
                <td><strong>Student Name:</strong> ${receiptStudentName}</td>
                <td class="text-right"><strong>Admission no.:</strong> ${receiptAdmissionNo}</td>
              </tr>
              <tr>
                <td><strong>Class & Section:</strong> ${receiptClassSection}</td>
                <td class="text-right"><strong>Academic year:</strong> ${receiptAcademicYear}</td>
              </tr>
            </table>
          </div>

          <table class="receipt-table">
            <thead>
              <tr>
                <th style="width: 10%;">Sr.No.</th>
                <th style="width: 60%;">Particulars</th>
                <th style="width: 30%; text-align: right;">Paid Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>${receiptPaymentName}</td>
                <td style="text-align: right;">₹${Number(receiptPaidAmount).toLocaleString('en-IN')}/-</td>
              </tr>
              <tr class="empty-row">
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            </tbody>
          </table>

          <div class="receipt-summary">
            <div class="summary-left">
              <div><strong>Payment Date:</strong> ${formatDateString(receiptPaymentDate)}</div>
              <div><strong>Payment Mode:</strong> ${receiptPaymentMode}</div>
              <div class="amount-words"><strong>Amount in Words:</strong> Rupees ${numberToWords(Number(receiptPaidAmount))} Only</div>
            </div>
            <div class="summary-right">
              <div class="total-box">
                <strong>Total:</strong> ₹${Number(receiptPaidAmount).toLocaleString('en-IN')}/-
              </div>
            </div>
          </div>

          <div class="receipt-footer">
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-label">Authorised Signatory / Cashier</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    try {
      await api.post('/fees/increment-receipt-no');
      fetchNextReceiptNo();
    } catch (err) {
      console.error('Failed to increment receipt counter:', err);
    }
  };

  const filteredBalStudents = balStudents.filter(s => {
    const totalFee = Number(s.total_fee || 0);
    const paidAmount = Number(s.paid_amount || 0);
    const balance = Number(s.balance || 0);

    if (balFeeStatusFilter === 'paid') {
      return balance <= 0;
    }
    if (balFeeStatusFilter === 'incomplete') {
      return balance > 0;
    }
    return true;
  });

  const totalSchoolFees = filteredBalStudents.reduce((acc, s) => acc + Number(s.total_fee || 0), 0);
  const totalPaidFees = filteredBalStudents.reduce((acc, s) => acc + Number(s.paid_amount || 0), 0);
  const totalBalanceFees = filteredBalStudents.reduce((acc, s) => acc + Number(s.balance || 0), 0);

  return (
    <div className="fees-page" id="fees-page">
      <div className="page-header">
        <h2 className="page-title">Fees Management</h2>
        <span className="breadcrumb">Home / Fees</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}
      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      <div className="fees-tab-header">
        <button
          className={`tab-btn ${adminTab === 'upload' ? 'active' : ''}`}
          onClick={() => setAdminTab('upload')}
        >
          <MdUploadFile /> Upload Fee Structure
        </button>
        <button
          className={`tab-btn ${adminTab === 'update' ? 'active' : ''}`}
          onClick={() => setAdminTab('update')}
        >
          <MdPayment /> Update Fees
        </button>
        <button
          className={`tab-btn ${adminTab === 'set' ? 'active' : ''}`}
          onClick={() => setAdminTab('set')}
        >
          <MdSettings /> Set Fees
        </button>
        <button
          className={`tab-btn ${adminTab === 'receipt' ? 'active' : ''}`}
          onClick={() => setAdminTab('receipt')}
        >
          <MdDescription /> Generate Receipt
        </button>
        <button
          className={`tab-btn ${adminTab === 'activity' ? 'active' : ''}`}
          onClick={() => setAdminTab('activity')}
        >
          <MdHistory /> Fee Payment Activity
        </button>
        <button
          className={`tab-btn ${adminTab === 'balance' ? 'active' : ''}`}
          onClick={() => setAdminTab('balance')}
        >
          <MdAttachMoney /> Balance Fees
        </button>
      </div>

      {adminTab === 'upload' && (
        <div className="fee-tab-content">
          <div className="fee-upload-grid">

            <div className="fee-upload-form-card">
              <h3 className="card-title">New Fee Structure Upload</h3>
              <form onSubmit={handleUploadSubmit} className="fee-upload-form">
                <div className="form-group">
                  <label>Structure Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Nursery-5th Annual Fees"
                    value={uploadName}
                    onChange={e => setUploadName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Select Class *</label>
                  <select value={uploadClass} onChange={e => setUploadClass(e.target.value)}>
                    {CLASSES_WITH_ALL.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Section *</label>
                  <select value={uploadSection} onChange={e => setUploadSection(e.target.value)}>
                    <option value="Everyone">Everyone</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Document (PDF/Image) *</label>
                  <input
                    type="file"
                    id="fee-structure-file-input"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => setUploadFile(e.target.files[0])}
                    required
                  />
                </div>
                <button type="submit" className="btn-upload-structure" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Structure'}
                </button>
              </form>
            </div>

            <div className="fee-upload-list-card">
              <h3 className="card-title">Currently Uploaded Fee Structures</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>File Name</th>
                      <th>Uploaded On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="table-empty">No structures uploaded yet.</td>
                      </tr>
                    ) : (
                      structures.map(st => (
                        <tr key={st.id}>
                          <td>{st.name}</td>
                          <td>{st.class || 'All Classes'}</td>
                          <td>{st.section || 'Everyone'}</td>
                          <td className="file-name-cell">{st.file_name}</td>
                          <td>{new Date(st.created_at).toLocaleDateString('en-GB')}</td>
                          <td className="action-cell">
                            <button
                              className="btn-icon view"
                              title="View Document"
                              onClick={() => window.open(`${import.meta.env.VITE_IMAGE_URL}/uploads/fee-structures/${st.file_path}`, '_blank')}
                            >
                              View
                            </button>
                            <button
                              className="btn-icon edit"
                              title="Rename"
                              onClick={() => handleRenameStructure(st.id, st.name)}
                            >
                              <MdEdit />
                            </button>
                            <button
                              className="btn-icon delete"
                              title="Delete"
                              onClick={() => handleDeleteStructure(st.id)}
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'update' && (
        <div className="fee-tab-content">

          <div className="filter-bar">
            <div className="filter-left">
              <div className="filter-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Filter by name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="filter-group">
                <label>Admission No</label>
                <input
                  type="text"
                  placeholder="Filter by admission no"
                  value={filterAdmissionNo}
                  onChange={(e) => setFilterAdmissionNo(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="filter-group">
                <label>Class</label>
                <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                  {CLASSES_WITH_ALL.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Section</label>
                <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Gender</label>
                <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button className="btn-search" onClick={fetchFeesList}>Show</button>
            </div>
          </div>

          <div className="table-container" style={{ marginTop: '20px' }}>
            <table>
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Class Fee (Total)</th>
                  <th>Paid Fees (Rupees)</th>
                  <th>Remaining Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="table-loading">Loading student records...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="8" className="table-empty">No students found.</td></tr>
                ) : (
                  students.map(s => (
                    <tr key={s.student_id}>
                      <td>{s.admission_no}</td>
                      <td>{s.name}</td>
                      <td>{s.class}</td>
                      <td>{s.section || 'A'}</td>
                      <td>₹{s.total_fee}</td>
                      <td>₹{s.paid_amount}</td>
                      <td style={{
                        color: s.balance > 0 ? 'var(--red-accent)' : 'var(--green-accent)',
                        fontWeight: 'bold'
                      }}>
                        ₹{s.balance}
                      </td>
                      <td>
                        <button
                          className="btn-update-paid"
                          onClick={() => openUpdatePaidModal(s)}
                        >
                          Update Paid Fees
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'set' && (
        <div className="fee-tab-content">
          <div className="fee-set-grid">

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="fee-set-form-card">
                <h3 className="card-title">Configure Class-Wise Fees</h3>
                <form onSubmit={handleSetClassFeeSubmit} className="fee-set-form">
                  <div className="form-group">
                    <label>Select Class *</label>
                    <select value={setClass} onChange={e => setSetClass(e.target.value)}>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fee Amount (Rupees) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={classFeeAmount}
                      onChange={e => setClassFeeAmount(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-set-fee">
                    Set Class Fee
                  </button>
                </form>
              </div>

              <div className="qr-upload-card">
                <h3 className="card-title">Upload Payment QR Code</h3>
                <form onSubmit={handleQrUploadSubmit} className="fee-upload-form">
                  <div className="form-group">
                    <label>Select QR Image (PNG/JPG/JPEG/WEBP) *</label>
                    <input
                      type="file"
                      id="qr-file-input"
                      accept="image/*"
                      onChange={e => setQrFile(e.target.files[0])}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-set-fee" disabled={uploadingQr}>
                    {uploadingQr ? 'Uploading...' : 'Upload QR Code'}
                  </button>
                </form>
                {qrCodePath && (
                  <div>
                    <h4 style={{ fontSize: '13px', marginTop: '16px', color: 'var(--text-secondary)' }}>Current QR Code Preview:</h4>
                    <div className="qr-preview-box">
                      <img
                        src={`${import.meta.env.VITE_IMAGE_URL}/uploads/qr-codes/${qrCodePath}`}
                        alt="Current QR Code"
                        className="qr-preview-img"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="fee-set-list-card">
              <h3 className="card-title">Configured Class Fees</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Configured Fee Amount</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classFeesList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="table-empty">No classes configured yet.</td>
                      </tr>
                    ) : (
                      classFeesList.map(cf => (
                        <tr key={cf.class}>
                          <td><strong>{cf.class}</strong></td>
                          <td>₹{cf.amount}</td>
                          <td>{new Date(cf.updated_at).toLocaleString('en-GB')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'receipt' && (
        <div className="fee-tab-content">
          <div className="fee-receipt-card">
            <h3 className="card-title">Generate Student Receipt</h3>
            <form onSubmit={handleGenerateReceipt} className="receipt-form">
              <div className="receipt-form-grid">
                <div className="form-group">
                  <label>Receipt No. (Auto-generated)</label>
                  <input
                    type="text"
                    value={receiptNo || 'A0001'}
                    readOnly
                    style={{
                      background: '#f1f5f9',
                      cursor: 'not-allowed',
                      fontWeight: '700',
                      color: '#1a237e',
                      letterSpacing: '1px'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Receipt Date *</label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={e => setReceiptDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    placeholder="Enter student name"
                    value={receiptStudentName}
                    onChange={e => setReceiptStudentName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Admission No. *</label>
                  <input
                    type="text"
                    placeholder="Enter admission number"
                    value={receiptAdmissionNo}
                    onChange={e => setReceiptAdmissionNo(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Class and Section *</label>
                  <input
                    type="text"
                    placeholder="e.g. 5th - A"
                    value={receiptClassSection}
                    onChange={e => setReceiptClassSection(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Academic Year *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-27"
                    value={receiptAcademicYear}
                    onChange={e => setReceiptAcademicYear(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. School Fees"
                    value={receiptPaymentName}
                    onChange={e => setReceiptPaymentName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Paid Amount *</label>
                  <input
                    type="number"
                    placeholder="Enter paid amount"
                    value={receiptPaidAmount}
                    onChange={e => setReceiptPaidAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Date *</label>
                  <input
                    type="date"
                    value={receiptPaymentDate}
                    onChange={e => setReceiptPaymentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Amount (same as paid amount)</label>
                  <input
                    type="number"
                    value={receiptPaidAmount}
                    disabled
                    readOnly
                    placeholder="Same as paid amount"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Mode *</label>
                  <select value={receiptPaymentMode} onChange={e => setReceiptPaymentMode(e.target.value)}>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-generate-receipt">
                Generate
              </button>
            </form>
          </div>
        </div>
      )}

      {adminTab === 'activity' && (
        <div className="fee-tab-content">
          <h3 className="card-title">Fee Payment Activity Log</h3>

          <div className="payment-activity-list">
            {loading ? (
              <div className="table-placeholder-card"><p>Loading payment activity...</p></div>
            ) : paymentsActivity.length === 0 ? (
              <div className="table-placeholder-card"><p>No payment activity submitted yet.</p></div>
            ) : (
              paymentsActivity.map(p => (
                <div
                  key={p.id}
                  className={`payment-activity-item ${p.status.toLowerCase()}`}
                  onClick={() => {
                    setSelectedActivityPayment(p);
                    setShowActivityModal(true);
                  }}
                >
                  <div className="payment-info-left">
                    <span className="payment-student-name">{p.name}</span>
                    <span className="payment-date-text">
                      {new Date(p.created_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="payment-info-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="payment-amount-text">₹{p.amount}</span>
                    <span className={`payment-status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
                    <button
                      className="btn-view-docs"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActivityPayment(p);
                        setShowActivityModal(true);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {adminTab === 'balance' && (
        <div className="fee-tab-content">

          <div className="fees-summary-cards">
            <div className="fee-card">
              <span className="fee-card-num">₹{totalSchoolFees.toLocaleString('en-IN')}</span>
              <span>Total Fees</span>
            </div>
            <div className="fee-card green">
              <span className="fee-card-num">₹{totalPaidFees.toLocaleString('en-IN')}</span>
              <span>Total Paid Fees</span>
            </div>
            <div className="fee-card red">
              <span className="fee-card-num">₹{totalBalanceFees.toLocaleString('en-IN')}</span>
              <span>Total Balance Fees</span>
            </div>
          </div>

          <div className="filter-bar">
            <div className="filter-left" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                <div className="filter-group">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Filter by name"
                    value={balFilterName}
                    onChange={(e) => setBalFilterName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchBalanceFees()}
                  />
                </div>
                <div className="filter-group">
                  <label>Admission No</label>
                  <input
                    type="text"
                    placeholder="Filter by admission no"
                    value={balFilterAdmissionNo}
                    onChange={(e) => setBalFilterAdmissionNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchBalanceFees()}
                  />
                </div>
                <div className="filter-group">
                  <label>Class</label>
                  <select value={balFilterClass} onChange={(e) => setBalFilterClass(e.target.value)}>
                    {CLASSES_WITH_ALL.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Section</label>
                  <select value={balFilterSection} onChange={(e) => setBalFilterSection(e.target.value)}>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button className="btn-search" onClick={fetchBalanceFees}>Show</button>
              </div>

              <div className="fee-status-filter-checkboxes">
                <label className="fee-status-checkbox-label">
                  <input
                    type="checkbox"
                    checked={balFeeStatusFilter === 'all'}
                    onChange={() => handleFeeStatusChange('all')}
                  />
                  <span>All Students</span>
                </label>
                <label className="fee-status-checkbox-label">
                  <input
                    type="checkbox"
                    checked={balFeeStatusFilter === 'paid'}
                    onChange={() => handleFeeStatusChange('paid')}
                  />
                  <span>Students Fully Paid Fees</span>
                </label>
                <label className="fee-status-checkbox-label">
                  <input
                    type="checkbox"
                    checked={balFeeStatusFilter === 'incomplete'}
                    onChange={() => handleFeeStatusChange('incomplete')}
                  />
                  <span>Students with Incomplete Fees</span>
                </label>
              </div>
            </div>
          </div>

          <div className="table-container" style={{ marginTop: '20px' }}>
            <table>
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Total Fee (₹)</th>
                  <th>Paid Fee (₹)</th>
                  <th>Remaining Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {balLoading ? (
                  <tr><td colSpan="7" className="table-loading">Loading student records...</td></tr>
                ) : filteredBalStudents.length === 0 ? (
                  <tr><td colSpan="7" className="table-empty">No students found.</td></tr>
                ) : (
                  filteredBalStudents.map(s => (
                    <tr key={s.student_id}>
                      <td>{s.admission_no}</td>
                      <td>{s.name}</td>
                      <td>{s.class}</td>
                      <td>{s.section || 'A'}</td>
                      <td>₹{s.total_fee}</td>
                      <td>₹{s.paid_amount}</td>
                      <td style={{
                        color: s.balance > 0 ? 'var(--red-accent)' : 'var(--green-accent)',
                        fontWeight: 'bold'
                      }}>
                        ₹{s.balance}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPaidModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowPaidModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Paid Fees</h3>
              <button className="modal-close" onClick={() => setShowPaidModal(false)}>✕</button>
            </div>
            <form onSubmit={handlePaidAmountSubmit} className="modal-form">
              <div className="modal-body" style={{ padding: '0 0 16px 0' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Updating paid fees for student: <strong style={{ color: 'var(--text-primary)' }}>{selectedStudent.name}</strong>
                </p>
                <div className="form-group">
                  <label>Rupee Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={newPaidAmount}
                    onChange={e => setNewPaidAmount(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowPaidModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Amount</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showActivityModal && selectedActivityPayment && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="payment-receipt-card" onClick={e => e.stopPropagation()}>
            <div className="receipt-card-header">
              <span className="receipt-header-title">Transaction Receipt</span>
              <button className="receipt-close-btn" onClick={() => setShowActivityModal(false)}>✕</button>
            </div>

            <div className="receipt-card-body">

              <div className="receipt-amount-section">
                <span className="receipt-currency">₹</span>
                <span className="receipt-amount">{Number(selectedActivityPayment.amount).toLocaleString('en-IN')}</span>
                <div className={`receipt-status-badge ${selectedActivityPayment.status.toLowerCase()}`}>
                  {selectedActivityPayment.status}
                </div>
              </div>

              <div className="receipt-details-container">
                <h4 className="receipt-section-title">Student Information</h4>
                <div className="receipt-grid">
                  <div className="receipt-field">
                    <span className="field-label">Student Name</span>
                    <span className="field-val">{selectedActivityPayment.name}</span>
                  </div>
                  <div className="receipt-field">
                    <span className="field-label">Admission No.</span>
                    <span className="field-val">{selectedActivityPayment.admission_no}</span>
                  </div>
                  <div className="receipt-field">
                    <span className="field-label">Class & Section</span>
                    <span className="field-val">
                      Class {selectedActivityPayment.class} - {selectedActivityPayment.section || 'A'}
                    </span>
                  </div>
                </div>

                <div className="receipt-divider-dashed"></div>

                <h4 className="receipt-section-title">Payment Verification</h4>
                <div className="receipt-grid">
                  <div className="receipt-field full-width">
                    <span className="field-label">UPI Reference ID (UTR)</span>
                    <span className="field-val utr-text">{selectedActivityPayment.upi_transaction_id}</span>
                  </div>
                  <div className="receipt-field">
                    <span className="field-label">Submission Date</span>
                    <span className="field-val">
                      {new Date(selectedActivityPayment.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>

                {selectedActivityPayment.screenshot_path ? (
                  <>
                    <div className="receipt-divider-dashed"></div>
                    <h4 className="receipt-section-title">Payment Screenshot</h4>
                    <div style={{ marginTop: '10px', background: '#f8f9fa', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                      {selectedActivityPayment.screenshot_path.toLowerCase().endsWith('.pdf') ? (
                        <a
                          href={`${import.meta.env.VITE_IMAGE_URL}/uploads/payment-screenshots/${selectedActivityPayment.screenshot_path}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#1565c0', fontWeight: '600', fontSize: '13px' }}
                        >
                          📄 Open PDF Screenshot
                        </a>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={`${import.meta.env.VITE_IMAGE_URL}/uploads/payment-screenshots/${selectedActivityPayment.screenshot_path}`}
                            alt="Payment Screenshot"
                            style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '6px', border: '1px solid #ccc', objectFit: 'contain' }}
                          />
                          <a
                            href={`${import.meta.env.VITE_IMAGE_URL}/uploads/payment-screenshots/${selectedActivityPayment.screenshot_path}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#1565c0', fontWeight: '600', fontSize: '12px', textDecoration: 'underline' }}
                          >
                            View Full Screenshot ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="receipt-divider-dashed"></div>
                    <h4 className="receipt-section-title">Payment Screenshot</h4>
                    <div style={{ marginTop: '10px', background: '#fff3e0', color: '#e65100', padding: '12px', borderRadius: '6px', textAlign: 'center', fontSize: '13px', fontWeight: '600', border: '1px solid #ffe0b2' }}>
                      No Image Uploaded
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="receipt-card-footer">
              {selectedActivityPayment.status === 'Pending' ? (
                <div className="receipt-actions">
                  {selectedActivityPayment.screenshot_path && (
                    <a
                      href={`${import.meta.env.VITE_IMAGE_URL}/uploads/payment-screenshots/${selectedActivityPayment.screenshot_path}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '8px 16px',
                        background: '#1565c0',
                        color: '#fff',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      View
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn-deny-action"
                    onClick={() => handleDenyPayment(selectedActivityPayment.id)}
                    disabled={confirmingActivity}
                  >
                    Deny
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-action"
                    onClick={() => handleConfirmPayment(selectedActivityPayment.id)}
                    disabled={confirmingActivity}
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {selectedActivityPayment.screenshot_path && (
                    <a
                      href={`${import.meta.env.VITE_IMAGE_URL}/uploads/payment-screenshots/${selectedActivityPayment.screenshot_path}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '8px 16px',
                        background: '#1565c0',
                        color: '#fff',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      View Screenshot
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn-close-action"
                    onClick={() => setShowActivityModal(false)}
                  >
                    Close Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal {...confirmModal} />
    </div>
  );
};

export default Fees;
