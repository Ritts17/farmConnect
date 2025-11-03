import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { userAPI } from '../apiConfig';
import { setUserInfo } from '../userSlice';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Attempting login...');
      const response = await userAPI.login(formData);
      
      console.log('🔵 Login response:', response);
      console.log('🔵 Response data:', response.data);

      if (response.data) {
        const { userId, userName, role, message, token } = response.data;

        console.log('🔵 Extracted values:', { userId, userName, role, message, token });

        // Check for error messages
        if (message === "Invalid credentials" || message === "User not found") {
          console.log('🔴 Login failed:', message);
          toast.error(message);
          setLoading(false);
          return;
        }

        // Check if we have all required data
        if (!userId || !userName || !role) {
          console.log('🔴 Missing required data:', { userId, userName, role });
          toast.error('Login failed. Please try again.');
          setLoading(false);
          return;
        }

        console.log('🟢 Login successful, dispatching to Redux...');
        
        // Dispatch to Redux
        dispatch(setUserInfo({
          userId: userId,
          userName: userName,
          userRole: role,
        }));

        console.log('🟢 Redux dispatched');

        // Check cookies
        console.log('🟢 Checking cookies...');
        console.log('Token cookie:', document.cookie.includes('token='));
        console.log('UserId cookie:', document.cookie.includes('userId='));
        console.log('UserRole cookie:', document.cookie.includes('userRole='));
        console.log('All cookies:', document.cookie);

        toast.success('Login successful!');

        // Navigate based on role
        console.log('🟢 Navigating to /home for role:', role);
        
        // Use setTimeout to ensure cookies and Redux are fully set
        setTimeout(() => {
          console.log('🟢 Executing navigation...');
          navigate('/home', { replace: true });
        }, 100);

      } else {
        console.log('🔴 No response data received');
        toast.error('Login failed. No data received from server.');
      }
    } catch (error) {
      console.error('🔴 Login error:', error);
      console.error('🔴 Error response:', error.response);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <h1 className="brand-title">FarmConnect</h1>
          <p className="brand-subtitle">Connecting Livestock Owners with Feed Sellers</p>
        </div>

        <div className="login-right">
          <h2 className="login-heading">Login</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error-input' : ''}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error-input' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Signup</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;