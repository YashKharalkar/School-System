import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { FaEye } from 'react-icons/fa';
import { MdDownload, MdDelete } from 'react-icons/md';
import './Timetable.css';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SECTIONS = ['A', 'B', 'C'];

const Timetable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState('1st');
  const [selectedSection, setSelectedSection] = useState('A');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scheduleType, setScheduleType] = useState('Weekly Timetable');

  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterSection, setFilterSection] = useState('All Sections');

  useEffect(() => {
    fetchTimetables();
  }, [filterClass, filterSection]);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass !== 'All Classes' && filterClass !== 'All') {
        params.class = filterClass;
      }
      if (filterSection !== 'All Sections' && filterSection !== 'All') {
        params.section = filterSection;
      }

      if (!isAdmin && user?.class) {
        params.class = user.class;
        params.section = user.section;
      }
      const res = await api.get('/timetable', { params });
      setTimetables(res.data.timetables);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('class', selectedClass);
    formData.append('section', selectedSection);
    formData.append('type', scheduleType);
    formData.append('effective_from', effectiveFrom);

    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/timetable', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Timetable uploaded successfully!');
      setFile(null);
      setScheduleType('Weekly Timetable');

      const fileInput = document.getElementById('timetable-file-input');
      if (fileInput) fileInput.value = '';
      fetchTimetables();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Upload failed. Only PDF/Images allowed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (tt) => {
    try {
      const res = await api.get(`/timetable/download/${tt.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', tt.file_name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download timetable.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      setSuccessMsg('Timetable deleted.');
      fetchTimetables();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to delete timetable.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="timetable-page" id="timetable-page">
      <div className="page-header">
        <h2 className="page-title">{isAdmin ? 'Academic Schedule Management' : 'Academic Schedule'}</h2>
        <span className="breadcrumb">Home / Academic Schedule</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}
      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      <div className="timetable-layout">

        {isAdmin && (
          <div className="timetable-upload-card">
            <h3 className="card-title">Upload Timetable</h3>
            <form onSubmit={handleUpload} className="timetable-form">
              <div className="form-group">
                <label>Select Class *</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Select Section *</label>
                <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Schedule Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Timetable, Exam Schedule, etc."
                  value={scheduleType}
                  onChange={e => setScheduleType(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload Timetable (PDF/Image) *</label>
                <input
                  type="file"
                  id="timetable-file-input"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Effective From</label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={e => setEffectiveFrom(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-upload-submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Timetable'}
              </button>
            </form>
          </div>
        )}

        <div className="timetable-list-card">
          <div className="list-header-actions">
            <h3 className="card-title">Uploaded Timetables</h3>
            {isAdmin && (
              <div className="filter-class-wrapper" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Class: </label>
                  <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <option value="All Classes">All Classes</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Section: </label>
                  <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <option value="All Sections">All Sections</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {isAdmin ? (
                    <>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Type</th>
                      <th>Uploaded On</th>
                      <th>Effective From</th>
                      <th>Action</th>
                    </>
                  ) : (
                    <>
                      <th>Sr no.</th>
                      <th>Name</th>
                      <th>Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="table-loading">Loading...</td></tr>
                ) : timetables.length === 0 ? (
                  <tr><td colSpan="6" className="table-empty">No timetables uploaded yet.</td></tr>
                ) : (
                  timetables.map((tt, index) => (
                    <tr key={tt.id}>
                      {isAdmin ? (
                        <>
                          <td>{tt.class}</td>
                          <td>{tt.section}</td>
                          <td>{tt.type}</td>
                          <td>{formatDate(tt.created_at)}</td>
                          <td>{formatDate(tt.effective_from)}</td>
                          <td className="action-cell">
                            <button
                              className="btn-icon view"
                              title="View PDF"
                              onClick={() => window.open(`${import.meta.env.VITE_IMAGE_URL}/uploads/timetables/${tt.file_path}`, '_blank')}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', marginRight: '4px' }}
                            >
                              <FaEye size={18} style={{ color: '#1a237e' }} />
                            </button>
                            <button className="btn-icon download" title="Download" onClick={() => handleDownload(tt)}><MdDownload /></button>
                            {isAdmin && (
                              <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(tt.id)}><MdDelete /></button>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{index + 1}</td>
                          <td>{tt.type || 'Academic Schedule'}</td>
                          <td className="action-cell">
                            <button
                              className="btn-icon view"
                              title="View PDF"
                              onClick={() => window.open(`${import.meta.env.VITE_IMAGE_URL}/uploads/timetables/${tt.file_path}`, '_blank')}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', marginRight: '8px' }}
                            >
                              <FaEye size={20} style={{ color: '#1a237e' }} />
                            </button>
                            <button
                              className="btn-icon download"
                              title="Download"
                              onClick={() => handleDownload(tt)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
                            >
                              <MdDownload size={20} style={{ color: '#2e7d32' }} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
