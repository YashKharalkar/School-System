import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { MdDelete } from 'react-icons/md';
import './Notices.css';

const ALL_CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const ALL_SECTIONS = ['A', 'B', 'C'];

const Notices = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({ title: '', content: '' });
  const [selectedClasses, setSelectedClasses] = useState(['Everyone']);
  const [selectedSections, setSelectedSections] = useState(['Everyone']);
  const [durationDays, setDurationDays] = useState('7');

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.multiselect-dropdown-container')) {
        setShowClassDropdown(false);
        setShowSectionDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices');
      setNotices(res.data.notices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassToggle = (c) => {
    if (c === 'Everyone') {
      setSelectedClasses(['Everyone']);
    } else {
      let updated = selectedClasses.filter(x => x !== 'Everyone');
      if (updated.includes(c)) {
        updated = updated.filter(x => x !== c);
      } else {
        updated.push(c);
      }
      if (updated.length === 0) {
        setSelectedClasses(['Everyone']);
      } else {
        setSelectedClasses(updated);
      }
    }
  };

  const handleSectionToggle = (s) => {
    if (s === 'Everyone') {
      setSelectedSections(['Everyone']);
    } else {
      let updated = selectedSections.filter(x => x !== 'Everyone');
      if (updated.includes(s)) {
        updated = updated.filter(x => x !== s);
      } else {
        updated.push(s);
      }
      if (updated.length === 0) {
        setSelectedSections(['Everyone']);
      } else {
        setSelectedSections(updated);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        content: form.content,
        target_classes: selectedClasses,
        target_sections: selectedSections,
        duration_days: durationDays
      };
      await api.post('/notices', payload);
      setSuccessMsg('Notice published successfully.');
      setForm({ title: '', content: '' });
      setSelectedClasses(['Everyone']);
      setSelectedSections(['Everyone']);
      setDurationDays('7');
      fetchNotices();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to publish notice.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Do you really want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      setSuccessMsg('Notice deleted.');
      fetchNotices();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to delete notice.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTargets = (classesStr, sectionsStr) => {
    let classes = ['Everyone'];
    let sections = ['Everyone'];
    try {
      if (classesStr) classes = JSON.parse(classesStr);
    } catch (e) {}
    try {
      if (sectionsStr) sections = JSON.parse(sectionsStr);
    } catch (e) {}
    return `Classes: ${classes.join(', ')} | Sections: ${sections.join(', ')}`;
  };

  return (
    <div className="notices-page" id="notices-page">
      <div className="page-header">
        <h2 className="page-title">School Notice Board</h2>
        <span className="breadcrumb">Home / Notices</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}

      {isAdmin && (
        <div className="notice-creation-card">
          <h3>Create New Notice</h3>
          <form onSubmit={handleSubmit} className="notice-form">
            <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Notice Title *</label>
                <input
                  type="text"
                  placeholder="Enter notice title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group duration-group" style={{ width: '200px' }}>
                <label>Notice Duration (Days) *</label>
                <select value={durationDays} onChange={e => setDurationDays(e.target.value)}>
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="5">5 Days</option>
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                </select>
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>

              <div className="form-group relative-select" style={{ flex: 1 }}>
                <label>Target Classes</label>
                <div className="multiselect-dropdown-container">
                  <div className="multiselect-header" onClick={() => { setShowClassDropdown(!showClassDropdown); setShowSectionDropdown(false); }}>
                    {selectedClasses.join(', ')}
                  </div>
                  {showClassDropdown && (
                    <div className="multiselect-options">
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes('Everyone')}
                          onChange={() => handleClassToggle('Everyone')}
                        />
                        Everyone
                      </label>
                      {ALL_CLASSES.map(c => (
                        <label key={c} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={selectedClasses.includes(c)}
                            onChange={() => handleClassToggle(c)}
                          />
                          Class {c}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group relative-select" style={{ flex: 1 }}>
                <label>Target Sections</label>
                <div className="multiselect-dropdown-container">
                  <div className="multiselect-header" onClick={() => { setShowSectionDropdown(!showSectionDropdown); setShowClassDropdown(false); }}>
                    {selectedSections.join(', ')}
                  </div>
                  {showSectionDropdown && (
                    <div className="multiselect-options">
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={selectedSections.includes('Everyone')}
                          onChange={() => handleSectionToggle('Everyone')}
                        />
                        Everyone
                      </label>
                      {ALL_SECTIONS.map(s => (
                        <label key={s} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={selectedSections.includes(s)}
                            onChange={() => handleSectionToggle(s)}
                          />
                          Section {s}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Notice Content *</label>
              <textarea
                rows="4"
                placeholder="Enter notice details..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-publish">Publish Notice</button>
            </div>
          </form>
        </div>
      )}

      <div className="notices-list" style={{ marginTop: isAdmin ? '24px' : '0' }}>
        {loading ? (
          <div className="notices-loading">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="notices-empty">No notices on the notice board.</div>
        ) : (
          notices.map(notice => (
            <div key={notice.id} className="notice-item-card">
              <div className="notice-card-header">
                <h3 className="notice-item-title">{notice.title}</h3>
                <span className="notice-date">{formatDate(notice.created_at)}</span>
              </div>
              <p className="notice-item-content">{notice.content}</p>
              <div className="notice-card-footer">
                <span className="notice-author">By: {notice.created_by_name || 'Administrator'}</span>
                {isAdmin && (
                  <span className="notice-targets" style={{ fontSize: '11px', color: 'var(--text-light)', marginLeft: '12px' }}>
                    Targets: {formatTargets(notice.target_classes, notice.target_sections)}
                  </span>
                )}
                {isAdmin && (
                  <div className="notice-actions">
                    <button className="btn-notice-delete" onClick={() => handleDelete(notice.id)}><MdDelete /> Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notices;
