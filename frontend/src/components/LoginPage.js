import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import '../LoginPage.css'; 
import GoogleLogo from '../assets/images/GoogleLogo.png';
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
                    <img src={GoogleLogo} alt="Google Sign-In" className="google-logo" />
                </button>
                <p className="signup-link">
                    Don't have an account? <a href="/Register">Sign up</a>
                </p>
            </main>
        </div>
    );
};

export default LoginPage;
