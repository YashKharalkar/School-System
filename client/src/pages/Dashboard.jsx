import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { 
  MdPeople, MdSms, MdCampaign, MdCalendarMonth, 
  MdPerson, MdPayments, MdDelete, MdAdd, MdClose, MdCheckCircle 
} from 'react-icons/md';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Admin stats states
  const [stats, setStats] = useState({
    totalStudents: 0,
    classSectionCounts: [],
    recentFees: [],
    recentSMS: [],
    recentTimetables: [],
    recentNotices: []
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Task Board states
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskSubmitLoading, setTaskSubmitLoading] = useState(false);

  // Student directory modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [studentModalLoading, setStudentModalLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminStats();
      fetchTasks();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats({
          totalStudents: res.data.totalStudents,
          classSectionCounts: res.data.classSectionCounts,
          recentFees: res.data.recentFees,
          recentSMS: res.data.recentSMS,
          recentTimetables: res.data.recentTimetables,
          recentNotices: res.data.recentNotices
        });
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/dashboard/tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTaskSubmitLoading(true);
    try {
      const res = await api.post('/dashboard/tasks', { title: newTaskTitle.trim() });
      if (res.data.success) {
        setNewTaskTitle('');
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setTaskSubmitLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await api.delete(`/dashboard/tasks/${taskId}`);
      if (res.data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleOpenClassStudentModal = async (className, sectionName) => {
    setSelectedClass(className);
    setSelectedSection(sectionName);
    setShowStudentModal(true);
    setStudentModalLoading(true);
    try {
      const res = await api.get('/students', {
        params: {
          class: className,
          section: sectionName,
          limit: 500
        }
      });
      if (res.data.success) {
        setAllStudents(res.data.students || []);
      }
    } catch (err) {
      console.error('Failed to fetch student list:', err);
    } finally {
      setStudentModalLoading(false);
    }
  };

  const handleCloseStudentModal = () => {
    setShowStudentModal(false);
    setSelectedClass('');
    setSelectedSection('');
    setAllStudents([]);
  };

  const formatSimpleDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  // Student view rendering
  if (user?.role === 'student') {
    const IMAGE_BASE = import.meta.env.VITE_IMAGE_URL;
    const photoUrl = user.photo_path 
      ? `${IMAGE_BASE}${user.photo_path}` 
      : null;

    const studentCards = [
      { title: 'My Timetable' },
      { title: 'My Syllabus' },
      { title: 'My Attendance' },
      { title: 'My Exam' },
      { title: 'My Result' },
      { title: 'Important Updates' }
    ];

    return (
      <div className="student-dashboard" id="student-dashboard-page">
        <div className="page-header">
          <h2 className="page-title">Student Dashboard</h2>
          <span className="breadcrumb">Home / Dashboard</span>
        </div>

        {/* Big Student Info Card */}
        <div className="student-info-card-large">
          <div className="student-info-left">
            <span className="welcome-tag">Welcome Back,</span>
            <h1 className="student-name-title">{user.name}</h1>
            <div className="student-meta-grid">
              <div className="meta-item">
                <span className="meta-label">Class & Section</span>
                <span className="meta-value">Class {user.class} - {user.section}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Admission No.</span>
                <span className="meta-value">{user.admission_no}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Academic Year</span>
                <span className="meta-value">2026-27</span>
              </div>
            </div>
          </div>
          <div className="student-info-right">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={user.name} 
                className="student-dashboard-avatar" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            ) : (
              <div className="student-dashboard-avatar-placeholder"><MdPerson /></div>
            )}
          </div>
        </div>

        {/* Small Cards Grid - styled like admin dashboard cards */}
        <h3 className="section-title-student">Quick Links</h3>
        <div className="student-cards-grid">
          {studentCards.map((card, idx) => (
            <div key={idx} className="dashboard-card student-card-box">
              <h3 className="card-title">{card.title}</h3>
              <div className="student-card-empty-space"></div>
            </div>
          ))}
        </div>

        {/* Quote Section at the bottom */}
        <div className="dashboard-quote-card" style={{ marginTop: '24px' }}>
          <span className="quote-icon">“</span>
          <p className="quote-text">Success is the sum of small efforts repeated every day.</p>
          <span className="quote-author">— Robert Collier</span>
        </div>
      </div>
    );
  }

  // Admin view rendering
  return (
    <div className="dashboard" id="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <span className="breadcrumb">Home / Dashboard</span>
      </div>

      {/* Top Section Grid: Total Students & Class Section Wise Table */}
      <div className="dashboard-top-grid">
        {/* Total Students Card */}
        <div className="stat-card">
          <div className="stat-icon blue"><MdPeople /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalStudents}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>

        {/* Class Section Wise Table */}
        <div className="dashboard-card class-groups-card">
          <div className="card-header-flex">
            <h3 className="card-title">Students Class & Section Wise</h3>
          </div>
          <div className="table-wrapper scrollable-card-body">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Student Count</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.classSectionCounts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">No students registered yet.</td>
                  </tr>
                ) : (
                  stats.classSectionCounts.map((group, index) => (
                    <tr key={index}>
                      <td>Class {group.class}</td>
                      <td>Section {group.section}</td>
                      <td className="count-col">{group.count}</td>
                      <td>
                        <button 
                          className="view-class-list-btn"
                          onClick={() => handleOpenClassStudentModal(group.class, group.section)}
                        >
                          View List
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Middle Grid: Recent Fees & Task Board Info */}
      <div className="dashboard-grid-two">
        {/* Recent Fees Card */}
        <div className="dashboard-card fees-activity-card">
          <h3 className="card-title">Recent Fee Activity</h3>
          <div className="fees-activity-list scrollable-card-body">
            {stats.recentFees.length === 0 ? (
              <div className="empty-widget-state">No recent fee payments logged.</div>
            ) : (
              stats.recentFees.map((pay) => (
                <div key={pay.id} className="fee-activity-item">
                  <div className="fee-icon-container"><MdPayments /></div>
                  <div className="fee-details">
                    <span className="student-name">{pay.name}</span>
                    <span className="student-adm">Adm No: {pay.admission_no}</span>
                  </div>
                  <div className="fee-amount-date">
                    <span className="fee-amount">₹{pay.amount}</span>
                    <span className="fee-date">{formatSimpleDate(pay.payment_date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Board Overview */}
        <div className="dashboard-card taskboard-overview-card">
          <div className="card-header-flex">
            <h3 className="card-title">Admin Task Board</h3>
            <button className="view-tasks-btn" onClick={() => setShowTaskModal(true)}>View</button>
          </div>
          <div className="task-preview-list scrollable-card-body">
            {tasks.length === 0 ? (
              <div className="empty-widget-state">No tasks created. Click 'View' to add one.</div>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="task-preview-item">
                  <span className="task-bullet"></span>
                  <span className="task-title-text">{task.title}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent SMS, Academic Schedules, and Notices */}
      <div className="dashboard-grid-three">
        {/* Recent SMS */}
        <div className="dashboard-card logs-col-card">
          <h3 className="card-title">Recent SMS Logs</h3>
          <div className="logs-list-body">
            {stats.recentSMS.length === 0 ? (
              <div className="empty-widget-state">No SMS logs.</div>
            ) : (
              stats.recentSMS.map((sms) => (
                <div key={sms.id} className="log-item">
                  <div className="log-icon-bar"><MdSms /></div>
                  <div className="log-content">
                    <p className="log-text" title={sms.message}>{sms.message}</p>
                    <span className="log-sub">Sent To: Class {sms.class || 'Everyone'} | {formatSimpleDate(sms.sent_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Academic Schedules */}
        <div className="dashboard-card logs-col-card">
          <h3 className="card-title">Academic Schedule</h3>
          <div className="logs-list-body">
            {stats.recentTimetables.length === 0 ? (
              <div className="empty-widget-state">No timetable uploads.</div>
            ) : (
              stats.recentTimetables.map((t) => (
                <div key={t.id} className="log-item">
                  <div className="log-icon-bar"><MdCalendarMonth /></div>
                  <div className="log-content">
                    <p className="log-text">{t.file_name}</p>
                    <span className="log-sub">Class {t.class} - {t.section} ({t.type}) | {formatSimpleDate(t.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="dashboard-card logs-col-card">
          <h3 className="card-title">Recent Notices</h3>
          <div className="logs-list-body">
            {stats.recentNotices.length === 0 ? (
              <div className="empty-widget-state">No notices found.</div>
            ) : (
              stats.recentNotices.map((n) => (
                <div key={n.id} className="log-item">
                  <div className="log-icon-bar"><MdCampaign /></div>
                  <div className="log-content">
                    <p className="log-text">{n.title}</p>
                    <span className="log-sub">{formatSimpleDate(n.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* STUDENT VIEW MODAL OVERLAY */}
      {showStudentModal && (
        <div className="dashboard-modal-backdrop">
          <div className="dashboard-modal-container large-modal">
            <div className="modal-header">
              <h3>
                {selectedClass && selectedSection 
                  ? `Students in Class ${selectedClass} - ${selectedSection}` 
                  : 'All Registered Students'}
              </h3>
              <button className="close-modal-btn" onClick={handleCloseStudentModal}><MdClose /></button>
            </div>
            <div className="modal-body scrollable-modal-body">
              {studentModalLoading ? (
                <div className="loading-state">Loading students...</div>
              ) : allStudents.length === 0 ? (
                <div className="empty-state">No students found.</div>
              ) : (
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Admission No</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudents.map((st) => (
                      <tr key={st.id}>
                        <td>{st.admission_no}</td>
                        <td><strong>{st.name}</strong></td>
                        <td>{st.class}</td>
                        <td>{st.section}</td>
                        <td>{st.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TASK BOARD MODAL OVERLAY */}
      {showTaskModal && (
        <div className="dashboard-modal-backdrop">
          <div className="dashboard-modal-container">
            <div className="modal-header">
              <h3>Task Board</h3>
              <button className="close-modal-btn" onClick={() => setShowTaskModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddTask} className="add-task-form">
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Create a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
                <button type="submit" className="add-task-btn" disabled={taskSubmitLoading}>
                  <MdAdd />
                </button>
              </form>

              <div className="modal-tasks-list">
                {tasks.length === 0 ? (
                  <div className="empty-state">No tasks created. Add one above!</div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="modal-task-item">
                      <span className="task-bullet"></span>
                      <span className="task-title-text">{task.title}</span>
                      <button className="delete-task-btn" onClick={() => handleDeleteTask(task.id)}>
                        <MdDelete />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
