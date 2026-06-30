import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { FaEye } from 'react-icons/fa';
import { MdDownload, MdDelete } from 'react-icons/md';
import './ExamTimetable.css';

const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const SECTIONS = ['A', 'B', 'C'];

const ExamTimetable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState('1st');
  const [selectedSection, setSelectedSection] = useState('A');
  const [examName, setExamName] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter for list
  const [filterClass, setFilterClass] = useState('All');

  useEffect(() => {
    fetchTimetables();
  }, [filterClass]);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass !== 'All') {
        params.class = filterClass;
      }
      // If student, auto-filter by their class
      if (!isAdmin && user?.class) {
        params.class = user.class;
        params.section = user.section;
      }
      const res = await api.get('/exam-timetable', { params });
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
    if (!examName.trim()) {
      setErrorMsg('Please specify an Exam Name.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('class', selectedClass);
    formData.append('section', selectedSection);
    formData.append('exam_name', examName);
    formData.append('effective_from', effectiveFrom);

    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/exam-timetable', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Exam timetable uploaded successfully!');
      setFile(null);
      setExamName('');
      // Reset file input
      const fileInput = document.getElementById('exam-timetable-file-input');
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
      const res = await api.get(`/exam-timetable/download/${tt.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', tt.file_name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download exam timetable.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam timetable?')) return;
    try {
      await api.delete(`/exam-timetable/${id}`);
      setSuccessMsg('Exam timetable deleted.');
      fetchTimetables();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to delete exam timetable.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="exam-timetable-page" id="exam-timetable-page">
      <div className="page-header">
        <h2 className="page-title">{isAdmin ? 'Exam Management' : 'Exam'}</h2>
        <span className="breadcrumb">Home / Exam</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}
      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      <div className="timetable-layout">
        {/* Left Side: Upload Form (Admin Only) */}
        {isAdmin && (
          <div className="timetable-upload-card">
            <h3 className="card-title">Upload Exam Timetable</h3>
            <form onSubmit={handleUpload} className="timetable-form">
              <div className="form-group">
                <label>Exam Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mid Term Exam, Final Exam"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  required
                />
              </div>

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
                <label>Upload Timetable (PDF/Image) *</label>
                <input
                  type="file"
                  id="exam-timetable-file-input"
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
                {loading ? 'Uploading...' : 'Upload Exam Timetable'}
              </button>
            </form>
          </div>
        )}

        {/* Right Side / Main Area: Timetables List */}
        <div className="timetable-list-card">
          <div className="list-header-actions">
            <h3 className="card-title">Uploaded Exam Timetables</h3>
            {isAdmin && (
              <div className="filter-class-wrapper">
                <label>Filter Class: </label>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                  <option value="All">All Classes</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {isAdmin ? (
                    <>
                      <th>Exam Name</th>
                      <th>Class</th>
                      <th>Section</th>
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
                  <tr><td colSpan={isAdmin ? "6" : "3"} className="table-loading">Loading...</td></tr>
                ) : timetables.length === 0 ? (
                  <tr><td colSpan={isAdmin ? "6" : "3"} className="table-empty">No exam timetables uploaded yet.</td></tr>
                ) : (
                  timetables.map((tt, index) => (
                    <tr key={tt.id}>
                      {isAdmin ? (
                        <>
                          <td>{tt.exam_name}</td>
                          <td>{tt.class}</td>
                          <td>{tt.section}</td>
                          <td>{formatDate(tt.created_at)}</td>
                          <td>{formatDate(tt.effective_from)}</td>
                          <td className="action-cell">
                            <button className="btn-icon download" title="Download" onClick={() => handleDownload(tt)}><MdDownload /></button>
                            {isAdmin && (
                              <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(tt.id)}><MdDelete /></button>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{index + 1}</td>
                          <td>{tt.exam_name || 'Exam Schedule'}</td>
                          <td className="action-cell">
                            <button 
                              className="btn-icon view" 
                              title="View PDF" 
                              onClick={() => window.open(`http://localhost:5000/uploads/exam-timetables/${tt.file_path}`, '_blank')}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
                            >
                              <FaEye size={20} style={{ color: '#1a237e' }} />
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

        {/* Upcoming Exams Card for Student */}
        {!isAdmin && (
          <div className="timetable-list-card" style={{ marginTop: '30px', flex: '1 1 100%' }}>
            <div className="list-header-actions">
              <h3 className="card-title">Upcoming Exams</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>15/07/2026</td>
                    <td>Mathematics</td>
                    <td>09:00 AM - 12:00 PM</td>
                  </tr>
                  <tr>
                    <td>16/07/2026</td>
                    <td>Science</td>
                    <td>09:00 AM - 12:00 PM</td>
                  </tr>
                  <tr>
                    <td>17/07/2026</td>
                    <td>English</td>
                    <td>09:00 AM - 12:00 PM</td>
                  </tr>
                  <tr>
                    <td>20/07/2026</td>
                    <td>Social Studies</td>
                    <td>09:00 AM - 12:00 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamTimetable;
