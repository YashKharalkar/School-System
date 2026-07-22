import { useState } from 'react';
import api from '../services/api';
import { MdSearch, MdVisibility, MdPerson, MdClose, MdManageAccounts, MdDescription } from 'react-icons/md';
import { MdOutlineHistoryEdu, MdHistory, MdFileDownload, MdArrowBack } from 'react-icons/md';
import StudentDetailsForm from '../components/StudentDetailsForm';
import './Documents.css';

const CLASSES = ['All Classes', 'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SECTIONS = ['Everyone', 'A', 'B', 'C'];
const GENDERS = ['Everyone', 'Male', 'Female'];

const StudentDetails = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [filterName, setFilterName] = useState('');
  const [filterAdmissionNo, setFilterAdmissionNo] = useState('');
  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterSection, setFilterSection] = useState('Everyone');
  const [filterGender, setFilterGender] = useState('Everyone');

  const [pastMode, setPastMode] = useState(null);
  const [pastYears, setPastYears] = useState([]);
  const [selectedPastYear, setSelectedPastYear] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalDocuments, setModalDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filterClass !== 'All Classes') params.class = filterClass;
      if (filterName) params.name = filterName;
      if (filterAdmissionNo) params.admission_no = filterAdmissionNo;
      if (filterSection !== 'Everyone') params.section = filterSection;
      if (filterGender !== 'Everyone') params.gender = filterGender;

      params.status = 'Active';

      const res = await api.get('/students', { params });
      setStudents(res.data.students);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setPastMode(null);
    setPastYears([]);
    setSelectedPastYear('');
    setHasSearched(true);
    fetchStudents();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleShow();
  };

  const handlePastClick = async (status) => {
    setPastMode(status);
    setSelectedPastYear('');
    setStudents([]);
    setHasSearched(false);
    setLoading(true);
    try {
      const res = await api.get(`/students/past-years/${status}`);
      if (res.data.success) {
        setPastYears(res.data.years || []);
      }
    } catch (err) {
      console.error('Error fetching past academic years:', err);
      setPastYears([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePastYearSelect = async (year) => {
    setSelectedPastYear(year);
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/students/past/${pastMode}/${year}`);
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error('Error fetching past students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = async (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setLoadingDocs(true);
    setModalDocuments([]);
    try {
      const res = await api.get(`/documents/${student.id}`);
      setModalDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Error loading documents inside modal:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <h2 className="page-title">Student Information</h2>
        <span className="breadcrumb">Home / Student Information</span>
      </div>

      <div className="filter-bar">
        <div className="filter-left" style={{ gap: '10px', alignItems: 'flex-end', width: '100%' }}>
          <div className="filter-group">
            <label>Student Name</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="filter-group">
            <label>Admission No.</label>
            <input
              type="text"
              placeholder="Search by admission number..."
              value={filterAdmissionNo}
              onChange={e => setFilterAdmissionNo(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="filter-group">
            <label>Class</label>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Section</label>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)}>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Gender</label>
            <select value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button className="btn-search" onClick={handleShow}>Show</button>

            <button
              type="button"
              className={`btn-search ${pastMode === 'Left' ? 'active' : ''}`}
              style={{ background: pastMode === 'Left' ? '#0d47a1' : '#f1f3f9', color: pastMode === 'Left' ? '#fff' : '#1a237e', border: '1px solid rgba(26, 35, 126, 0.2)' }}
              onClick={() => handlePastClick('Left')}
            >
              Past Left Students
            </button>
            <button
              type="button"
              className={`btn-search ${pastMode === 'Past 10th' ? 'active' : ''}`}
              style={{ background: pastMode === 'Past 10th' ? '#0d47a1' : '#f1f3f9', color: pastMode === 'Past 10th' ? '#fff' : '#1a237e', border: '1px solid rgba(26, 35, 126, 0.2)' }}
              onClick={() => handlePastClick('Past 10th')}
            >
              Past 10th Batch
            </button>
            <button
              type="button"
              className={`btn-search ${pastMode === 'Past 12th' ? 'active' : ''}`}
              style={{ background: pastMode === 'Past 12th' ? '#0d47a1' : '#f1f3f9', color: pastMode === 'Past 12th' ? '#fff' : '#1a237e', border: '1px solid rgba(26, 35, 126, 0.2)' }}
              onClick={() => handlePastClick('Past 12th')}
            >
              Past 12th Batch
            </button>
          </div>
        </div>
      </div>

      {pastMode && (
        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: 'var(--radius)', border: '1px dashed rgba(26, 35, 126, 0.2)', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1a237e', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MdHistory /> Select Academic Year for {pastMode === 'Left' ? 'Past Left Students' : pastMode}:
          </h4>
          {loading && pastYears.length === 0 ? (
            <span style={{ fontSize: '13px', color: '#666' }}>Loading academic years...</span>
          ) : pastYears.length === 0 ? (
            <span style={{ fontSize: '13px', color: '#c62828', fontWeight: '500' }}>No historical records found for this batch type.</span>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {pastYears.map(year => (
                <button
                  key={year}
                  type="button"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid #1a237e',
                    cursor: 'pointer',
                    background: selectedPastYear === year ? '#1a237e' : 'white',
                    color: selectedPastYear === year ? 'white' : '#1a237e',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handlePastYearSelect(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasSearched ? (
        <div className="table-placeholder-card" style={{ marginTop: '16px' }}>
          <p>{pastMode ? 'Please select an academic year from the list above.' : 'Please select filters and click "Show" to search student profiles.'}</p>
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
                <th>Gender</th>
                {pastMode && <th>Leaving Year</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={pastMode ? "7" : "6"} className="table-loading">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={pastMode ? "7" : "6"} className="table-empty">No students found</td></tr>
              ) : students.map(s => (
                <tr key={s.id}>
                  <td>{s.admission_no}</td>
                  <td>{s.name}</td>
                  <td>{s.class}</td>
                  <td>{s.section || 'A'}</td>
                  <td>{s.gender || '-'}</td>
                  {pastMode && <td>{s.status_academic_year || '-'}</td>}
                  <td className="action-cell">
                    <button
                      className="btn-view-docs"
                      onClick={() => openDetailsModal(s)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1565c0', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <MdVisibility /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" style={{ width: '950px', maxWidth: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '24px', color: '#1565c0', display: 'flex', alignItems: 'center' }}><MdManageAccounts /></div>
                <div>
                  <h3 style={{ margin: 0 }}>Student Profile Details</h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>{selectedStudent.name} (Admn: {selectedStudent.admission_no}) {selectedStudent.status !== 'Active' ? `[Status: ${selectedStudent.status}]` : ''}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <StudentDetailsForm
                formData={selectedStudent}
                isEditable={false}
                isAdmin={false}
              />

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1a237e', fontWeight: '600' }}>Student Documents</h4>
                {loadingDocs ? (
                  <p style={{ fontSize: '13px', color: '#666' }}>Loading documents...</p>
                ) : modalDocuments.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#888' }}>No uploaded documents found for this student.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {modalDocuments.map(doc => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          background: '#f8f9fa'
                        }}
                      >
                        <div style={{ fontSize: '28px', color: '#1565c0', display: 'flex' }}><MdDescription /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.document_type}
                          </strong>
                          <span style={{ display: 'block', fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            {doc.file_name}
                          </span>
                        </div>
                        <a
                          href={`${import.meta.env.VITE_IMAGE_URL}/uploads/documents/${doc.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '12px',
                            color: '#1565c0',
                            textDecoration: 'none',
                            fontWeight: '600',
                            border: '1px solid #1565c0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: 'white'
                          }}
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
