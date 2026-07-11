import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  MdAutorenew, MdCheckCircle, MdError, MdDateRange,
  MdSchool, MdWarning, MdClose, MdArrowForward, MdGroups
} from 'react-icons/md';
import './AnnualUpdate.css';

const CLASS_CHAIN = [
  'Nursery', 'LKG', 'UKG',
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'
];

const AnnualUpdate = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState('');
  const [loadingYear, setLoadingYear] = useState(false);

  // Promote All states
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [batchAcademicYear, setBatchAcademicYear] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState(null); // { totalMoved, details }

  // Feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAcademicYear();
  }, []);

  const fetchAcademicYear = async () => {
    try {
      const res = await api.get('/settings/academic-year');
      if (res.data.success) {
        setAcademicYear(res.data.academicYear);
        setNewAcademicYear(res.data.academicYear);
      }
    } catch (err) {
      console.error('Failed to fetch academic year:', err);
    }
  };

  const handleUpdateYear = async (e) => {
    e.preventDefault();
    setLoadingYear(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.put('/settings/academic-year', { academicYear: newAcademicYear });
      if (res.data.success) {
        setAcademicYear(newAcademicYear);
        setSuccessMsg('Academic year updated successfully everywhere!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update academic year.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoadingYear(false);
    }
  };

  const openPromoteModal = () => {
    setBatchAcademicYear(academicYear || '');
    setPromoteResult(null);
    setShowPromoteModal(true);
  };

  const handlePromoteAll = async () => {
    if (!batchAcademicYear.trim()) return;
    setPromoting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.post('/students/promote-all', {
        statusAcademicYear: batchAcademicYear.trim()
      });
      if (res.data.success) {
        setPromoteResult({
          totalMoved: res.data.totalMoved,
          details: res.data.details || []
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to promote classes.');
      setShowPromoteModal(false);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setPromoting(false);
    }
  };

  const closePromoteModal = () => {
    setShowPromoteModal(false);
    setPromoteResult(null);
    if (promoteResult) {
      setSuccessMsg(`✅ ${promoteResult.totalMoved} students successfully promoted!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  return (
    <div className="annual-update-page">
      <div className="page-header">
        <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdAutorenew /> Annual Update
        </h2>
        <span className="breadcrumb">Home / Annual Update</span>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <MdCheckCircle /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger">
          <MdError /> {errorMsg}
        </div>
      )}

      <div className="annual-update-grid">

        {/* ── Card 1: Update Academic Year ── */}
        <div className="update-card">
          <div className="card-header">
            <h3>Update Academic Year</h3>
            <span className="card-subtitle">Manage system-wide default academic year</span>
          </div>
          <form onSubmit={handleUpdateYear} className="card-body">
            <div className="current-badge-wrapper">
              <span className="label">Current Academic Year:</span>
              <span className="badge-year">{academicYear || '...'}</span>
            </div>

            <div className="form-group">
              <label>Set New Academic Year</label>
              <div className="input-with-icon">
                <MdDateRange className="icon" />
                <input
                  type="text"
                  value={newAcademicYear}
                  onChange={e => setNewAcademicYear(e.target.value)}
                  placeholder="e.g. 2026-27"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-update" disabled={loadingYear}>
              {loadingYear ? 'Updating...' : 'Update Year'}
            </button>
          </form>
        </div>

        {/* ── Card 2: Promote All Classes ── */}
        <div className="update-card promote-card">
          <div className="card-header promote-card-header">
            <div className="promote-header-icon"><MdSchool /></div>
            <div>
              <h3>Annual Class Promotion</h3>
              <span className="card-subtitle">Automatically promote all students to the next class</span>
            </div>
          </div>

          <div className="card-body">
            {/* Flow diagram */}
            <div className="promo-flow-wrap">
              <div className="promo-flow">
                {CLASS_CHAIN.map((cls, i) => (
                  <div key={cls} className="promo-flow-item">
                    <div className={`promo-cls-chip ${cls === '12th' ? 'promo-cls-chip--archive' : ''}`}>
                      {cls}
                    </div>
                    {i < CLASS_CHAIN.length - 1 && (
                      <MdArrowForward className="promo-arrow" />
                    )}
                  </div>
                ))}
                <div className="promo-flow-item">
                  <MdArrowForward className="promo-arrow" />
                  <div className="promo-cls-chip promo-cls-chip--past">
                    Past 12th Batch
                  </div>
                </div>
              </div>
            </div>

            <ul className="promo-info-list">
              <li><MdCheckCircle className="promo-info-icon ok" /> Nursery → LKG, LKG → UKG, and so on up to 12th</li>
              <li><MdCheckCircle className="promo-info-icon ok" /> 12th graders are archived to Past 12th Batch</li>
              <li><MdCheckCircle className="promo-info-icon ok" /> Nursery will be left empty (ready for new admissions)</li>
              <li><MdWarning className="promo-info-icon warn" /> This action applies to all sections (A, B, C) together</li>
              <li><MdWarning className="promo-info-icon warn" /> This cannot be reversed — ensure data is backed up first</li>
            </ul>

            <button
              type="button"
              className="btn-promote-all"
              onClick={openPromoteModal}
            >
              <MdGroups />
              Promote All Classes &amp; Move 12th to Past 12th Batch
            </button>
          </div>
        </div>
      </div>

      {/* ── Promote Modal ── */}
      {showPromoteModal && (
        <div className="modal-overlay" onClick={!promoting && !promoteResult ? closePromoteModal : undefined}>
          <div className="promo-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="promo-modal-header">
              <div className="promo-modal-icon">
                <MdSchool />
              </div>
              <div>
                <h3 className="promo-modal-title">Annual Class Promotion</h3>
                <p className="promo-modal-sub">All classes will be promoted in one operation</p>
              </div>
              {!promoting && (
                <button className="promo-modal-close" onClick={closePromoteModal}><MdClose /></button>
              )}
            </div>

            {/* Body */}
            <div className="promo-modal-body">
              {/* Step 1: Academic year input */}
              {!promoteResult && (
                <>
                  <div className="promo-modal-section">
                    <div className="promo-modal-section-title">12th Batch Academic Year</div>
                    <p className="promo-modal-section-desc">
                      Students currently in <strong>12th class</strong> will be moved to the 
                      <strong> Past 12th Batch</strong>. Enter the academic year they belong to:
                    </p>
                    <div className="input-with-icon" style={{ marginTop: '12px' }}>
                      <MdDateRange className="icon" />
                      <input
                        type="text"
                        value={batchAcademicYear}
                        onChange={e => setBatchAcademicYear(e.target.value)}
                        placeholder="e.g. 2025-26"
                        required
                        disabled={promoting}
                        style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1.5px solid var(--border-color)', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="promo-modal-warning">
                    <MdWarning className="promo-warn-icon" />
                    <span>This will promote <strong>all students in all sections</strong> to the next class. This action is irreversible.</span>
                  </div>
                </>
              )}

              {/* Step 2: Result after promote */}
              {promoteResult && (
                <div className="promo-result">
                  <div className="promo-result-header">
                    <MdCheckCircle className="promo-result-icon" />
                    <div>
                      <div className="promo-result-title">Promotion Complete!</div>
                      <div className="promo-result-count">{promoteResult.totalMoved} students promoted</div>
                    </div>
                  </div>

                  {promoteResult.details.length > 0 && (
                    <div className="promo-result-details">
                      <div className="promo-result-details-title">Breakdown:</div>
                      <ul>
                        {promoteResult.details.map((d, i) => (
                          <li key={i}><MdArrowForward className="detail-arrow" /> {d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {promoteResult.details.length === 0 && (
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                      No students were moved. The classes may already be empty.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="promo-modal-footer">
              {!promoteResult ? (
                <>
                  <button
                    className="promo-btn-cancel"
                    onClick={closePromoteModal}
                    disabled={promoting}
                  >
                    Cancel
                  </button>
                  <button
                    className="promo-btn-confirm"
                    onClick={handlePromoteAll}
                    disabled={promoting || !batchAcademicYear.trim()}
                  >
                    {promoting ? (
                      <>
                        <span className="promo-spinner"></span>
                        Promoting...
                      </>
                    ) : (
                      <>
                        <MdSchool />
                        Promote All Classes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button className="promo-btn-done" onClick={closePromoteModal}>
                  <MdCheckCircle /> Done
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualUpdate;
