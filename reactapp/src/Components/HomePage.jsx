import React from 'react';
import { useSelector } from 'react-redux';
import OwnerNavbar from '../OwnerComponents/OwnerNavbar';
import SupplierNavbar from '../SupplierComponents/SupplierNavbar';
import './HomePage.css';

const HomePage = () => {
  console.log("Home page loaded");
  const userRole = useSelector((state) => state.user.userRole);

  return (
    <div className="homepage-container">
      {userRole === 'Owner' ? <OwnerNavbar /> : <SupplierNavbar />}
      
      <div className="homepage-content">
        <div className="hero-section">
          <img 
            src="/farmconnect.png"
            alt="FarmConnect" 
            className="hero-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="hero-overlay">
            <h1 className="hero-title">FarmConnect</h1>
            <p className="hero-subtitle">
              Success in livestock farming starts with the right connections. FarmConnect bridges the gap between 
              livestock owners and feed sellers, ensuring access to quality feed and resources for healthier, thriving 
              animals.
            </p>
          </div>
        </div>

        <div className="contact-section">
          <h2 className="contact-heading">Contact Us</h2>
          <div className="contact-info">
            <p><strong>Email:</strong> example@example.com</p>
            <p><strong>Phone:</strong> 123-456-7890</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;