import React from 'react';
import { Link } from 'react-router-dom';
import '../LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-root">
            <div className="landing-hero">
                <header className="landing-header">
                    <h1 className="brand">CHARGETRAILS</h1>
                    <nav className="nav">
                        <Link to="/login" className="btn btn-primary">Login</Link>
                        <Link to="/register" className="btn btn-accent">Sign Up</Link>
                    </nav>
                </header>
                <div className="landing-content">
                    <h2 className="headline">Your receipts. Organized. Searchable. Insightful.</h2>
                    <p className="subhead">Track purchases across cities and time. Extract products, compare prices, and find the best places to buy.</p>
                    <div className="cta">
                        <Link to="/register" className="btn btn-primary">Get Started</Link>
                        <Link to="/login" className="btn">I already have an account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
