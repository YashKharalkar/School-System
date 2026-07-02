import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasPendingApplications, setHasPendingApplications] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      const checkPending = async () => {
        try {
          const res = await api.get('/applications');
          if (res.data.success) {
            const hasPending = res.data.applications.some(app => app.status === 'Pending');
            setHasPendingApplications(hasPending);
          }
        } catch (err) {
          console.error('Error checking applications count:', err);
        }
      };

      checkPending();

      window.addEventListener('applicationStatusChanged', checkPending);
      const interval = setInterval(checkPending, 15000);

      return () => {
        window.removeEventListener('applicationStatusChanged', checkPending);
        clearInterval(interval);
      };
    }
  }, [user]);

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const adminMenuItems = [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/dashboard' },
    { label: 'Student Management', icon: <MdPeople />, path: '/students' },
    { label: 'Documents', icon: <MdDescription />, path: '/documents' },
    { label: 'SMS', icon: <MdSms />, path: '/sms' },
    { label: 'Academic Schedule', icon: <MdCalendarMonth />, path: '/timetable' },
    { label: 'Fees', icon: <MdPayments />, path: '/fees' },
    { label: 'Notices', icon: <MdCampaign />, path: '/notices' },
    { label: 'Applications', icon: <MdAssignment />, path: '/applications' },
    { label: 'Profile', icon: <MdPerson />, path: '/profile' },
  ];

  const studentMenuItems = [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/dashboard' },
    { label: 'Academic Schedule', icon: <MdCalendarMonth />, path: '/timetable' },
    { label: 'Fees', icon: <MdPayments />, path: '/fees' },
    { label: 'Notices', icon: <MdCampaign />, path: '/notices' },
    { label: 'Applications', icon: <MdAssignment />, path: '/applications' },
    { label: 'Profile', icon: <MdPerson />, path: '/profile' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <>
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
                <span className="sidebar-icon">
                  {item.icon}
                  {item.label === 'Applications' && hasPendingApplications && (
                    <span className="sidebar-red-dot"></span>
                  )}
                </span>
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

      {showLogoutConfirm && (
        <div className="logout-modal-backdrop">
          <div className="logout-modal-container">
            <div className="logout-modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="logout-modal-body">
              <p>Are you sure you want to log out of your account?</p>
            </div>
            <div className="logout-modal-footer">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-modal-logout" 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
