import { useState, useEffect } from 'react';
import api from '../services/api';
import { MdSend } from 'react-icons/md';
import './SMS.css';

const CLASSES = ['All Classes', 'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SECTIONS = ['Everyone', 'A', 'B', 'C'];
const GENDERS = ['Everyone', 'Male', 'Female'];

const SMS = () => {
  const [students, setStudents] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterAdmissionNo, setFilterAdmissionNo] = useState('');
  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterSection, setFilterSection] = useState('Everyone');
  const [filterGender, setFilterGender] = useState('Everyone');
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = { limit: 200 };
      if (filterClass !== 'All Classes') params.class = filterClass;
      if (filterSection !== 'Everyone') params.section = filterSection;
      if (filterGender !== 'Everyone') params.gender = filterGender;
      if (filterName) params.name = filterName;
      if (filterAdmissionNo) params.admission_no = filterAdmissionNo;
      
      const res = await api.get('/students', { params });
      setStudents(res.data.students);
      setSelectedIds([]); // Reset selection when filters change
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchStudents();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return alert('Please enter a message.');
    if (selectedIds.length === 0) return alert('Please select at least one student.');
    setSending(true);
    try {
      const recipients = selectedIds.map(id => {
        const s = students.find(st => st.id === id);
        return s ? `${s.name} (${s.admission_no})` : id;
      });
      await api.post('/sms/send', { class: filterClass, recipients, message: message.trim() });
      setSuccessMsg(`SMS sent to ${selectedIds.length} students!`);
      setMessage('');
      setSelectedIds([]);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert('Failed to send SMS.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sms-page" id="sms-page">
      <div className="page-header">
        <h2 className="page-title">SMS Management</h2>
        <span className="breadcrumb">Home / SMS</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* Filters (same as Documents section) */}
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
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
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
          <button className="btn-search" onClick={fetchStudents}>Show</button>
        </div>
      </div>

      <div className="sms-layout">
        {/* Left column: Student selection list */}
        <div className="sms-left">
          <div className="sms-student-card">
            <div className="sms-card-header">
              <h3 className="card-title">Recipient Selection</h3>
              <span className="selection-count">
                Selected: <strong>{selectedIds.length}</strong> / {students.length}
              </span>
            </div>
            
            <div className="selection-actions">
              <button 
                type="button" 
                className="btn-select-all" 
                onClick={handleSelectAll}
                disabled={students.length === 0}
              >
                {selectedIds.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="sms-student-list">
              {loading ? (
                <div className="list-loading">Loading students...</div>
              ) : !hasSearched ? (
                <div className="list-empty">Please apply filters and click "Show" to view students.</div>
              ) : students.length === 0 ? (
                <div className="list-empty">No students match the current filters.</div>
              ) : (
                students.map(s => (
                  <label key={s.id} className={`sms-student-item ${selectedIds.includes(s.id) ? 'selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(s.id)} 
                      onChange={() => toggleSelect(s.id)} 
                    />
                    <div className="student-info">
                      <span className="student-name">{s.name}</span>
                      <span className="student-details">Adm No: {s.admission_no} | Class: {s.class} | Sec: {s.section || 'A'}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Compose SMS card */}
        <div className="sms-right">
          <div className="sms-compose-card">
            <h3 className="card-title">Compose SMS</h3>
            <textarea 
              placeholder="Type your message here... e.g. Dear Parent, this is to inform you that..." 
              value={message}
              onChange={e => setMessage(e.target.value)} 
              rows="12" 
              className="sms-textarea"
            ></textarea>
            
            <div className="sms-footer">
              <span className="char-count">Characters: <strong>{message.length}</strong></span>
              <button 
                className="btn-send" 
                onClick={handleSend} 
                disabled={sending || selectedIds.length === 0}
              >
                {sending ? 'Sending...' : <><MdSend /> Send SMS</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMS;
