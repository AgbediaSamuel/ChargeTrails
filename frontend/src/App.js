import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import './App.css';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/Register" element={<RegisterPage />} />
                <Route path="/Login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
}

export default App;
