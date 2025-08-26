import React, { useState, useEffect } from 'react';
import '../Dashboard.css';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useProductSearch } from './SearchBar';
import { useProducts } from '../context/ProductContext';

const DashboardPage = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;
    
    const [receipts, setReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const searchResults = useProductSearch(searchQuery);
    const { clearProducts } = useProducts();

    useEffect(() => {
        const fetchReceipts = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                setError(null);
                
                const token = await user.getIdToken(true);
                
                const response = await fetch('http://localhost:8000/retrieve_receipts', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch receipts');
                }
                
                const data = await response.json();
                setReceipts(data.receipts || []);
            } catch (err) {

                setError('Could not load your receipts. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchReceipts();
    }, [user]);

    const handleSignout = async () => {
        try {
            clearProducts(); 
            await signOut(auth);
            navigate('/');
        } catch (error) {
            alert("There's an error with signing out!");
        }
    };

    const handleNewLogClick = () => {
        navigate('/NewLog');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div>
            <div className="header">
                <h1 className="logo">CHARGETRAILS</h1>
                <div className="header-icons">
                    <Link to="/NewLog" className="new-log-btn" style={{display:'inline-block', textDecoration:'none', textAlign:'center'}}>
                        New Log
                    </Link>
                    <button className="new-log-btn" onClick={handleSignout}> Sign Out</button>
                    <button className="settings-icon" onClick={() => navigate('/settings')}>
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>
            <div className="dashboard-container">
                <main className="dashboard-main">
                    <h2 className="welcome-text">Welcome {user?.displayName || 'User'}</h2>
                    <div className="search-bar-container">
                        <input
                            type="text"
                            placeholder="type product name here...."
                            className="search-bar"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button className="search-button">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                    
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <ul>
                                {searchResults.map((name, idx) => (
                                    <li key={idx}>{name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <h3 className="section-title">Your Recent Receipts</h3>
                    
                    {isLoading && (
                        <div className="loading-state">
                            <p>Loading your receipts...</p>
                        </div>
                    )}
                    
                    {!isLoading && error && (
                        <div className="error-state">
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {!isLoading && !error && receipts.length === 0 && (
                        <div className="empty-state">
                            <p>You haven't uploaded any receipts yet.</p>
                            <button className="product-item" onClick={handleNewLogClick}>Upload Your First Receipt</button>
                        </div>
                    )}
                    
                    {!isLoading && !error && receipts.length > 0 && (
                        <div className="product-list">
                            {receipts.slice(0, 5).map((receipt) => (
                                <button
                                    key={receipt.receipt_id}
                                    className="product-item"
                                    onClick={() => navigate(`/receipts/${receipt.receipt_id}`, { state: { receipt } })}
                                >
                                    Receipt saved on {formatDate(receipt.date)}
                                    {receipt.shop_name && <span className="receipt-shop"> from {receipt.shop_name}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {!isLoading && !error && receipts.length > 0 && (
                        <button className="view-all-btn" onClick={() => navigate('/receipts')}>
                            View All
                        </button>
                    )}
                </main>
            </div>
        </div>
    );
}

export default DashboardPage;