const uploadDropzone = document.getElementById('uploadDropzone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const resultCard = document.getElementById('resultCard');
const resultText = document.getElementById('resultText');

// Drag & Drop
uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.style.background = 'rgba(0, 255, 153, 0.1)';
});

uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.style.background = 'transparent';
});

uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.style.background = 'transparent';
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

// Browse button
browseBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
});

// Handle File
function handleFile(file) {
    if (!file) return;

    resultCard.classList.add('hidden');
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';

    // Smooth progress simulation
    let progress = 0;
    const interval = setInterval(() => {
        if (progress >= 100) {
            clearInterval(interval);
            sendFileToServer(file);
        } else {
            progress += 5;
            progressBar.style.width = progress + '%';
        }
    }, 50);
}

// Send to backend
async function sendFileToServer(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/predict', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Server error');

        const data = await response.json();
        progressContainer.classList.add('hidden');
        resultText.textContent = `Predicted Protocol: ${data.prediction}`;
        resultCard.classList.remove('hidden');
    } catch (err) {
        progressContainer.classList.add('hidden');
        resultText.textContent = `Error: ${err.message}`;
        resultCard.classList.remove('hidden');
    }
}
