import React from 'react';
import './style.scss';

function Spinner() {
  return (
    <div className="spinner-modal-container">
      <div className="spinner--modal">
        <h4 className="spinner-title">Trev is running to import your emails</h4>
        <div className="loader"></div>
      </div>
    </div>
  );
}

export default Spinner;
