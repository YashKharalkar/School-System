import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MdUploadFile, MdEdit, MdDelete, MdSearch, MdSettings, MdPayment, MdAttachMoney, MdDescription } from 'react-icons/md';
import './Fees.css';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const CLASSES_WITH_ALL = ['All Classes', ...CLASSES];
const SECTIONS = ['Everyone', 'A', 'B', 'C'];
const GENDERS = ['Everyone', 'Male', 'Female'];

const Fees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Toggle mode for Admin ('upload', 'update', 'set', 'receipt', 'activity')
  const [adminTab, setAdminTab] = useState('upload');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 4. Generate Receipt tab states
  const [receiptAdmissionNo, setReceiptAdmissionNo] = useState('');
  const [receiptAcademicYear, setReceiptAcademicYear] = useState('2026-27');
  const [receiptClass, setReceiptClass] = useState('1st');
  const [receiptSection, setReceiptSection] = useState('A');
  const [receiptParticulars, setReceiptParticulars] = useState('School Fees');
  const [receiptAmount, setReceiptAmount] = useState('');

  // 1. Upload Fee Structure tab states
  const [structures, setStructures] = useState([]);
  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 2. Update Fees tab states
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

  // 3. Set Fees tab states
  const [setClass, setSetClass] = useState('1st');
  const [classFeeAmount, setClassFeeAmount] = useState('');
  const [classFeesList, setClassFeesList] = useState([]);

  // Student view states
  const [studentFee, setStudentFee] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [studentTab, setStudentTab] = useState('balance');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // QR Code states
  const [qrCodePath, setQrCodePath] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  // Admin Fee Payment Activity states
  const [paymentsActivity, setPaymentsActivity] = useState([]);
  const [selectedActivityPayment, setSelectedActivityPayment] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [confirmingActivity, setConfirmingActivity] = useState(false);

  useEffect(() => {
    fetchQrCode();
    if (isAdmin) {
      if (adminTab === 'upload') {
        fetchStructures();
      } else if (adminTab === 'set') {
        fetchClassFees();
      } else if (adminTab === 'activity') {
        fetchPaymentsActivity();
      }
    } else if (user?.student_id) {
      fetchStudentFeeDetails();
      fetchStructures();
    }
  }, [adminTab]);

  // --- API Functions for QR Code & Student Payment ---
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
      await api.post('/fees/student-payment', {
        upi_transaction_id: upiTransactionId.trim(),
        amount: parseFloat(paymentAmount)
      });
      setSuccessMsg('Payment submitted successfully! Pending admin confirmation.');
      setUpiTransactionId('');
      setPaymentAmount('');
      fetchStudentFeeDetails();
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
    if (!window.confirm('Are you sure you want to confirm it?')) return;
    setConfirmingActivity(true);
    try {
      await api.post(`/fees/confirm-payment/${paymentId}`);
      setSuccessMsg('Payment confirmed and student balance updated successfully.');
      setShowActivityModal(false);
      setSelectedActivityPayment(null);
      fetchPaymentsActivity();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm payment.');
    } finally {
      setConfirmingActivity(false);
    }
  };

  // --- API Functions for Upload Tab ---
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

    try {
      await api.post('/fees/structures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Fee structure uploaded successfully.');
      setUploadName('');
      setUploadFile(null);
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
    if (!window.confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await api.delete(`/fees/structures/${id}`);
      setSuccessMsg('Fee structure deleted successfully.');
      fetchStructures();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // --- API Functions for Update Tab ---
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

  // --- API Functions for Set Tab ---
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

  // --- API Functions for Student View ---
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

  // Render Student Layout
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

        {/* Student Tab Control Header */}
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
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                View PDF
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
              
              {/* QR Code Container */}
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

              {/* Payment Details Form */}
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
                
                <div className="submit-btn-wrapper">
                  <button type="submit" className="btn-payment-submit" disabled={submittingPayment}>
                    {submittingPayment ? 'Submitting...' : 'Submit Payment'}
                  </button>
                </div>
              </form>
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

  const handleGenerateReceipt = (e) => {
    e.preventDefault();
    if (!receiptAdmissionNo.trim() || !receiptAmount) {
      alert('Please fill out all fields.');
      return;
    }

    // Generate random A-Z prefix + 5-digit receipt number
    const prefix = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const code = Math.floor(10000 + Math.random() * 90000);
    const receiptNo = `${prefix}${code}`;

    const dateStr = new Date().toLocaleDateString('en-GB');

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
          body {
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f0f2f5;
          }
          .receipt-container {
            width: 566px; /* Approx 15cm width at 96 DPI */
            height: 680px; /* Approx 18cm height at 96 DPI */
            background: #ffffff;
            border: 2px double #1a237e;
            border-radius: 8px;
            padding: 24px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .receipt-header {
            text-align: center;
            border-bottom: 2px solid #1a237e;
            padding-bottom: 12px;
          }
          .school-name {
            font-size: 20px;
            font-weight: 700;
            color: #1a237e;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .school-address {
            font-size: 12px;
            color: #455a64;
            margin: 0;
          }
          .receipt-title-box {
            display: inline-block;
            background: #e8eaf6;
            color: #1a237e;
            padding: 4px 16px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 8px;
            text-transform: uppercase;
          }
          .receipt-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 16px;
            font-size: 13px;
          }
          .meta-item strong {
            color: #1a237e;
          }
          .receipt-details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .receipt-details-table th, .receipt-details-table td {
            border: 1px solid #dcdfe6;
            padding: 10px 12px;
            text-align: left;
            font-size: 13px;
          }
          .receipt-details-table th {
            background: #f8fafc;
            color: #1a237e;
            font-weight: 600;
          }
          .amount-in-words {
            font-size: 12px;
            font-style: italic;
            color: #555;
            margin-top: 14px;
          }
          .receipt-footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-line {
            width: 150px;
            border-top: 1px solid #1a237e;
            text-align: center;
            font-size: 12px;
            color: #455a64;
            padding-top: 6px;
            margin-top: 40px;
          }
          .amount-badge {
            background: #e8f5e9;
            border: 1px solid #c8e6c9;
            color: #2e7d32;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 700;
            display: inline-block;
          }
          @media print {
            body {
              background: none;
              padding: 0;
            }
            .receipt-container {
              box-shadow: none;
              border: 2px double #000000;
              margin: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-content-wrap">
            <div class="receipt-header">
              <h1 class="school-name">Smt. Rajeshwari Reddy Scholar Convent</h1>
              <p class="school-address">Taluka Ramtek, Dist Nagpur</p>
              <div class="receipt-title-box">Fee Receipt</div>
            </div>
            
            <div class="receipt-meta">
              <div class="meta-item"><strong>Receipt No:</strong> ${receiptNo}</div>
              <div class="meta-item"><strong>Date:</strong> ${dateStr}</div>
            </div>

            <table class="receipt-details-table">
              <tr>
                <th>Field</th>
                <th>Details</th>
              </tr>
              <tr>
                <td><strong>Admission Number</strong></td>
                <td>${receiptAdmissionNo}</td>
              </tr>
              <tr>
                <td><strong>Academic Year</strong></td>
                <td>${receiptAcademicYear}</td>
              </tr>
              <tr>
                <td><strong>Class & Section</strong></td>
                <td>Class ${receiptClass} - Section ${receiptSection}</td>
              </tr>
              <tr>
                <td><strong>Particulars</strong></td>
                <td>${receiptParticulars}</td>
              </tr>
            </table>

            <div class="amount-in-words">
              <strong>Amount Paid in Words:</strong> Rupees ${numberToWords(Number(receiptAmount))} Only
            </div>
          </div>

          <div>
            <div class="receipt-footer">
              <div class="amount-badge">
                Amount: ₹${Number(receiptAmount).toLocaleString('en-IN')}
              </div>
              <div class="signatures">
                <div class="signature-line">Authorized Signatory</div>
              </div>
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
  };

  // Render Admin Layout
  return (
    <div className="fees-page" id="fees-page">
      <div className="page-header">
        <h2 className="page-title">Fees Management</h2>
        <span className="breadcrumb">Home / Fees</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}
      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      {/* Admin Tab Control Header */}
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
          <MdPayment /> Fee Payment Activity
        </button>
      </div>

      {/* Admin Tab 1: Upload Fee Structure */}
      {adminTab === 'upload' && (
        <div className="fee-tab-content">
          <div className="fee-upload-grid">
            {/* Upload Form Card */}
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

            {/* List of current uploaded files card */}
            <div className="fee-upload-list-card">
              <h3 className="card-title">Currently Uploaded Fee Structures</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>File Name</th>
                      <th>Uploaded On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="table-empty">No structures uploaded yet.</td>
                      </tr>
                    ) : (
                      structures.map(st => (
                        <tr key={st.id}>
                          <td>{st.name}</td>
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

      {/* Admin Tab 2: Update Fees */}
      {adminTab === 'update' && (
        <div className="fee-tab-content">
          {/* Filtration bar same as Documents page */}
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

          {!hasSearched ? (
            <div className="table-placeholder-card" style={{ marginTop: '20px' }}>
              <p>Please select filtration criteria and click "Show" to retrieve student records.</p>
            </div>
          ) : (
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
          )}
        </div>
      )}

      {/* Admin Tab 3: Set Fees */}
      {adminTab === 'set' && (
        <div className="fee-tab-content">
          <div className="fee-set-grid">
            {/* Column 1: Config Form + QR Code Form */}
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

              {/* Upload QR Code Card */}
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

            {/* Column 2: List of configured fees */}
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

      {/* Admin Tab 4: Generate Receipt */}
      {adminTab === 'receipt' && (
        <div className="fee-tab-content">
          <div className="fee-receipt-card">
            <h3 className="card-title">Generate Student Receipt</h3>
            <form onSubmit={handleGenerateReceipt} className="receipt-form">
              <div className="receipt-form-grid">
                <div className="form-group">
                  <label>Admission Number *</label>
                  <input
                    type="text"
                    placeholder="Enter student admission no"
                    value={receiptAdmissionNo}
                    onChange={e => setReceiptAdmissionNo(e.target.value)}
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
                  <label>Class *</label>
                  <select value={receiptClass} onChange={e => setReceiptClass(e.target.value)}>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section *</label>
                  <select value={receiptSection} onChange={e => setReceiptSection(e.target.value)}>
                    {['A', 'B', 'C'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Particulars *</label>
                  <select value={receiptParticulars} onChange={e => setReceiptParticulars(e.target.value)}>
                    <option value="School Fees">School Fees</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount in Rs (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={receiptAmount}
                    onChange={e => setReceiptAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-generate-receipt">
                Generate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Tab 5: Fee Payment Activity */}
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
                  <div className="payment-info-right">
                    <span className="payment-amount-text">₹{p.amount}</span>
                    <span className={`payment-status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Paid Amount Modal */}
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

      {/* Payment Activity Details Modal */}
      {showActivityModal && selectedActivityPayment && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Submission Details</h3>
              <button className="modal-close" onClick={() => setShowActivityModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '16px 0' }}>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Name</span>
                <span className="payment-detail-value">{selectedActivityPayment.name}</span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Class & Section</span>
                <span className="payment-detail-value">
                  {selectedActivityPayment.class} - {selectedActivityPayment.section || 'A'}
                </span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Admission No</span>
                <span className="payment-detail-value">{selectedActivityPayment.admission_no}</span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Amount Paid</span>
                <span className="payment-detail-value">₹{selectedActivityPayment.amount}</span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">UPI Transaction ID</span>
                <span className="payment-detail-value" style={{ wordBreak: 'break-all' }}>
                  {selectedActivityPayment.upi_transaction_id}
                </span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Submission Date</span>
                <span className="payment-detail-value">
                  {new Date(selectedActivityPayment.created_at).toLocaleString('en-GB')}
                </span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Status</span>
                <span className={`payment-status-badge ${selectedActivityPayment.status.toLowerCase()}`}>
                  {selectedActivityPayment.status}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setShowActivityModal(false)}
              >
                Close
              </button>
              {selectedActivityPayment.status === 'Pending' && (
                <button 
                  type="button" 
                  className="btn-confirm-payment" 
                  onClick={() => handleConfirmPayment(selectedActivityPayment.id)}
                  disabled={confirmingActivity}
                >
                  {confirmingActivity ? 'Confirming...' : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
