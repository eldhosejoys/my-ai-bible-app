import React from 'react';
import './FloatingNav.css';

const FloatingNav = ({ bookTitle, chapter }) => {
  return (
    <div className="floating-nav">
      <span>{bookTitle}</span>
      <span>അദ്ധ്യായം {chapter}</span>
    </div>
  );
};

export default FloatingNav;
