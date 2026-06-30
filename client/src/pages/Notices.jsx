import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Notices.css';

const Notices = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form / Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false });

  useEffect(() => {
    fetchNotices();
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

  const openAddModal = () => {
    setEditingNotice(null);
    setForm({ title: '', content: '', is_pinned: false });
    setShowModal(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title,
      content: notice.content,
      is_pinned: notice.is_pinned === 1 || notice.is_pinned === true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await api.put(`/notices/${editingNotice.id}`, form);
        setSuccessMsg('Notice updated successfully.');
      } else {
        await api.post('/notices', form);
        setSuccessMsg('Notice published successfully.');
      }
      setShowModal(false);
      fetchNotices();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to save notice.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
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

  return (
    <div className="notices-page" id="notices-page">
      <div className="page-header">
        <h2 className="page-title">School Notice Board</h2>
        <span className="breadcrumb">Home / Notices</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}

      {isAdmin && (
        <div className="notices-action-bar">
          <button className="btn-add-notice" onClick={openAddModal}>📢 Add New Notice</button>
        </div>
      )}

      <div className="notices-list">
        {loading ? (
          <div className="notices-loading">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="notices-empty">No notices on the notice board.</div>
        ) : (
          notices.map(notice => (
            <div key={notice.id} className={`notice-item-card ${notice.is_pinned ? 'pinned' : ''}`}>
              {notice.is_pinned ? <span className="pinned-badge">📌 Pinned</span> : null}
              <div className="notice-card-header">
                <h3 className="notice-item-title">{notice.title}</h3>
                <span className="notice-date">{formatDate(notice.created_at)}</span>
              </div>
              <p className="notice-item-content">{notice.content}</p>
              <div className="notice-card-footer">
                <span className="notice-author">By: {notice.created_by_name || 'Administrator'}</span>
                {isAdmin && (
                  <div className="notice-actions">
                    <button className="btn-notice-edit" onClick={() => openEditModal(notice)}>✏️ Edit</button>
                    <button className="btn-notice-delete" onClick={() => handleDelete(notice.id)}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingNotice ? 'Edit Notice' : 'Add New Notice'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Notice Title *</label>
                <input
                  type="text"
                  placeholder="Enter notice title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Notice Content *</label>
                <textarea
                  rows="6"
                  placeholder="Enter notice details..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="form-group checkbox-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.is_pinned}
                    onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                  />
                  Pin this notice to top
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingNotice ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
