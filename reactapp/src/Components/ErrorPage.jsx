import React from 'react';
import './ErrorPage.css';

const ErrorPage = () => {
  return (
    <div className="error-page-container">
      <div className="error-content">
        <div className="error-icon">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 20 L180 170 L20 170 Z" fill="#5a5a5a" />
            <text x="100" y="140" fontSize="80" fill="#fff" textAnchor="middle">!</text>
          </svg>
        </div>
        <h1 className="error-heading">Oops! Something Went Wrong</h1>
        <p className="error-message">Please try again later.</p>
      </div>
    </div>
  );
};

export default ErrorPage;