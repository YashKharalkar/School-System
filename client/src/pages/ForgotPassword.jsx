import { useState } from 'react';
import { FaUser, FaCalendarAlt, FaKey, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import './ForgotPassword.css';

// Simulated OTP (in production this would go to actual SMS)
const SIMULATED_OTP = '123456';

const ForgotPassword = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1=userId+dob, 2=otp, 3=newPassword
  const [userId, setUserId] = useState('');
  const [dob, setDob] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState('');
  // Store the generated OTP for simulation
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!userId.trim()) { setError('Please enter your User ID.'); return; }
    if (!dob) { setError('Please enter your Date of Birth.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId.trim(), dob })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed.');
      setMaskedMobile(data.maskedMobile || 'XXXXXX1234');
      setGeneratedOtp(data.otp || SIMULATED_OTP); // for demo
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Please enter the OTP.'); return; }
    if (otp.trim() !== (generatedOtp || SIMULATED_OTP)) {
      setError('Invalid OTP. Please try again.');
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId.trim(), dob, otp: otp.trim(), newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed.');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-overlay" onClick={onClose}>
      <div className="fp-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="fp-header">
          <div className="fp-header-icon">
            <FaKey />
          </div>
          <div>
            <h2 className="fp-title">Forgot Password</h2>
            <p className="fp-subtitle">
              {step === 1 && 'Enter your User ID and Date of Birth'}
              {step === 2 && 'Enter the OTP sent to your mobile'}
              {step === 3 && 'Set your new password'}
            </p>
          </div>
          <button className="fp-close" onClick={onClose}><MdClose /></button>
        </div>

        {/* Step Indicator */}
        <div className="fp-steps">
          {[1, 2, 3].map(s => (
            <div key={s} className={`fp-step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
              <div className="fp-step-circle">{step > s ? '✓' : s}</div>
              <span className="fp-step-label">
                {s === 1 ? 'Verify' : s === 2 ? 'OTP' : 'Reset'}
              </span>
            </div>
          ))}
        </div>

        {error && <div className="fp-error">{error}</div>}

        {/* Step 1: User ID + DOB */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="fp-form">
            <div className="fp-field">
              <span className="fp-field-icon"><FaUser /></span>
              <input
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="fp-field">
              <span className="fp-field-icon"><FaCalendarAlt /></span>
              <input
                type="date"
                placeholder="Date of Birth"
                value={dob}
                onChange={e => setDob(e.target.value)}
              />
            </div>
            <button type="submit" className="fp-btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Send OTP'}
            </button>
            <p className="fp-otp-note">
              📱 OTP will be sent on your registered mobile number
            </p>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="fp-form">
            <div className="fp-otp-sent-info">
              OTP sent to <strong>{maskedMobile}</strong>
            </div>
            <div className="fp-field">
              <span className="fp-field-icon"><FaKey /></span>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
            <button type="submit" className="fp-btn-primary">
              Verify OTP
            </button>
            <button type="button" className="fp-btn-link" onClick={() => { setStep(1); setOtp(''); setError(''); }}>
              ← Back / Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="fp-form">
            <div className="fp-field">
              <span className="fp-field-icon"><FaLock /></span>
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="fp-toggle-eye" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="fp-field">
              <span className="fp-field-icon"><FaLock /></span>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="fp-toggle-eye" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" className="fp-btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
