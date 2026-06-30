import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    {
      label: 'Student Management', icon: '👥', key: 'students',
      children: [
        { label: 'Add Student', path: '/students/add' },
        { label: 'View / Manage Students', path: '/students' },
      ]
    },
    { label: 'Documents', icon: '📄', path: '/documents' },
    { label: 'SMS', icon: '💬', path: '/sms' },
    { label: 'Attendance', icon: '📋', path: '/attendance' },
    { label: 'Timetable', icon: '📅', path: '/timetable' },
    { label: 'Exam Timetable', icon: '📝', path: '/exam-timetable' },
    { label: 'Fee Management', icon: '💰', path: '/fees' },
    { label: 'Notices', icon: '📢', path: '/notices' },
    { label: 'Profile', icon: '👤', path: '/profile' },
  ];

  const studentMenuItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: 'Attendance', icon: '📋', path: '/attendance' },
    { label: 'Timetable', icon: '📅', path: '/timetable' },
    { label: 'Exam Timetable', icon: '📝', path: '/exam-timetable' },
    { label: 'Fee Structure', icon: '💰', path: '/fees' },
    { label: 'Notices', icon: '📢', path: '/notices' },
    { label: 'Profile', icon: '👤', path: '/profile' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <aside className="sidebar" id="main-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index} className="sidebar-item-wrapper">
            {item.children ? (
              <>
                <div
                  className={`sidebar-item has-children ${expandedMenus[item.key] ? 'expanded' : ''}`}
                  onClick={() => toggleMenu(item.key)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                  <span className="sidebar-arrow">{expandedMenus[item.key] ? '▾' : '▸'}</span>
                </div>
                {expandedMenus[item.key] && (
                  <div className="sidebar-submenu">
                    {item.children.map((child, cIndex) => (
                      <NavLink
                        key={cIndex}
                        to={child.path}
                        className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                      >
                        <span className="sidebar-sublabel">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
        <div className="sidebar-item-wrapper">
          <div className="sidebar-item" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            <span className="sidebar-label">Logout</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
