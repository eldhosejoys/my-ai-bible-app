// src/components/ErrorMessage.jsx
import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message }) => (
  <div className="error-container">
    <p className="error-text">⚠️ {message || 'An unexpected error occurred.'}</p>
  </div>
);

export default ErrorMessage;