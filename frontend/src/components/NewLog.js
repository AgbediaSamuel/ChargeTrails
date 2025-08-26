import React, { useState, useRef } from 'react';
import '../NewLog.css';
import { useAuth } from '../context/AuthContext';
import { getIdToken } from 'firebase/auth';
import { authFetch } from '../apiClient';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useProducts } from '../context/ProductContext';
import { mergeOneIntoCache } from '../cache/receiptsCache';
import { saveProducts } from '../cache/productsCache';

const NewLog = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { setProducts } = useProducts();
    const [isLoading, setIsLoading] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);
    
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const webcamRef = useRef(null);
    
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "environment",
    };

    const handleCameraClick = () => {
        setIsCameraActive(true);
        setError(null);
    };

    const handleCameraClose = () => {
        setIsCameraActive(false);
    };

    const handleCaptureImage = () => {
        if (!webcamRef.current) return;
        
        try {
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) {
                throw new Error('Failed to capture image');
            }
            
            setCapturedImage(imageSrc);
            
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "receipt-capture.jpg", { type: "image/jpeg" });
                    
                    setIsCameraActive(false);
                    
                    uploadImage(file);
                })
                .catch(err => {
                    console.error('Error converting image:', err);
                    setError('Failed to process the captured image');
                });
            
        } catch (err) {
            console.error('Error capturing image:', err);
            setError('Failed to capture image from camera');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !currentUser) return;
        
        uploadImage(file);
    };

    const uploadImage = async (file) => {
        if (!file || !currentUser) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const response = await authFetch("/encode_image", {
                method: "POST",
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error occurred');
            }
            
            const data = await response.json();
            setResponseData(data);

            const productsRes = await authFetch("/user_products");
            const productsData = await productsRes.json();
            if (productsRes.ok && productsData.products) {
                setProducts(productsData.products);
                if (currentUser) saveProducts(currentUser.uid, productsData.products);
            }

            try {
                const auth = getIdToken;
                const newReceiptRes = await authFetch(`/receipts?limit=1`);
                const latest = await newReceiptRes.json();
                if (newReceiptRes.ok && Array.isArray(latest.receipts) && latest.receipts.length > 0) {
                    const r = latest.receipts[0];
                    if (r && currentUser) {
                        if (r.timestamp == null) r.timestamp = Date.now();
                        mergeOneIntoCache(currentUser.uid, r);
                    }
                }
            } catch {}

        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Error uploading file');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
            </header>
            
            {!isCameraActive && !isLoading && !responseData && !error && (
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
            )}
            
            {isCameraActive && (
                <div className="camera-container">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="camera-preview"
                        mirrored={false}
                    />
                    <div className="camera-controls">
                        <button className="capture-btn" onClick={handleCaptureImage}>
                            <i className="fa-solid fa-camera"></i>
                        </button>
                        <button className="close-camera-btn" onClick={handleCameraClose}>
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                </div>
            )}
            
            {isLoading && (
                <div className="loading-container">
                    <div className="loading">Processing receipt...</div>
                </div>
            )}
            
            {error && (
                <div className="error-container">
                    <div className="error">
                        <i className="fa-solid fa-exclamation-circle"></i>
                        <p>{error}</p>
                        <button onClick={() => setError(null)}>Try Again</button>
                    </div>
                </div>
            )}
            
            {responseData && !isLoading && (
                <div className="success-container">
                    <div className="success">
                        <i className="fa-solid fa-check-circle"></i>
                        <h3>{responseData.message}</h3>
                        <div className="success-actions">
                            <button className="new-log-btn" onClick={() => {
                                setResponseData(null);
                                setCapturedImage(null);
                            }}>Upload Another</button>
                            <button className='new-log-btn' onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewLog;