import React from 'react';
import '../Dashboard.css';
// import SettingsIcon from '../assets/images/SettingsIcon.png';
// import SearchIcon from '../assets/images/SearchIcon.png';

const DashboardPage = () => {
    return (
        <div>
            <div>
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
                <div className="header-icons">
                    <button className="new-log-btn">New Log</button>
                    <button className="settings-icon">
                        <i class="fa-solid fa-gear"></i>
                    </button>
                </div>
            </header>
        </div>
        <div className="dashboard-container">
            <main className="dashboard-main">
                <h2 className="welcome-text">Welcome, User</h2>
                <div className="search-bar-container">
                    <input type="text" placeholder="Search..." className="search-bar" />
                    <button className="search-button">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
                <div className="product-list">
                    <button className="product-item">Almond Granola</button>
                    <button className="product-item">Almond Granola</button>
                    <button className="product-item">Almond Granola</button>
                </div>
                <button className="view-all-btn">View All</button>
            </main>
        </div>
        </div>
        
    );
}

export default DashboardPage;