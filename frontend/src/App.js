import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/Dashboard';
import './App.css';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/Register" element={<RegisterPage />} />
                <Route path="/Login" element={<LoginPage />} />
                <Route path="/Dashboard" element={<DashboardPage />} />
            </Routes>
        </Router>
    );
}

export default App;
