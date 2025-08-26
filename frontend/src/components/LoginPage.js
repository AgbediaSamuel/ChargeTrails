import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import '../LoginPage.css'; 
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            navigate('/Dashboard');
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/Dashboard');
        } catch (error) {
            setError(error.message);
            console.error(error);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/Dashboard');
        } catch (error) {
            setError(error.message);
            console.error(error);
        }
    };

    const GoogleIcon = () => (
        <svg width="22" height="22" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.7-37-5.2-54.8H272v103.8h147.4c-6.3 34.1-25.3 63-54 82.4v68h87.2c51-47 80.9-116.2 80.9-199.4z"/>
          <path fill="#34A853" d="M272 544.3c72.9 0 134.1-24.1 178.8-65.5l-87.2-68c-24.2 16.3-55.1 25.8-91.6 25.8-70.5 0-130.2-47.6-151.6-111.4H29.1v69.9C73.5 492.2 167.7 544.3 272 544.3z"/>
          <path fill="#FBBC05" d="M120.4 325.2c-10.7-31.9-10.7-66.5 0-98.4V156.9H29.1c-38.9 77.8-38.9 169.9 0 247.7l91.3-69.4z"/>
          <path fill="#EA4335" d="M272 107.7c39.6-.6 77.8 14.5 106.9 42.6l80.1-80.1C402.6 24.2 339.4-.1 272 0 167.7 0 73.5 52.1 29.1 156.9l91.3 69.9C141.8 163.1 201.5 115.5 272 115.5z"/>
        </svg>
    );

    return (
        <div className="login-container">
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
            </header>
            <main className="login-main">
                <h2 className="login-title">Welcome Back!</h2>
                <form className="login-form" onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        required
                    />
                    <button type="submit" className="signin-btn">Log In</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p className="continue-with-text">or continue with</p>
                <button className="google-signin-btn" onClick={handleGoogleSignIn}>
                    <GoogleIcon />
                </button>
                <p className="signup-link">
                    Don't have an account? <a href="/Register">Sign up</a>
                </p>
            </main>
        </div>
    );
};

export default LoginPage;
