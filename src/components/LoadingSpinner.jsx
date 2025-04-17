// src/components/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css'; // We'll create this CSS file

const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="loading-spinner"></div>
    <p>Loading Bible Data...</p>
  </div>
);

export default LoadingSpinner;