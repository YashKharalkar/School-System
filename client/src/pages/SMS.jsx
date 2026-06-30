import { useState, useEffect } from 'react';
import api from '../services/api';
import { MdHistory, MdSend } from 'react-icons/md';
import './SMS.css';

const CLASSES = ['All Classes', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const SMS = () => {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { fetchStudents(); }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      const params = { limit: 100 };
      if (selectedClass !== 'All Classes') params.class = selectedClass;
      if (searchTerm) params.search = searchTerm;
      const res = await api.get('/students', { params });
      setStudents(res.data.students);
    } catch (err) { console.error(err); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === students.length) setSelectedIds([]);
    else setSelectedIds(students.map(s => s.id));
  };

  const handleSend = async () => {
    if (!message.trim()) return alert('Please enter a message');
    if (selectedIds.length === 0) return alert('Select at least one student');
    setSending(true);
    try {
      const recipients = selectedIds.map(id => {
        const s = students.find(st => st.id === id);
        return s ? `${s.name} (${s.admission_no})` : id;
      });
      await api.post('/sms/send', { class: selectedClass, recipients, message: message.trim() });
      setSuccessMsg(`SMS sent to ${selectedIds.length} students!`);
      setMessage(''); setSelectedIds([]);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) { alert('Failed to send SMS'); }
    finally { setSending(false); }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get('/sms/history');
      setHistory(res.data.logs);
      setShowHistory(true);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="sms-page" id="sms-page">
      <div className="page-header">
        <h2 className="page-title">SMS Management</h2>
        <span className="breadcrumb">Home / SMS</span>
      </div>
      {successMsg && <div className="success-banner">{successMsg}</div>}
      <div className="sms-layout">
        {/* Left: Filters + Student List */}
        <div className="sms-left">
          <div className="sms-filters">
            <div className="filter-group"><label>Select Class</label>
              <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedIds([]); }}>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group"><label>Search Student</label>
              <input placeholder="Search by name or admission no." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchStudents()} />
            </div>
            <button className="btn-search" onClick={fetchStudents}>Search</button>
          </div>
          <div className="sms-student-list">
            <div className="sms-list-header">
              <label><input type="checkbox" checked={selectedIds.length === students.length && students.length > 0}
                onChange={toggleAll} /> Select All</label>
              <span>Student List ({students.length})</span>
            </div>
            {students.map(s => (
              <label key={s.id} className="sms-student-item">
                <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} />
                <span>{s.name} ({s.admission_no}) - Class {s.class}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right: Compose */}
        <div className="sms-right">
          <h3 className="card-title">Compose SMS</h3>
          <textarea placeholder="Dear Parent,&#10;&#10;This is to inform you that..." value={message}
            onChange={e => setMessage(e.target.value)} rows="10" className="sms-textarea"></textarea>
          <div className="sms-footer">
            <span className="char-count">Characters: {message.length}</span>
            <div className="sms-actions">
              <button className="btn-history" onClick={loadHistory}><MdHistory /> History</button>
              <button className="btn-send" onClick={handleSend} disabled={sending}>
                {sending ? 'Sending...' : <><MdSend /> Send SMS</>}
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="sms-history">
              <h4>SMS History <button className="modal-close" onClick={() => setShowHistory(false)}>✕</button></h4>
              <table>
                <thead><tr><th>Date</th><th>Class</th><th>Recipients</th><th>Message</th></tr></thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td>{new Date(h.sent_at).toLocaleDateString()}</td>
                      <td>{h.class || 'All'}</td>
                      <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.recipients}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.message}</td>
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

export default SMS;
