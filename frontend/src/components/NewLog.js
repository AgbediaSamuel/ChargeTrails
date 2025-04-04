import React, { useState, useRef } from 'react';
import '../NewLog.css';
import { useAuth } from '../context/AuthContext';
import { getIdToken } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

const NewLog = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
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
            setResponseData(data);
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