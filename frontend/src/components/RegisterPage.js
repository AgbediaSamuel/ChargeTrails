import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import '../Register.css'; 
import GoogleLogo from '../assets/images/GoogleLogo.png';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            navigate('/Dashboard');
        }
    }, [currentUser, navigate]); 

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user,
                {displayName: firstName}
            );

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
        <div className="register-container">
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
            </header>
            <main className="register-main">
                <h2 className="register-title">Create an Account</h2>
                <form className="register-form" onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input-field"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="input-field"
                        required
                    />
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
                    <button type="submit" className="create-account-btn">Create Account</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p className="continue-with-text">or continue with</p>
                <button className="google-signin-btn" onClick={handleGoogleSignIn}>
                    <img src={GoogleLogo} alt="Google Sign-In" className="google-logo" />
                </button>
            </main>
        </div>
    );
};

export default RegisterPage;
