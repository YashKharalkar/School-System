import { useState, useEffect } from 'react';
import api from '../services/api';
import { MdAutorenew, MdCheckCircle, MdError, MdDateRange } from 'react-icons/md';
import './AnnualUpdate.css';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SECTIONS = ['A', 'B', 'C'];
const TO_CLASSES = [...CLASSES, 'Move to Past 10th Batch', 'Move to Past 12th Batch'];

const AnnualUpdate = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState('');
  const [loadingYear, setLoadingYear] = useState(false);

  // Transition States
  const [changeClass, setChangeClass] = useState('Nursery');
  const [changeSection, setChangeSection] = useState('A');
  const [toClass, setToClass] = useState('LKG');
  const [toSection, setToSection] = useState('A');
  const [loadingTransition, setLoadingTransition] = useState(false);

  // Modal / Confirm States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [batchAcademicYear, setBatchAcademicYear] = useState('');
  
  // Feedback States
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

  const handleTransitionSubmit = (e) => {
    e.preventDefault();
    if (toClass.includes('Move to')) {
      setBatchAcademicYear(academicYear); // default suggestion
      setShowConfirmModal(true);
    } else {
      executeTransition(null);
    }
  };

  const executeTransition = async (statusYear) => {
    setLoadingTransition(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.post('/students/annual-update', {
        changeClass,
        changeSection,
        toClass: toClass.includes('Move to') ? (toClass.includes('10th') ? 'move to past 10th batch' : 'move to past 12th batch') : toClass,
        toSection,
        statusAcademicYear: statusYear
      });
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Students updated successfully!');
        setShowConfirmModal(false);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to execute transition.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setLoadingTransition(false);
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
        {/* Section 1: Update Academic Year */}
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

        {/* Section 2: Update Class & Sections */}
        <div className="update-card">
          <div className="card-header">
            <h3>Update Class & Sections</h3>
            <span className="card-subtitle">Bulk promote classes or archive graduating batches</span>
          </div>
          <form onSubmit={handleTransitionSubmit} className="card-body">
            <div className="transition-layout">
              {/* FROM SECTION */}
              <div className="transition-block">
                <span className="block-title">Change</span>
                <div className="form-group">
                  <label>Class</label>
                  <select value={changeClass} onChange={e => setChangeClass(e.target.value)}>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select value={changeSection} onChange={e => setChangeSection(e.target.value)}>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* ARROW OR CONNECTOR */}
              <div className="transition-connector">
                <div className="connector-line"></div>
                <span className="connector-text">TO</span>
              </div>

              {/* TO SECTION */}
              <div className="transition-block">
                <span className="block-title">Change to</span>
                <div className="form-group">
                  <label>Class / Status</label>
                  <select value={toClass} onChange={e => setToClass(e.target.value)}>
                    {TO_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select value={toSection} onChange={e => setToSection(e.target.value)} disabled={toClass.includes('Move to')}>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-update" disabled={loadingTransition}>
              {loadingTransition ? 'Updating...' : 'Update Transition'}
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation modal for past batches */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal modal-sm" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a237e' }}>Archive Student Batch</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
              You are about to move students of <strong>{changeClass} {changeSection}</strong> to the <strong>{toClass}</strong>. 
              Please enter the academic year for this graduating batch.
            </p>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>Academic Year *</label>
              <input 
                type="text" 
                value={batchAcademicYear} 
                onChange={e => setBatchAcademicYear(e.target.value)} 
                placeholder="e.g. 2025-26"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-save" 
                onClick={() => executeTransition(batchAcademicYear)}
                disabled={!batchAcademicYear.trim()}
                style={{ padding: '8px 16px', background: '#1a237e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Archive Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualUpdate;
