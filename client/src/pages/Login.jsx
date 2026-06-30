import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';
import { FaUser, FaLock } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('Please enter User ID');
      return;
    }
    if (!password) {
      setError('Please enter Password');
      return;
    }

    setLoading(true);
    try {
      await login(userId.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserId('');
    setPassword('');
    setError('');
  };

  return (
    <div className="login-page" id="login-page">
      <div className="login-container">
        {/* Left Panel */}
        <div className="login-left">
          <div className="login-left-content">
            <img src={logo} alt="School Logo" className="login-logo" />
            <h1 className="login-school-name">Smt. Rajeshwari Reddy Scholar Convent, Kodamendhi</h1>
          </div>
          <p className="login-tagline">College Administration System</p>
        </div>

        {/* Right Panel */}
        <div className="login-right">
          <div className="login-form-container">
            <h2 className="login-title">Login</h2>
            <p className="login-subtitle">Please login to your Account</p>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <span className="login-field-icon"><FaUser /></span>
                <input
                  type="text"
                  id="user-id-input"
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="login-field">
                <span className="login-field-icon"><FaLock /></span>
                <input
                  type="password"
                  id="password-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <div className="login-buttons">
                <button type="submit" className="btn-login" id="login-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button type="button" className="btn-reset" id="reset-btn" onClick={handleReset}>
                  Reset
                </button>
              </div>

              <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </a>
            </form>
          </div>

          <p className="login-footer">
            © 2026 Smt. Rajeshwari Reddy Scholar Convent, Kodamendhi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
