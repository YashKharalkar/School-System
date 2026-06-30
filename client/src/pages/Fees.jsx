import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Fees.css';

const CLASSES = ['All Classes', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const Fees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Admin states
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);

  // Form states
  const [feeForm, setFeeForm] = useState({ total_fee: '', paid_amount: '', academic_year: '2026-27' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Cash', receipt_no: '', remarks: '' });

  // Student states
  const [studentFee, setStudentFee] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      fetchFees();
    } else if (user?.student_id) {
      fetchStudentFeeDetails();
    }
  }, [selectedClass]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClass !== 'All Classes') params.class = selectedClass;
      if (searchTerm) params.search = searchTerm;
      const res = await api.get('/fees/all', { params });
      setStudents(res.data.fees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFees();
  };

  const openFeeModal = (student) => {
    setSelectedStudentFee(student);
    setFeeForm({
      total_fee: student.total_fee || '0',
      paid_amount: student.paid_amount || '0',
      academic_year: student.academic_year || '2026-27'
    });
    setShowFeeModal(true);
  };

  const openPaymentModal = (student) => {
    if (!student.id) {
      alert('Please set the total fee first before recording payments.');
      return;
    }
    setSelectedStudentFee(student);
    setPaymentForm({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'Cash',
      receipt_no: `REC-${Date.now().toString().slice(-6)}`,
      remarks: ''
    });
    setShowPaymentModal(true);
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/update', {
        student_id: selectedStudentFee.student_id || selectedStudentFee.id,
        total_fee: parseFloat(feeForm.total_fee),
        paid_amount: parseFloat(feeForm.paid_amount),
        academic_year: feeForm.academic_year
      });
      setSuccessMsg('Fee structure updated successfully.');
      setShowFeeModal(false);
      fetchFees();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to update fee details.');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/payment', {
        fee_id: selectedStudentFee.id,
        amount: parseFloat(paymentForm.amount),
        payment_date: paymentForm.payment_date,
        payment_method: paymentForm.payment_method,
        receipt_no: paymentForm.receipt_no,
        remarks: paymentForm.remarks
      });
      setSuccessMsg('Payment recorded successfully.');
      setShowPaymentModal(false);
      fetchFees();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to record payment.');
    }
  };

  if (!isAdmin) {
    const remaining = studentFee ? (studentFee.total_fee - studentFee.paid_amount) : 0;
    return (
      <div className="fees-page" id="fees-page">
        <div className="page-header">
          <h2 className="page-title">Fee Details</h2>
          <span className="breadcrumb">Home / Fee Structure</span>
        </div>

        {studentFee ? (
          <>
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
                <span>Remaining Amount</span>
              </div>
            </div>

            <div className="payment-history-card">
              <h3 className="card-title">Payment History</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Receipt No</th>
                      <th>Payment Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.length === 0 ? (
                      <tr><td colSpan="5" className="table-empty">No payments recorded yet.</td></tr>
                    ) : (
                      paymentHistory.map(p => (
                        <tr key={p.id}>
                          <td>{p.receipt_no}</td>
                          <td>{new Date(p.payment_date).toLocaleDateString('en-GB')}</td>
                          <td>₹{p.amount}</td>
                          <td>{p.payment_method}</td>
                          <td>{p.remarks || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="fee-placeholder-card">
            <p>Fee structure not updated yet for your account. Please contact administration.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fees-page" id="fees-page">
      <div className="page-header">
        <h2 className="page-title">Fee Management</h2>
        <span className="breadcrumb">Home / Fees</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}

      <div className="filter-bar">
        <form onSubmit={handleSearch} className="filter-left">
          <div className="filter-group">
            <label>Select Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group search-group">
            <label>Search Student</label>
            <input
              type="text"
              placeholder="Search by name or admission no."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search">Search</button>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Admission No.</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Total Fee</th>
              <th>Paid Amount</th>
              <th>Remaining</th>
              <th>Academic Year</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="table-loading">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="8" className="table-empty">No records found. Setup student fees via Student Management.</td></tr>
            ) : (
              students.map(s => {
                const total = s.total_fee || 0;
                const paid = s.paid_amount || 0;
                const remaining = total - paid;
                return (
                  <tr key={s.id}>
                    <td>{s.admission_no}</td>
                    <td>{s.name}</td>
                    <td>{s.class} - {s.section}</td>
                    <td>₹{total}</td>
                    <td>₹{paid}</td>
                    <td style={{ color: remaining > 0 ? 'var(--red-accent)' : 'var(--green-accent)', fontWeight: 'bold' }}>₹{remaining}</td>
                    <td>{s.academic_year || '-'}</td>
                    <td className="action-cell">
                      <button className="btn-fee-action update" title="Update Fee" onClick={() => openFeeModal(s)}>⚙️ Edit Fee</button>
                      <button className="btn-fee-action collect" title="Collect Fee" onClick={() => openPaymentModal(s)}>💰 Pay</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Fee Edit Modal */}
      {showFeeModal && (
        <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Fee Structure</h3>
              <button className="modal-close" onClick={() => setShowFeeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleFeeSubmit} className="modal-form">
              <p className="modal-student-name">Student: <strong>{selectedStudentFee?.name}</strong></p>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>Total Fee (₹)</label>
                <input
                  type="number"
                  value={feeForm.total_fee}
                  onChange={e => setFeeForm({ ...feeForm, total_fee: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>Already Paid (₹)</label>
                <input
                  type="number"
                  value={feeForm.paid_amount}
                  onChange={e => setFeeForm({ ...feeForm, paid_amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Academic Year</label>
                <input
                  type="text"
                  value={feeForm.academic_year}
                  onChange={e => setFeeForm({ ...feeForm, academic_year: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowFeeModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Collect Fee Payment</h3>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="modal-form">
              <p className="modal-student-name">Student: <strong>{selectedStudentFee?.name}</strong></p>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>Payment Amount (₹)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>Receipt No.</label>
                <input
                  type="text"
                  value={paymentForm.receipt_no}
                  onChange={e => setPaymentForm({ ...paymentForm, receipt_no: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Remarks</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={paymentForm.remarks}
                  onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Submit Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
