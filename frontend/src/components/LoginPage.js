import React from 'react';
import '../LoginPage.css';
import GoogleLogo from '../assets/images/GoogleLogo.png';

const LoginPage = () => {
    return (
        <div className="login-container">
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
            </header>
            <main className="login-main">
                <h2 className="login-title">Sign in to your Account</h2>
                <form className="login-form">
                    <input type="email" placeholder="Email Address" className="input-field" />
                    <input type="password" placeholder="Password" className="input-field" />
                    <button type="submit" className="signin-btn">Sign In</button>
                </form>
                <p className="continue-with-text">or continue with</p>
                <button className="google-signin-btn">
                    <img src={GoogleLogo} alt="Google Sign-In" className="google-logo" />
                </button>
            </main>
        </div>
    );
}

export default LoginPage;
