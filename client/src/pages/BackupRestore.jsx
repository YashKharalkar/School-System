import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  MdBackup, MdRestore, MdDelete, MdAdd,
  MdCheckCircle, MdError, MdWarning, MdClose, MdCloudDownload
} from 'react-icons/md';
import './BackupRestore.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = '#2e7d32' }) => {
  if (!isOpen) return null;
  return (
    <div className="bkp-confirm-overlay" onClick={onCancel}>
      <div className="bkp-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="bkp-confirm-icon">
          <MdWarning />
        </div>
        <h3 className="bkp-confirm-title">{title}</h3>
        <p className="bkp-confirm-msg">{message}</p>
        <div className="bkp-confirm-btns">
          <button className="bkp-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="bkp-confirm-ok" style={{ background: confirmColor }} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ msg, type, onClose }) => {
  if (!msg) return null;
  return (
    <div className={`bkp-toast bkp-toast--${type}`}>
      <span>{msg}</span>
      <button className="bkp-toast-close" onClick={onClose}><MdClose /></button>
    </div>
  );
};

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
  };

  const [confirm, setConfirm] = useState({
    open: false, title: '', message: '', confirmLabel: '', confirmColor: '#2e7d32', onConfirm: null
  });
  const openConfirm = (opts) => setConfirm({ open: true, ...opts });
  const closeConfirm = () => setConfirm(prev => ({ ...prev, open: false }));

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/backup');
      if (res.data.success) {
        setBackups(res.data.backups);
      }
    } catch (err) {
      console.error('Failed to load backups:', err);
      showToast('Failed to retrieve backups list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/backup/create');
      if (res.data.success) {
        showToast('Backup created successfully!', 'success');
        fetchBackups();
      }
    } catch (err) {
      console.error('Failed to create backup:', err);
      showToast(err.response?.data?.message || 'Failed to create backup.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = (filename) => {
    openConfirm({
      title: 'Restore Database',
      message: `Are you sure you want to restore the system to backup file "${filename}"? All current data will be overwritten and replaced. This action cannot be undone!`,
      confirmLabel: 'Restore Now',
      confirmColor: '#d32f2f',
      onConfirm: async () => {
        closeConfirm();
        setActionLoading(true);
        try {
          const res = await api.post('/backup/restore', { filename });
          if (res.data.success) {
            showToast('System data successfully restored!', 'success');
          }
        } catch (err) {
          console.error('Failed to restore database:', err);
          showToast(err.response?.data?.message || 'Failed to restore database.', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleDelete = (filename) => {
    openConfirm({
      title: 'Delete Backup File',
      message: `Are you sure you want to permanently delete backup "${filename}"?`,
      confirmLabel: 'Delete',
      confirmColor: '#c62828',
      onConfirm: async () => {
        closeConfirm();
        setActionLoading(true);
        try {
          const res = await api.delete(`/backup/${filename}`);
          if (res.data.success) {
            showToast('Backup file deleted.', 'success');
            fetchBackups();
          }
        } catch (err) {
          console.error('Failed to delete backup:', err);
          showToast(err.response?.data?.message || 'Failed to delete backup file.', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="backup-restore-page">
      <div className="page-header backup-header-flex">
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdBackup /> Backup &amp; Restore
          </h2>
          <span className="breadcrumb">Home / Backup &amp; Restore</span>
        </div>

        <button
          className="btn btn-primary create-backup-btn"
          onClick={handleCreateBackup}
          disabled={actionLoading}
        >
          <MdAdd /> Create Backup
        </button>
      </div>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        confirmColor={confirm.confirmColor}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />

      <div className="dashboard-card backup-list-card">
        <div className="card-header-with-icon">
          <div className="header-icon-wrap"><MdCloudDownload /></div>
          <div>
            <h3 className="card-title">Available Backups</h3>
            <span className="card-subtitle">Manage historical system snapshots</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading backups list...</div>
        ) : backups.length === 0 ? (
          <div className="empty-state">
            <p>No historical backups found. Click "Create Backup" above to take your first snapshot.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="backups-table">
              <thead>
                <tr>
                  <th>Backup Filename</th>
                  <th>Created At</th>
                  <th>File Size</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((bkp) => (
                  <tr key={bkp.filename}>
                    <td className="filename-cell">
                      <span className="file-badge">JSON</span>
                      <span className="filename-text">{bkp.filename}</span>
                    </td>
                    <td>{formatDateTime(bkp.createdAt)}</td>
                    <td className="size-cell">{formatSize(bkp.sizeBytes)}</td>
                    <td>
                      <div className="backup-action-btns">
                        <button
                          className="btn btn-sm restore-btn"
                          onClick={() => handleRestore(bkp.filename)}
                          disabled={actionLoading}
                        >
                          <MdRestore /> Restore
                        </button>
                        <button
                          className="btn btn-sm delete-btn"
                          onClick={() => handleDelete(bkp.filename)}
                          disabled={actionLoading}
                        >
                          <MdDelete /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupRestore;
