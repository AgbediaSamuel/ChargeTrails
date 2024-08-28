document.getElementById('captureButton').addEventListener('click', captureFromCamera);
document.getElementById('uploadButton').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', uploadFromFile);

function captureFromCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            video.addEventListener('canplay', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const base64Image = canvas.toDataURL('image/png');
                displayImage(base64Image);

                stream.getTracks().forEach(track => track.stop());
            });
        })
        .catch(error => console.error('Error accessing camera: ', error));
}

function uploadFromFile(event) {
    const file = event.target.files[0];
    if (file) {
        convertToBase64(file);
    }
}

function convertToBase64(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const base64Image = reader.result;
        displayImage(base64Image);
    };
    reader.onerror = error => console.error('Error reading file: ', error);
}

function displayImage(base64Image) {
    const img = document.getElementById('imageDisplay');
    img.src = base64Image;
    img.style.display = 'block';
}