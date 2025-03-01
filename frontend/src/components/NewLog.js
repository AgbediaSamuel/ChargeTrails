import React, { useState } from 'react';
import '../NewLog.css';
import { useAuth } from '../context/AuthContext';
import { getIdToken } from 'firebase/auth';

const NewLog = () => {
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [error, setError] = useState(null);

    const handleCameraClick = () => {
        // Camera functionality would go here
        console.log('Camera clicked');
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !currentUser) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            // Get the user's ID token
            const token = await getIdToken(currentUser, true);
            
            const response = await fetch("http://localhost:8000/encode_image", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error occurred');
            }
            
            const data = await response.json();
            setReceiptData(data);
            console.log('Receipt data:', data);
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Error uploading file');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="newlog-container">
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
            </header>
            
            <div className="button-container">
                <button className="camera-button" onClick={handleCameraClick}>
                    <i className="fa-solid fa-camera"></i>
                </button>
                <label className="attachment-button">
                    <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload}
                    />
                    <i className="fa-solid fa-paperclip"></i>
                </label>
            </div>
            
            {isLoading && <div className="loading">Processing receipt...</div>}
            
            {error && <div className="error">{error}</div>}
            
            {receiptData && !isLoading && (
                <div className="receipt-data">
                    <h2>Receipt Information</h2>
                    <p><strong>Store:</strong> {receiptData.receipt_data?.metadata?.['shop name'] || 'Unknown'}</p>
                    <p><strong>Date:</strong> {receiptData.receipt_data?.metadata?.['date of purchase'] || 'Unknown'}</p>
                    <p><strong>Total:</strong> ${receiptData.receipt_data?.metadata?.['total amount'] || '0.00'}</p>
                    
                    <h3>Products</h3>
                    <ul className="product-list">
                        {receiptData.receipt_data?.products?.map((product, index) => (
                            <li key={index} className="product-item">
                                <span>{product.Name}</span>
                                <span>${product.Price}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NewLog;