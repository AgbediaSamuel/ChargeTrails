import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import '../LoginPage.css';
import GoogleLogo from '../assets/images/GoogleLogo.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
 
            await signInWithEmailAndPassword(auth, email, password);

            navigate('/dashboard');
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
                <h2 className="login-title">Sign in to your Account</h2>
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
                    <button type="submit" className="signin-btn">Sign In</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p className="continue-with-text">or continue with</p>
                <button className="google-signin-btn">
                    <img src={GoogleLogo} alt="Google Sign-In" className="google-logo" />
                </button>
            </main>
        </div>
    );
};

export default LoginPage;
