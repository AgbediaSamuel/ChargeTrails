import React, { useRef, useState } from 'react';
import '../NewLog.css';

const NewLog = () => {
    const fileInputRef = useRef(null);
    const [uploadResult, setUploadResult] = useState("");

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/encode_image", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUploadResult(data.receipt_details || "Upload successful!");
            } else {
                setUploadResult("Error uploading file");
            }
        } catch (error) {
            console.error("Error connecting to server:", error);
            setUploadResult("Error connecting to server");
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    return (
        <div>
            <header className="header">
                <h1 className="logo">CHARGETRAILS</h1>
                <div className="header-icons">
                    <button className="settings-icon">
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </header>
            <div className="button-container">
                {/* Camera Button (UI only for now) */}
                <button id="camera-button" className="camera-button">
                    <i className="fa-solid fa-camera"></i>
                </button>

                {/* Attachment Button */}
                <button id="attachment-button" className='attachment-button' onClick={triggerFileUpload}>
                    <i className="fa-solid fa-paperclip"></i>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                    accept="image/*"
                />
            </div>
            {uploadResult && <div className="upload-result">{uploadResult}</div>}
        </div>
    );
};

export default NewLog;