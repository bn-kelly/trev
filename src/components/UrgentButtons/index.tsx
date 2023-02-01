import React from 'react';
import './style.scss';

type Props = {
  handleInvestorUpdates: (...args: any[]) => any;
  handleFundraisingPitches: (...args: any[]) => any;
  handleWarmIntros: (...args: any[]) => any;
};

function UrgentButtons({
  handleInvestorUpdates,
  handleFundraisingPitches,
  handleWarmIntros,
}: Props) {
  return (
    <div className="urgent-buttons-container">
      <div className='urgent-buttons-row'>
        <button className="urgent-button btn-urgent">what's urgent?</button>
        <button
          className="urgent-button btn-investor"
          onClick={handleInvestorUpdates}
        >
          show investor updates
        </button>
      </div>
      <div className='urgent-buttons-row'>
        <button
          className="urgent-button btn-fundraising"
          onClick={handleFundraisingPitches}
        >
          show fundraising pitches
        </button>
        <button
          className="urgent-button btn-warm"
          onClick={handleWarmIntros}
        >
          warm intros
        </button>
      </div>
    </div>
  );
}

export default UrgentButtons;
