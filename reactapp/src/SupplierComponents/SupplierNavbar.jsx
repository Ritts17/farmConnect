import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUserInfo } from '../userSlice';
import { toast } from 'react-toastify';
import { userAPI } from '../apiConfig';
import './SupplierNavbar.css';

const SupplierNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userName } = useSelector((state) => state.user);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFeedDropdown, setShowFeedDropdown] = useState(false);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const feedDropdownRef = useRef(null);
  const medicineDropdownRef = useRef(null);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const displayName = userName || getCookie('userName') || 'User';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (feedDropdownRef.current && !feedDropdownRef.current.contains(event.target)) {
        setShowFeedDropdown(false);
      }
      if (medicineDropdownRef.current && !medicineDropdownRef.current.contains(event.target)) {
        setShowMedicineDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

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

  const toggleFeedDropdown = () => {
    setShowFeedDropdown(!showFeedDropdown);
    setShowMedicineDropdown(false);
  };

  const toggleMedicineDropdown = () => {
    setShowMedicineDropdown(!showMedicineDropdown);
    setShowFeedDropdown(false);
  };

  return (
    <>
      <nav className="supplier-nav">
        <div className="nav-brand">
          <Link to="/home">FarmConnect</Link>
        </div>

        <div className="nav-user-info">
          <span className="nav-badge">{displayName} / Supplier</span>
        </div>

        <ul className="nav-menu">
          <li><Link to="/home">Home</Link></li>

          <li className="dropdown" ref={feedDropdownRef}>
            <span
              className="dropdown-trigger"
              onClick={toggleFeedDropdown}
            >
              <span>Feed</span> <span>{showFeedDropdown ? '▲' : '▼'}</span>
            </span>
            {showFeedDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link
                    to="/supplier/add-feed"
                    onClick={() => setShowFeedDropdown(false)}
                  >
                    Add Feed
                  </Link>
                </li>
                <li>
                  <Link
                    to="/supplier/view-feeds"
                    onClick={() => setShowFeedDropdown(false)}
                  >
                    View Feed
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="dropdown" ref={medicineDropdownRef}>
            <span
              className="dropdown-trigger"
              onClick={toggleMedicineDropdown}
            >
              <span>Medicine</span> <span>{showMedicineDropdown ? '▲' : '▼'}</span>
            </span>
            {showMedicineDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link
                    to="/supplier/add-medicine"
                    onClick={() => setShowMedicineDropdown(false)}
                  >
                    Add Medicine
                  </Link>
                </li>
                <li>
                  <Link
                    to="/supplier/view-medicines"
                    onClick={() => setShowMedicineDropdown(false)}
                  >
                    View Medicine
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li><Link to="/supplier/view-requests">View Requests</Link></li>
          <li><Link to="/supplier/feedback">Feedback</Link></li>

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

export default SupplierNavbar;