import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';
import './Header.css';

const Header = () => {
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

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <img src={logo} alt="School Logo" className="header-logo" />
        <span className="header-school-name">Smt. Rajeshwari Reddy Scholar Convent, Kodamendhi</span>
      </div>
      <div className="header-right">
        <span className="header-user">{user?.name || 'Admin User'} ▼</span>
        <span className="header-date">{formatDate(currentTime)}</span>
        <span className="header-time">{formatTime(currentTime)}</span>
      </div>
    </header>
  );
};

export default Header;
