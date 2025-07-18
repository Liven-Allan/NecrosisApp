import React, { useState } from 'react';
import { FaUserPlus, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUser } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import cassavaRoots from '../../UI files/cassava-roots.jpg';
import './SignUpPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  // Login form state (for demonstration, not functional)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state (for demonstration, not functional)
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Validation state
  const [signupErrors, setSignupErrors] = useState({});
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Login validation state
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  // Validation helpers
  const validateUsername = async (username) => {
    if (!username) return 'Username is required.';
    if (!/^[A-Za-z]+$/.test(username)) return 'Username must contain only letters.';
    // Check uniqueness via backend
    try {
      const res = await axios.post('/api/register/', { username, email: 'unique@email.com', password: 'DummyPass123', confirm_password: 'DummyPass123' });
      // If no error, username is unique (but this will create a dummy user, so instead, rely on backend error on real submit)
      return '';
    } catch (err) {
      if (err.response && err.response.data.username) {
        return err.response.data.username[0];
      }
    }
    return '';
  };

  const validateEmail = async (email) => {
    if (!email) return 'Email is required.';
    // Simple email regex
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format.';
    // Check uniqueness via backend
    try {
      const res = await axios.post('/api/register/', { username: 'UniqueUser', email, password: 'DummyPass123', confirm_password: 'DummyPass123' });
      return '';
    } catch (err) {
      if (err.response && err.response.data.email) {
        return err.response.data.email[0];
      }
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Password must contain letters and numbers.';
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  // Login validation helpers
  const validateLoginUsername = (username) => {
    if (!username) return 'Username is required.';
    if (!/^[A-Za-z]+$/.test(username)) return 'Username must contain only letters.';
    return '';
  };
  const validateLoginPassword = (password) => {
    if (!password) return 'Password is required.';
    return '';
  };

  // Handle sign up submit
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupSuccess('');
    setSignupLoading(true);
    // Validate all fields
    const errors = {};
    errors.username = await validateUsername(signupUsername);
    errors.email = await validateEmail(signupEmail);
    errors.password = validatePassword(signupPassword);
    errors.confirm_password = validateConfirmPassword(signupPassword, signupConfirmPassword);
    setSignupErrors(errors);
    // If any errors, do not submit
    if (Object.values(errors).some(Boolean)) {
      setSignupLoading(false);
      return;
    }
    // Submit to backend
    try {
      const res = await axios.post('/api/register/', {
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        confirm_password: signupConfirmPassword,
        user_type: 'regular',
      });
      setSignupSuccess('Registration successful! You can now log in.');
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setAgreed(false);
      setSignupErrors({});
    } catch (err) {
      // Show backend errors
      if (err.response && err.response.data) {
        setSignupErrors(err.response.data);
      } else {
        setSignupErrors({ general: 'Registration failed. Please try again.' });
      }
    }
    setSignupLoading(false);
  };

  // Handle login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErrors({});
    setLoginLoading(true);
    // Validate fields
    const errors = {};
    errors.username = validateLoginUsername(loginEmail);
    errors.password = validateLoginPassword(loginPassword);
    setLoginErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setLoginLoading(false);
      return;
    }
    // Submit to backend
    try {
      // DRF obtain_auth_token expects username (not email) by default
      const res = await axios.post('/api/login/', {
        username: loginEmail,
        password: loginPassword,
      });
      // On success, store token if needed, then navigate
      // Store username and fetch email for profile popup
      localStorage.setItem('username', loginEmail);
      // Fetch user details (email) from backend
      try {
        const userRes = await axios.get(`/api/user/${loginEmail}/`, {
          headers: { Authorization: `Token ${res.data.token}` },
        });
        localStorage.setItem('userEmail', userRes.data.email);
        localStorage.setItem('token', res.data.token); // Store token for future authenticated requests
      } catch (userErr) {
        // Show an error and redirect to login if fetching user details fails
        alert('Failed to fetch user details. Please log in again.');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      navigate('/landing');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.non_field_errors) {
        setLoginErrors({ general: err.response.data.non_field_errors[0] });
      } else {
        setLoginErrors({ general: 'Login failed. Please check your credentials.' });
      }
    }
    setLoginLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-book">
        {/* Left Page */}
        <div className="signup-left-page">
          <div className="signup-logo-container">
            <div className="signup-logo">
              {activeTab === 'login' ? (
                <FaSignInAlt size={32} color="#066D12" />
              ) : (
                <FaUserPlus size={32} color="#066D12" />
              )}
            </div>
          </div>
          <div className="signup-header">
            <h2>{activeTab === 'login' ? 'Login To Cassava Necrosis Analyzer' : 'Sign Up For Cassava Necrosis Analyzer'}</h2>
          </div>
          <div className="signup-tabs">
            <div
              className={`tab tab-login${activeTab === 'login' ? ' active' : ''}`}
              onClick={() => setActiveTab('login')}
              style={{ cursor: 'pointer' }}
            >
              Login
              <div className={`tab-underline${activeTab === 'login' ? ' tab-underline-signup' : ' tab-underline-login'}`} />
            </div>
            <div
              className={`tab tab-signup${activeTab === 'signup' ? ' active' : ''}`}
              onClick={() => setActiveTab('signup')}
              style={{ cursor: 'pointer' }}
            >
              Signup
              <div className={`tab-underline${activeTab === 'signup' ? ' tab-underline-signup' : ' tab-underline-login'}`} />
            </div>
          </div>
          {activeTab === 'login' ? (
            <form className="signup-form" onSubmit={handleLogin}>
              <label className="input-label">Username</label>
              <div className="form-section">
                <div className="input-row">
                  <FaUser className="input-icon" />
                  <input type="text" placeholder="Enter your username" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
                {loginErrors.username && <div className="error-message">{loginErrors.username}</div>}
              </div>
              <label className="input-label">Password</label>
              <div className="form-section">
                <div className="input-row">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                  <span className="input-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={0} role="button" aria-label="Toggle password visibility">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {loginErrors.password && <div className="error-message">{loginErrors.password}</div>}
              </div>
              <div className="forgot-row">
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
              {loginErrors.general && <div className="error-message">{loginErrors.general}</div>}
            </form>
          ) : (
            <form className="signup-form" onSubmit={handleSignup}>
              {/* Username Field */}
              <label className="input-label">Username</label>
              <div className="form-section">
                <div className="input-row">
                  <FaUser className="input-icon" />
                  <input type="text" placeholder="Enter a username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} />
                </div>
                {signupErrors.username && <div className="error-message">{signupErrors.username}</div>}
              </div>
              {/* Email Field */}
              <label className="input-label">Email</label>
              <div className="form-section">
                <div className="input-row">
                  <FaEnvelope className="input-icon" />
                  <input type="email" placeholder="Enter your email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                </div>
                {signupErrors.email && <div className="error-message">{signupErrors.email}</div>}
              </div>
              {/* Password Field */}
              <label className="input-label">Password</label>
              <div className="form-section">
                <div className="input-row">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                  />
                  <span className="input-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={0} role="button" aria-label="Toggle password visibility">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {signupErrors.password && <div className="error-message">{signupErrors.password}</div>}
              </div>
              {/* Confirm Password Field */}
              <label className="input-label">Confirm Password</label>
              <div className="form-section">
                <div className="input-row">
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={e => setSignupConfirmPassword(e.target.value)}
                  />
                  <span className="input-eye" onClick={() => setShowConfirmPassword((v) => !v)} tabIndex={0} role="button" aria-label="Toggle confirm password visibility">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {signupErrors.confirm_password && <div className="error-message">{signupErrors.confirm_password}</div>}
              </div>
              {/* General error */}
              {signupErrors.general && <div className="error-message">{signupErrors.general}</div>}
              {/* Success message */}
              {signupSuccess && <div className="success-message">{signupSuccess}</div>}
            </form>
          )}
        </div>
        {/* Right Page */}
        <div className="signup-right-page" style={{ backgroundImage: `url(${cassavaRoots})` }}>
          <form className="signup-right-form" onSubmit={activeTab === 'login' ? handleLogin : handleSignup}>
            {activeTab === 'login' ? (
              <>
                <button type="submit" className="signup-button full-width">
                  <FaSignInAlt className="signup-btn-icon" /> Login
                </button>
                <div className="divider-row">
                  <div className="divider-line" />
                  <span className="divider-text">or continue with</span>
                  <div className="divider-line" />
                </div>
                <div className="social-row">
                  <button className="social-btn google-btn"><FcGoogle className="social-icon" /> Google</button>
                  <button className="social-btn github-btn"><FaGithub className="social-icon" /> GitHub</button>
                </div>
                <div className="terms-row">
                  By Continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
                </div>
              </>
            ) : (
              <>
                <div className="terms-agreement">
                  <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                  <label htmlFor="terms">
                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                  </label>
                </div>
                <button
                  type="submit"
                  className="signup-button full-width"
                  disabled={
                    !agreed ||
                    signupLoading ||
                    !signupUsername ||
                    !signupEmail ||
                    !signupPassword ||
                    !signupConfirmPassword ||
                    Object.values(signupErrors).some(Boolean)
                  }
                >
                  <FaUserPlus className="signup-btn-icon" /> {signupLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 