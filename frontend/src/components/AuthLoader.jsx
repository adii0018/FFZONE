import React from 'react';
import './AuthLoader.css';

/**
 * Full-screen overlay loader shown during login / register / logout.
 * Uses the banter-loader animation (9 animated boxes).
 */
const AuthLoader = ({ message = 'Authenticating...' }) => {
  return (
    <div className="auth-loader-overlay">
      <div className="auth-loader-inner">
        {/* Banter boxes */}
        <div className="banter-loader">
          <div className="banter-loader__box" />
          <div className="banter-loader__box" />
          <div className="banter-loader__box" />
          <div className="banter-loader__box" />
          <div className="banter-loader__box" />
          <div className="banter-loader__box" />
          <div className="banter-loader__box" />
          <div className="banter-loader__box" />
          <div className="banter-loader__box" />
        </div>

        {/* Message below */}
        <p className="auth-loader-msg">{message}</p>
      </div>
    </div>
  );
};

export default AuthLoader;
