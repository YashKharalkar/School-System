import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Attendance.css';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const Attendance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Admin state
  const [selectedClass, setSelectedClass] = useState('1st');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Student state
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    if (isAdmin) fetchClassAttendance();
    else if (user?.student_id) fetchStudentAttendance();
  }, [selectedClass, selectedDate]);

  const fetchClassAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/class', { params: { class: selectedClass, section: 'A', date: selectedDate } });
      setStudents(res.data.students);
      const map = {};
      res.data.students.forEach(s => { map[s.id] = s.attendance_status || 'Present'; });
      setAttendanceData(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStudentAttendance = async () => {
    try {
      const res = await api.get(`/attendance/student/${user.student_id}`);
      setRecords(res.data.records);
      setSummary(res.data.summary);
    } catch (err) { console.error(err); }
  };

  const updateStatus = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    const records = Object.entries(attendanceData).map(([student_id, status]) => ({ student_id: Number(student_id), status }));
    try {
      await api.post('/attendance/mark', { date: selectedDate, records });
      setSuccessMsg(`Attendance marked for ${records.length} students!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) { alert('Failed to save attendance'); }
  };

  const getSummaryCount = (status) => {
    const item = summary.find(s => s.status === status);
    return item ? item.count : 0;
  };

  if (!isAdmin) {
    const totalDays = records.length;
    const present = getSummaryCount('Present');
    const absent = getSummaryCount('Absent');
    const percentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : 0;

    return (
      <div className="attendance-page" id="attendance-page">
        <div className="page-header"><h2 className="page-title">My Attendance</h2><span className="breadcrumb">Home / Attendance</span></div>
        <div className="att-summary-cards">
          <div className="att-card"><span className="att-card-num">{totalDays}</span><span>Total Days</span></div>
          <div className="att-card green"><span className="att-card-num">{present}</span><span>Present</span></div>
          <div className="att-card red"><span className="att-card-num">{absent}</span><span>Absent</span></div>
          <div className="att-card blue"><span className="att-card-num">{percentage}%</span><span>Attendance</span></div>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {records.length === 0 ? <tr><td colSpan="2" className="table-empty">No attendance records found</td></tr>
                : records.map((r, i) => (
                  <tr key={i}><td>{new Date(r.date).toLocaleDateString('en-GB')}</td>
                    <td><span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span></td></tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-page" id="attendance-page">
      <div className="page-header"><h2 className="page-title">Attendance Management</h2><span className="breadcrumb">Home / Attendance</span></div>
      {successMsg && <div className="success-banner">{successMsg}</div>}
      <div className="att-filters">
        <div className="filter-group"><label>Select Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group"><label>Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <button className="btn-search" onClick={fetchClassAttendance}>Load</button>
        <button className="btn-add" onClick={handleSubmit} style={{ marginLeft: 'auto' }}>Save Attendance</button>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Admission No</th><th>Student Name</th><th>Present</th><th>Absent</th><th>Late</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="table-loading">Loading...</td></tr>
              : students.map(s => (
                <tr key={s.id}>
                  <td>{s.admission_no}</td><td>{s.name}</td>
                  <td><input type="radio" name={`att-${s.id}`} checked={attendanceData[s.id] === 'Present'} onChange={() => updateStatus(s.id, 'Present')} /></td>
                  <td><input type="radio" name={`att-${s.id}`} checked={attendanceData[s.id] === 'Absent'} onChange={() => updateStatus(s.id, 'Absent')} /></td>
                  <td><input type="radio" name={`att-${s.id}`} checked={attendanceData[s.id] === 'Late'} onChange={() => updateStatus(s.id, 'Late')} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
