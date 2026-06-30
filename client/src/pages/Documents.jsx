import { useState, useEffect } from 'react';
import api from '../services/api';
import './Documents.css';

const CLASSES = ['All Classes', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const DOC_TYPES = ['Birth Certificate', 'Aadhar Card', 'Passport Photo', 'Address Proof', 'Medical Certificate', 'Transfer Certificate', 'Marksheet'];

const Documents = () => {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState(DOC_TYPES[0]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchStudents(); }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      const params = { limit: 100 };
      if (selectedClass !== 'All Classes') params.class = selectedClass;
      const res = await api.get('/students', { params });
      setStudents(res.data.students);
    } catch (err) { console.error(err); }
  };

  const handleSearchStudents = () => {
    if (!searchTerm.trim()) { fetchStudents(); return; }
    api.get('/students', { params: { search: searchTerm, limit: 100 } })
      .then(res => setStudents(res.data.students)).catch(console.error);
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(`/documents/${student.id}`);
      setDocuments(res.data.documents);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', uploadType);
    setUploading(true);
    try {
      await api.post(`/documents/${selectedStudent.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccessMsg('Document uploaded successfully!');
      selectStudent(selectedStudent);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { alert(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(`/documents/download/${doc.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = doc.file_name; a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { alert('Download failed'); }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      selectStudent(selectedStudent);
      setSuccessMsg('Document deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { alert('Delete failed'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-';

  return (
    <div className="documents-page" id="documents-page">
      <div className="page-header">
        <h2 className="page-title">Student Documents</h2>
        <span className="breadcrumb">Home / Documents</span>
      </div>
      {successMsg && <div className="success-banner">{successMsg}</div>}
      <div className="documents-layout">
        {/* Left: Student List */}
        <div className="doc-left">
          <div className="doc-search-bar">
            <input placeholder="Search by name or admission no." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearchStudents()} />
            <button className="btn-search" onClick={handleSearchStudents}>Search</button>
          </div>
          <div className="doc-class-filter">
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="student-list">
            <h4>Student List</h4>
            {students.map(s => (
              <div key={s.id} className={`student-list-item ${selectedStudent?.id === s.id ? 'active' : ''}`}
                onClick={() => selectStudent(s)}>
                <span className="sl-name">{s.name}</span>
                <span className="sl-info">({s.admission_no}) - Class {s.class}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Documents */}
        <div className="doc-right">
          {selectedStudent ? (
            <>
              <div className="doc-student-header">
                <div className="doc-student-avatar">👤</div>
                <div className="doc-student-info">
                  <h3>{selectedStudent.name} ({selectedStudent.admission_no}) - Class {selectedStudent.class}</h3>
                  <p>Date of Birth: {formatDate(selectedStudent.dob)} &nbsp; Gender: {selectedStudent.gender}</p>
                </div>
                <div className="doc-upload-area">
                  <select value={uploadType} onChange={e => setUploadType(e.target.value)}>
                    {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <label className="btn-upload">
                    {uploading ? 'Uploading...' : 'Upload Document'}
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleUpload} hidden />
                  </label>
                </div>
              </div>
              <table>
                <thead>
                  <tr><th>Document Type</th><th>File Name</th><th>Upload Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No documents uploaded</td></tr>
                  ) : documents.map(doc => (
                    <tr key={doc.id}>
                      <td>{doc.document_type}</td>
                      <td>{doc.file_name}</td>
                      <td>{formatDate(doc.created_at)}</td>
                      <td className="action-cell">
                        <button className="btn-icon" title="Download" onClick={() => handleDownload(doc)}>⬇️</button>
                        <button className="btn-icon" title="Print" onClick={() => handleDownload(doc)}>🖨️</button>
                        <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(doc.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="doc-placeholder">
              <p>Select a student from the list to view documents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
