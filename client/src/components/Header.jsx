import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';
import { MdMenu, MdClose } from 'react-icons/md';
import './Header.css';

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const loginTitle = user?.role === 'admin' ? 'ADMIN LOGIN' : 'STUDENT LOGIN';

  return (
    <header className="header-wrapper" id="main-header">
      <div className="header-top">
        <div className="header-left">
          <button
            className="mobile-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <MdClose /> : <MdMenu />}
          </button>
          <img src={logo} alt="School Logo" className="header-logo" />
          <span className="header-school-name">Smt. Rajeshwari Reddy Scholar Convent, Kodamendhi</span>
        </div>
        <div className="header-right">
          <span className="header-user">{user?.name || 'User'} ▼</span>
          <span className="header-date">{formatDate(currentTime)}</span>
          <span className="header-time">{formatTime(currentTime)}</span>
        </div>
      </div>
      <div className="header-sub-banner">
        <span className="header-sub-title">{loginTitle}</span>
      </div>
    </header>
  );
};

export default Header;
