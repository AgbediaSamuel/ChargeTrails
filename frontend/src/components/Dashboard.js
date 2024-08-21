import React from 'react';
import '../Dashboard.css';
import SettingsIcon from '../assets/images/SettingsIcon.png';

const DashboardPage = () => {
    return (
        <div className="dashboard-container">
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
                <img src={SettingsIcon} alt="Settings" className="settings-icon" />
            </header>
            <main className="dashboard-main">
                <h2 className="welcome-text">Welcome, User</h2>
                <div className="button-group">
                    <button className="btn log-product-btn">LOG NEW PRODUCT</button>
                    <button className="btn saved-products-btn">SAVED PRODUCTS</button>
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;
