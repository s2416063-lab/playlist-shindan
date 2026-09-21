const uploadInput = document.getElementById('image-upload');
const uploadArea = document.getElementById('upload-area');
const previewContainer = document.getElementById('preview-container');
const diagnoseBtn = document.getElementById('diagnose-btn');
const loading = document.getElementById('loading');
const resultArea = document.getElementById('result-area');

let selectedFiles = [];

uploadInput.addEventListener('change', handleFiles);

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    uploadInput.files = e.dataTransfer.files;
    handleFiles();
});

function handleFiles() {
    selectedFiles = Array.from(uploadInput.files);
    previewContainer.innerHTML = '';
    
    if (selectedFiles.length > 0) {
        diagnoseBtn.disabled = false;
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                previewContainer.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    } else {
        diagnoseBtn.disabled = true;
    }
}

diagnoseBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    diagnoseBtn.style.display = 'none';
    loading.classList.remove('hidden');
    resultArea.classList.add('hidden');

    const formData = new FormData();
    selectedFiles.forEach(file => {
        formData.append('images', file);
    });

    try {
        const response = await fetch('/api/diagnose', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('診断に失敗しました');
        }

        const data = await response.json();
        
        loading.classList.add('hidden');
        resultArea.classList.remove('hidden');
        
        resultArea.innerHTML = `
            <div style="white-space: pre-wrap; line-height: 1.8;">${data.result}</div>
            <hr style="border:0; border-top:1px solid #444; margin:20px 0;">
            <button id="reset-btn" class="primary-btn">別の画像で診断する</button>
        `;

        document.getElementById('reset-btn').addEventListener('click', () => {
            selectedFiles = [];
            previewContainer.innerHTML = '';
            uploadInput.value = '';
            resultArea.classList.add('hidden');
            diagnoseBtn.style.display = 'block';
            diagnoseBtn.disabled = true;
        });

    } catch (error) {
        alert('エラーが発生しました。もう一度お試しください。');
        loading.classList.add('hidden');
        diagnoseBtn.style.display = 'block';
    }
});