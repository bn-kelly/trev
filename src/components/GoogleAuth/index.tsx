import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import './style.scss';

const signUpGoogle = require('./assets/icon_sign_up_google.png') as string;

type Props = {
  handleAuthorization: (...args: any[]) => any;
};

function GoogleAuth({ handleAuthorization }: Props) {
  return (
    <div className="google-auth-modal-container">
      <div className="google-auth--modal">
        <h4 className="google-auth-title">
          You must connect Trev to your Google account for this to work.
        </h4>
        <button
          type="button"
          className="btn-google-auth"
          onClick={handleAuthorization}
        >
          <img
            src={signUpGoogle}
            className="img-google-auth"
            alt="Google Authorization"
          />{' '}
          :
        </button>
      </div>
    </div>
  );
}

export default GoogleAuth;
