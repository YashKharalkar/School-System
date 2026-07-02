import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MdEdit, MdDelete, MdVisibility, MdPerson } from 'react-icons/md';
import './StudentManagement.css';

const CLASSES = ['All Classes', 'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SECTIONS = ['Everyone', 'A', 'B', 'C'];
const GENDERS = ['Everyone', 'Male', 'Female'];

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter States
  const [filterName, setFilterName] = useState('');
  const [filterAdmissionNo, setFilterAdmissionNo] = useState('');
  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterSection, setFilterSection] = useState('Everyone');
  const [filterGender, setFilterGender] = useState('Everyone');
  const [hasSearched, setHasSearched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '', father_name: '', mother_name: '', dob: '',
    gender: 'Male', parent_mobile: '', address: '', class: '1st', section: 'A'
  });

  useEffect(() => {
    if (hasSearched) {
      fetchStudents();
    }
  }, [page]);

  const fetchStudents = async (overridePage) => {
    setLoading(true);
    try {
      const activePage = overridePage || page;
      const params = { page: activePage, limit: 10 };
      if (filterClass !== 'All Classes') params.class = filterClass;
      if (filterName) params.name = filterName;
      if (filterAdmissionNo) params.admission_no = filterAdmissionNo;
      if (filterSection !== 'Everyone') params.section = filterSection;
      if (filterGender !== 'Everyone') params.gender = filterGender;

      const res = await api.get('/students', { params });
      setStudents(res.data.students);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setHasSearched(true);
    if (page === 1) {
      fetchStudents(1);
    } else {
      setPage(1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleShow();
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setPhotoFile(null);
    setFormData({ name: '', father_name: '', mother_name: '', dob: '', gender: 'Male', parent_mobile: '', address: '', class: '1st', section: 'A' });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setPhotoFile(null);
    setFormData({
      name: student.name, father_name: student.father_name || '', mother_name: student.mother_name || '',
      dob: student.dob ? student.dob.split('T')[0] : '', gender: student.gender || 'Male',
      parent_mobile: student.parent_mobile || '', address: student.address || '',
      class: student.class, section: student.section || 'A'
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (photoFile) {
        submitData.append('photo', photoFile);
      }

      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMsg('Student updated successfully!');
      } else {
        const res = await api.post('/students', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMsg(`Student added! Admission No: ${res.data.student.admission_no}, Login ID: ${res.data.student.login_id}, Password: ${res.data.student.password}`);
      }
      setShowModal(false);
      setPhotoFile(null);
      fetchStudents();
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/students/${id}`);
      setShowDeleteConfirm(null);
      setSuccessMsg('Student deleted successfully!');
      fetchStudents();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="student-mgmt" id="student-management-page">
      <div className="page-header">
        <h2 className="page-title">Student Management</h2>
        <span className="breadcrumb">Home / Students</span>
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
        <button className="btn-add" onClick={openAddModal}>Add Student</button>
      </div>

      {/* Table */}
      {!hasSearched ? (
        <div className="table-placeholder-card">
          <p>Please select filters and click "Show" to view student records.</p>
        </div>
      ) : (
        <div className="table-container">
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
                    <button className="btn-icon view" title="View Details" onClick={() => setViewingStudent(s)}><MdVisibility /></button>
                    <button className="btn-icon edit" title="Edit" onClick={() => openEditModal(s)}><MdEdit /></button>
                    <button className="btn-icon delete" title="Delete" onClick={() => setShowDeleteConfirm(s.id)}><MdDelete /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length > 0 && (
            <div className="table-footer">
              <span className="showing-text">Showing {((page-1)*10)+1} to {Math.min(page*10, total)} of {total} students</span>
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p-1)}>&lt;</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pNum;
                  if (totalPages <= 5) pNum = i + 1;
                  else if (page <= 3) pNum = i + 1;
                  else if (page >= totalPages - 2) pNum = totalPages - 4 + i;
                  else pNum = page - 2 + i;
                  return (
                    <button key={pNum} className={page === pNum ? 'active' : ''} onClick={() => setPage(pNum)}>
                      {pNum}
                    </button>
                  );
                })}
                <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)}>&gt;</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={formData.name} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Father's Name</label>
                  <input name="father_name" value={formData.father_name} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Mother's Name</label>
                  <input name="mother_name" value={formData.mother_name} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleFormChange}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Parent Mobile</label>
                  <input name="parent_mobile" value={formData.parent_mobile} onChange={handleFormChange} maxLength="10" />
                </div>
                <div className="form-group">
                  <label>Class *</label>
                  <select name="class" value={formData.class} onChange={handleFormChange} required>
                    {CLASSES.filter(c => c !== 'All Classes').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select name="section" value={formData.section} onChange={handleFormChange}>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Student Photo</label>
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileChange} />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleFormChange} rows="2"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingStudent ? 'Update' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingStudent && (
        <div className="modal-overlay" onClick={() => setViewingStudent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button className="modal-close" onClick={() => setViewingStudent(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="student-profile-summary" style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                {viewingStudent.photo_path ? (
                  <img src={`http://localhost:5000${viewingStudent.photo_path}`} alt={viewingStudent.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#888' }}><MdPerson /></div>
                )}
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' }}>{viewingStudent.name}</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Admission No: <strong style={{ color: 'var(--text-primary)' }}>{viewingStudent.admission_no}</strong></p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Class: <strong style={{ color: 'var(--text-primary)' }}>{viewingStudent.class} - {viewingStudent.section || 'A'}</strong></p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-light)', fontSize: '11px', fontWeight: '500', marginBottom: '2px' }}>Father's Name</span>
                  <strong>{viewingStudent.father_name || '-'}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-light)', fontSize: '11px', fontWeight: '500', marginBottom: '2px' }}>Mother's Name</span>
                  <strong>{viewingStudent.mother_name || '-'}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-light)', fontSize: '11px', fontWeight: '500', marginBottom: '2px' }}>Date of Birth</span>
                  <strong>{formatDate(viewingStudent.dob)}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-light)', fontSize: '11px', fontWeight: '500', marginBottom: '2px' }}>Gender</span>
                  <strong>{viewingStudent.gender}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-light)', fontSize: '11px', fontWeight: '500', marginBottom: '2px' }}>Parent Mobile</span>
                  <strong>{viewingStudent.parent_mobile || '-'}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-light)', fontSize: '11px', fontWeight: '500', marginBottom: '2px' }}>Login ID</span>
                  <strong>{viewingStudent.login_id || '-'}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ display: 'block', color: 'var(--text-light)', fontSize: '11px', fontWeight: '500', marginBottom: '2px' }}>Address</span>
                  <strong>{viewingStudent.address || '-'}</strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setViewingStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Confirm Delete</h3></div>
            <p style={{ padding: '20px', fontSize: '14px' }}>Do you really want to delete this student?</p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-delete-confirm" onClick={() => handleDelete(showDeleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
