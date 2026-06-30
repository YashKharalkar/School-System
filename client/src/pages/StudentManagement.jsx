import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './StudentManagement.css';

const CLASSES = ['All Classes', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '', father_name: '', mother_name: '', dob: '',
    gender: 'Male', parent_mobile: '', address: '', class: '1st', section: 'A'
  });

  useEffect(() => {
    fetchStudents();
  }, [page, selectedClass]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (selectedClass !== 'All Classes') params.class = selectedClass;
      if (searchTerm) params.search = searchTerm;
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

  const handleSearch = () => {
    setPage(1);
    fetchStudents();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
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
            <label>Select Class</label>
            <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name or admission no."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button className="btn-search" onClick={handleSearch}>Search</button>
        </div>
        <button className="btn-add" onClick={openAddModal}>Add Student</button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Admission No.</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-loading">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No students found</td></tr>
            ) : students.map(s => (
              <tr key={s.id}>
                <td>{s.admission_no}</td>
                <td>{s.name}</td>
                <td>{s.class}</td>
                <td>{s.gender}</td>
                <td>{formatDate(s.dob)}</td>
                <td className="action-cell">
                  <button className="btn-icon edit" title="Edit" onClick={() => openEditModal(s)}>✏️</button>
                  <button className="btn-icon delete" title="Delete" onClick={() => setShowDeleteConfirm(s.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      </div>

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
                    <option>Other</option>
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

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Confirm Delete</h3></div>
            <p style={{ padding: '20px', fontSize: '14px' }}>Are you sure you want to delete this student? This action cannot be undone.</p>
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
