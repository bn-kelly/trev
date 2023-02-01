import React from 'react';
import './style.scss';

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner-title">
        Hi! I'm analyzing emails, please check back in a few minutes...
      </div>
      <div className="spinner"></div>
    </div>
  );
}

export default Spinner;
