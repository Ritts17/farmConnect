import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUserInfo } from '../userSlice';
import { toast } from 'react-toastify';
import { userAPI } from '../apiConfig';
import './OwnerNavbar.css';

const OwnerNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userName } = useSelector((state) => state.user);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLivestockDropdown, setShowLivestockDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const livestockDropdownRef = useRef(null);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const displayName = userName || getCookie('userName') || 'User';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (livestockDropdownRef.current && !livestockDropdownRef.current.contains(event.target)) {
        setShowLivestockDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);
    try {
      await userAPI.logout();
      dispatch(clearUserInfo());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(clearUserInfo());
      toast.success('Logged out successfully');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleLivestockDropdown = () => {
    setShowLivestockDropdown(!showLivestockDropdown);
  };

  return (
    <>
      <nav className="owner-nav">
        <div className="nav-brand">
          <Link to="/home">FarmConnect</Link>
        </div>

        <div className="nav-user-info">
          <span className="nav-badge">{displayName} / Owner</span>
        </div>

        <ul className="nav-menu">
          <li><Link to="/home">Home</Link></li>

          <li className="dropdown" ref={livestockDropdownRef}>
            <span
              className="dropdown-trigger"
              onClick={toggleLivestockDropdown}
            >
              <span>Livestock</span> <span>{showLivestockDropdown ? '▲' : '▼'}</span>
            </span>
            {showLivestockDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link
                    to="/owner/add-livestock"
                    onClick={() => setShowLivestockDropdown(false)}
                  >
                    Add Livestock
                  </Link>
                </li>
                <li>
                  <Link
                    to="/owner/view-livestock"
                    onClick={() => setShowLivestockDropdown(false)}
                  >
                    View Livestock
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li><Link to="/owner/view-feeds">Feed</Link></li>
          <li><Link to="/owner/view-medicines">Medicine</Link></li>
          <li><Link to="/owner/my-requests">My Request</Link></li>
          <li><Link to="/owner/feedback">Feedback</Link></li>

          <li>
            <button
              className="logout-button"
              onClick={() => setShowLogoutModal(true)}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerNavbar;