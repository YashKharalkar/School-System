import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const chartRef = useRef(null);
  const [stats, setStats] = useState({ total: 0, byClass: [] });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (stats.byClass.length > 0 && chartRef.current) {
      drawChart();
    }
  }, [stats]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/students/stats');
      setStats({ total: res.data.total, byClass: res.data.byClass });
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const drawChart = () => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = stats.byClass;
    if (data.length === 0) return;

    const W = canvas.width;
    const H = canvas.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    const maxVal = Math.max(...data.map(d => d.count), 1);
    const barWidth = chartW / data.length * 0.6;
    const gap = chartW / data.length * 0.4;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.font = '10px Roboto';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 5) * i), padding.left - 6, y + 4);
    }

    // Bars
    data.forEach((item, i) => {
      const x = padding.left + (chartW / data.length) * i + gap / 2;
      const barH = (item.count / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      // Bar gradient
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, '#3949ab');
      grad.addColorStop(1, '#1a237e');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);

      // Label
      ctx.fillStyle = '#555';
      ctx.font = '10px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText(item.class, x + barWidth / 2, H - padding.bottom + 16);

      // Value on top
      ctx.fillStyle = '#333';
      ctx.font = '10px Roboto';
      ctx.fillText(item.count, x + barWidth / 2, y - 5);
    });
  };

  const recentActivities = [
    { text: 'Document uploaded for Aarav Sharma (Class 6)', time: '05/03/2026 09:15 AM', color: '#1565c0' },
    { text: 'SMS sent to 16 students', time: '04/03/2026 02:30 PM', color: '#2e7d32' },
    { text: 'New student Diya Patel added in Class 3', time: '07/02/2026 10:45 AM', color: '#ef6c00' },
    { text: 'Timetable uploaded for Class 8', time: '27/01/2026 11:30 AM', color: '#c62828' },
  ];

  const upcomingEvents = [
    { name: 'Unit Test - 1 (Class 6 to 10)', date: '05-Jul-2026' },
    { name: 'PTA Meeting', date: '10-Jul-2026' },
    { name: 'Half Yearly Exams', date: '20-Jul-2026' },
  ];

  const recentNotices = [
    { title: 'School reopens on 1st July', date: '27/06/2026' },
    { title: 'Sports Day on 15th July', date: '26/06/2026' },
    { title: 'Submission of documents is mandatory', date: '25/06/2026' },
  ];

  if (user?.role === 'student') {
    const IMAGE_BASE = 'http://localhost:5000';
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
              <div className="student-dashboard-avatar-placeholder">👤</div>
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

  return (
    <div className="dashboard" id="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <span className="breadcrumb">Home / Dashboard</span>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <span className="stat-number">{stats.total || 162}</span>
            <span className="stat-label">Total Students</span>
          </div>
          <a className="stat-link">View Details</a>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📄</div>
          <div className="stat-info">
            <span className="stat-number">248</span>
            <span className="stat-label">Total Documents</span>
          </div>
          <a className="stat-link">View Details</a>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💬</div>
          <div className="stat-info">
            <span className="stat-number">124</span>
            <span className="stat-label">SMS Sent</span>
          </div>
          <a className="stat-link">View Details</a>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">📢</div>
          <div className="stat-info">
            <span className="stat-number">12</span>
            <span className="stat-label">Notices</span>
          </div>
          <a className="stat-link">View Details</a>
        </div>
      </div>

      {/* Middle Section */}
      <div className="dashboard-grid">
        <div className="dashboard-card chart-card">
          <h3 className="card-title">Students by Class</h3>
          <canvas ref={chartRef} width={500} height={250} className="chart-canvas"></canvas>
        </div>
        <div className="dashboard-card activities-card">
          <h3 className="card-title">Recent Activities</h3>
          <div className="activities-list">
            {recentActivities.map((a, i) => (
              <div key={i} className="activity-item">
                <span className="activity-dot" style={{ background: a.color }}></span>
                <div className="activity-content">
                  <p className="activity-text">{a.text}</p>
                  <span className="activity-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="card-title">Upcoming Events / Exams</h3>
          <table className="events-table">
            <tbody>
              {upcomingEvents.map((e, i) => (
                <tr key={i}>
                  <td>
                    <span className="event-icon">📅</span>
                    <span className="event-name">{e.name}</span>
                  </td>
                  <td className="event-date">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="dashboard-card">
          <h3 className="card-title">Notices</h3>
          <div className="notices-list">
            {recentNotices.map((n, i) => (
              <div key={i} className="notice-item">
                <span className="notice-dot"></span>
                <span className="notice-title">{n.title}</span>
                <span className="notice-date">{n.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
