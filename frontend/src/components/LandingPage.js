import React from 'react';
import { Link } from 'react-router-dom';
import '../LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
            </header>
            <main className="main-content">
                <h2 className="welcome-text">Welcome to ChargeTrails</h2>
                <div className="button-group">
                    <Link to="/register" className="btn signup-btn">SIGN UP</Link>
                    <Link to="/login" className="btn login-btn">LOGIN</Link>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
