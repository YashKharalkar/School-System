import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  MdDashboard, MdPeople, MdPersonAdd, MdManageAccounts,
  MdDescription, MdSms, MdChecklist, MdCalendarMonth,
  MdAssignment, MdPayments, MdCampaign, MdPerson,
  MdLogout, MdChevronRight, MdExpandMore
} from 'react-icons/md';
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
    { label: 'Dashboard', icon: <MdDashboard />, path: '/dashboard' },
    {
      label: 'Student Management', icon: <MdPeople />, key: 'students',
      children: [
        { label: 'Add Student', path: '/students/add', icon: <MdPersonAdd /> },
        { label: 'View / Manage Students', path: '/students', icon: <MdManageAccounts /> },
      ]
    },
    { label: 'Documents', icon: <MdDescription />, path: '/documents' },
    { label: 'SMS', icon: <MdSms />, path: '/sms' },
    { label: 'Attendance', icon: <MdChecklist />, path: '/attendance' },
    { label: 'Academic Schedule', icon: <MdCalendarMonth />, path: '/timetable' },
    { label: 'Exam', icon: <MdAssignment />, path: '/exam-timetable' },
    { label: 'Fees', icon: <MdPayments />, path: '/fees' },
    { label: 'Notices', icon: <MdCampaign />, path: '/notices' },
    { label: 'Profile', icon: <MdPerson />, path: '/profile' },
  ];

  const studentMenuItems = [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/dashboard' },
    { label: 'Attendance', icon: <MdChecklist />, path: '/attendance' },
    { label: 'Academic Schedule', icon: <MdCalendarMonth />, path: '/timetable' },
    { label: 'Exam', icon: <MdAssignment />, path: '/exam-timetable' },
    { label: 'Fees', icon: <MdPayments />, path: '/fees' },
    { label: 'Notices', icon: <MdCampaign />, path: '/notices' },
    { label: 'Profile', icon: <MdPerson />, path: '/profile' },
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
                  <span className="sidebar-arrow">
                    {expandedMenus[item.key] ? <MdExpandMore /> : <MdChevronRight />}
                  </span>
                </div>
                {expandedMenus[item.key] && (
                  <div className="sidebar-submenu">
                    {item.children.map((child, cIndex) => (
                      <NavLink
                        key={cIndex}
                        to={child.path}
                        className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                      >
                        {child.icon && <span className="sidebar-subicon">{child.icon}</span>}
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
            <span className="sidebar-icon"><MdLogout /></span>
            <span className="sidebar-label">Logout</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
