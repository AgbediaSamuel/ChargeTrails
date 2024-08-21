import React from 'react';
import '../Register.css'; 
import GoogleLogo from '../assets/images/GoogleLogo.png';

const RegisterPage = () => {
    return (
        <div className="register-container">
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
            </header>
            <main className="register-main">
                <h2 className="register-title">Create an Account</h2>
                <form className="register-form">
                    <input type="text" placeholder="First Name" className="input-field" />
                    <input type="text" placeholder="Last Name" className="input-field" />
                    <input type="email" placeholder="Email Address" className="input-field" />
                    <input type="password" placeholder="Password" className="input-field" />
                    <button type="submit" className="create-account-btn">Create Account</button>
                </form>
                <p className="continue-with-text">or continue with</p>
                <button className="google-signin-btn">
                    <img src={GoogleLogo} alt="Google Sign-In" className="google-logo" />
                </button>
            </main>
        </div>
    );
}

export default RegisterPage;
