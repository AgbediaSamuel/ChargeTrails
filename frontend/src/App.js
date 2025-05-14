import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/Dashboard';
import NewLog from './components/NewLog';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import TestSearch from './components/testSearch';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <ProductProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/testSearch" element={
                            <ProtectedRoute>
                                <TestSearch />
                            </ProtectedRoute>
                        } />
                        <Route path="/Register" element={<RegisterPage />} />
                        <Route path="/Login" element={<LoginPage />} />
                        <Route path="/Dashboard" element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/NewLog" element={
                            <ProtectedRoute>
                                <NewLog />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Router>
            </ProductProvider>
        </AuthProvider>
    );
}

export default App;
