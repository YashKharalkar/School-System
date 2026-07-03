import { useState, useEffect } from 'react';
import api from '../services/api';
import { MdPerson, MdDownload, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import './Documents.css';

const CLASSES = ['All Classes', 'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SECTIONS = ['Everyone', 'A', 'B', 'C'];
const GENDERS = ['Everyone', 'Male', 'Female'];
const DOC_TYPES = ['Birth Certificate', 'Aadhar Card', 'Passport Photo', 'Address Proof', 'Medical Certificate', 'Transfer Certificate', 'Marksheet'];

const Documents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filter States
  const [filterName, setFilterName] = useState('');
  const [filterAdmissionNo, setFilterAdmissionNo] = useState('');
  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterSection, setFilterSection] = useState('Everyone');
  const [filterGender, setFilterGender] = useState('Everyone');
  const [hasSearched, setHasSearched] = useState(false);

  // Document Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState(DOC_TYPES[0]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filterClass !== 'All Classes') params.class = filterClass;
      if (filterName) params.name = filterName;
      if (filterAdmissionNo) params.admission_no = filterAdmissionNo;
      if (filterSection !== 'Everyone') params.section = filterSection;
      if (filterGender !== 'Everyone') params.gender = filterGender;

      const res = await api.get('/students', { params });
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setHasSearched(true);
    fetchStudents();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleShow();
  };

  const openDocModal = async (student) => {
    setSelectedStudent(student);
    setShowDocModal(true);
    fetchDocuments(student.id);
  };

  const fetchDocuments = async (studentId) => {
    try {
      const res = await api.get(`/documents/${studentId}`);
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', uploadType);
    setUploading(true);
    try {
      await api.post(`/documents/${selectedStudent.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Document uploaded successfully!');
      fetchDocuments(selectedStudent.id);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleView = (doc) => {
    const fileUrl = `${import.meta.env.VITE_IMAGE_URL}/uploads/documents/${doc.file_path}`;
    window.open(fileUrl, '_blank');
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(`/documents/download/${doc.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed');
    }
  };

  const handleRename = async (doc) => {
    const currentNameWithoutExt = doc.file_name.substring(0, doc.file_name.lastIndexOf('.')) || doc.file_name;
    const ext = doc.file_name.substring(doc.file_name.lastIndexOf('.'));
    const newNameWithoutExt = window.prompt('Enter new file name:', currentNameWithoutExt);
    if (newNameWithoutExt === null) return; // user cancelled
    if (!newNameWithoutExt.trim()) {
      alert('File name cannot be empty');
      return;
    }
    const finalNewName = newNameWithoutExt.trim() + ext;
    try {
      await api.put(`/documents/${doc.id}/rename`, { file_name: finalNewName });
      setSuccessMsg('Document renamed successfully!');
      fetchDocuments(selectedStudent.id);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Rename failed');
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Do you really want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setSuccessMsg('Document deleted.');
      fetchDocuments(selectedStudent.id);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-';

  return (
    <div className="documents-page" id="documents-page">
      <div className="page-header">
        <h2 className="page-title">Student Documents</h2>
        <span className="breadcrumb">Home / Documents</span>
      </div>
      
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* Filters */}
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
          <button className="btn-search" onClick={handleShow}>Show</button>
        </div>
      </div>

      {/* Student List Table */}
      {!hasSearched ? (
        <div className="table-placeholder-card" style={{ marginTop: '16px' }}>
          <p>Please select filters and click "Show" to view student records.</p>
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Admission No.</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="table-loading">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="5" className="table-empty">No students found</td></tr>
              ) : students.map(s => (
                <tr key={s.id}>
                  <td>{s.admission_no}</td>
                  <td>{s.name}</td>
                  <td>{s.class}</td>
                  <td>{s.section || 'A'}</td>
                  <td className="action-cell">
                    <button className="btn-view-docs" onClick={() => openDocModal(s)}>View/Upload Document</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Management Modal */}
      {showDocModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowDocModal(false)}>
          <div className="modal modal-lg" style={{ width: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Documents: {selectedStudent.name} ({selectedStudent.admission_no})</h3>
              <button className="modal-close" onClick={() => setShowDocModal(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '24px', color: '#1565c0' }}><MdPerson /></div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: '#777', fontWeight: '500' }}>Student Details</span>
                    <strong style={{ fontSize: '13px' }}>Class {selectedStudent.class} - Section {selectedStudent.section || 'A'} ({selectedStudent.gender})</strong>
                  </div>
                </div>
                
                {/* Upload Section */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select 
                    value={uploadType} 
                    onChange={e => setUploadType(e.target.value)}
                    style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                  >
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="btn-save" style={{ cursor: 'pointer', padding: '6px 16px', display: 'inline-block', fontSize: '13px', borderRadius: '4px' }}>
                    {uploading ? 'Uploading...' : 'Upload Document'}
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleUpload} hidden />
                  </label>
                </div>
              </div>

              {/* Documents Table */}
              <div className="table-container" style={{ border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#f8f9fa' }}>Document</th>
                      <th style={{ background: '#f8f9fa' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '13px' }}>
                          No documents uploaded yet.
                        </td>
                      </tr>
                    ) : (
                      documents.map(doc => (
                        <tr key={doc.id}>
                          <td style={{ fontWeight: '500', fontSize: '13px' }}>
                            <div style={{ color: '#333' }}>{doc.document_type}</div>
                            <div style={{ fontSize: '11px', color: '#777', marginTop: '2px', fontWeight: 'normal' }}>{doc.file_name}</div>
                          </td>
                          <td>
                            <div className="doc-action-links" style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#1565c0', fontWeight: '500' }}>
                              <span onClick={() => handleView(doc)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MdVisibility style={{ fontSize: '16px' }} /> View
                              </span>
                              <span onClick={() => handleDownload(doc)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MdDownload style={{ fontSize: '16px' }} /> Download
                              </span>
                              <span onClick={() => handleRename(doc)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#e65100' }}>
                                <MdEdit style={{ fontSize: '16px' }} /> Rename
                              </span>
                              <span onClick={() => handleDelete(doc.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#c62828' }}>
                                <MdDelete style={{ fontSize: '16px' }} /> Delete
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDocModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
