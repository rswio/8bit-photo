/**
 * 8-Bit Photo Converter - Main Application
 * Handles UI interactions and coordinates image processing
 */

class App {
    constructor() {
        this.processor = new ImageProcessor();
        this.currentImages = [];
        this.processedImages = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSliderUpdates();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Process button
        document.getElementById('processButton').addEventListener('click', () => this.processImages());

        // Download buttons
        document.getElementById('downloadButton').addEventListener('click', () => this.downloadImage());
        document.getElementById('downloadAllButton').addEventListener('click', () => this.downloadAllImages());

        // Navigation buttons
        document.getElementById('processMoreButton').addEventListener('click', () => this.resetApp());
        document.getElementById('processBatchButton').addEventListener('click', () => this.processBatch());

        // Share button
        document.getElementById('shareButton').addEventListener('click', () => this.shareImage());
    }

    setupSliderUpdates() {
        // Brightness slider
        const brightnessSlider = document.getElementById('brightness');
        const brightnessValue = document.getElementById('brightnessValue');
        brightnessSlider.addEventListener('input', (e) => {
            brightnessValue.textContent = e.target.value;
        });

        // Contrast slider
        const contrastSlider = document.getElementById('contrast');
        const contrastValue = document.getElementById('contrastValue');
        contrastSlider.addEventListener('input', (e) => {
            contrastValue.textContent = e.target.value;
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('drag-over'), false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileSelect(files);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    async handleFileSelect(files) {
    // Show preview of first valid image before processing
    const previewCanvas = document.getElementById('originalCanvas');
    previewCanvas.width = 1;
    previewCanvas.height = 1;
    previewCanvas.getContext('2d').clearRect(0, 0, 1, 1);
        const validFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/') && 
            ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
        );

        if (validFiles.length === 0) {
            this.showError('Please select valid image files (JPEG, PNG, or WebP).');
            return;
        }

        if (validFiles.length > 10) {
            this.showError('Please select no more than 10 images at once.');
            return;
        }

        let previewSet = false;
        this.currentImages = [];
        try {
            for (const file of validFiles) {
                console.log('handleFileSelect: loading file', file);
                const imageData = await this.loadImage(file);
                console.log('handleFileSelect: loaded imageData', imageData);
                // Validate imageData
                if (!imageData || !imageData.imageData || !imageData.imageData.data || imageData.imageData.width <= 0 || imageData.imageData.height <= 0) {
                    console.error('Invalid imageData:', imageData);
                    this.showError('Error: One or more images could not be loaded or are invalid.');
                    continue;
                }
                console.log('Valid imageData:', {
                    width: imageData.imageData.width,
                    height: imageData.imageData.height,
                    dataLength: imageData.imageData.data.length
                });
                this.currentImages.push({
                    file,
                    imageData: imageData.imageData,
                    canvas: imageData.canvas
                });
                // Show preview for first valid image
                if (!previewSet) {
                    previewCanvas.width = imageData.imageData.width;
                    previewCanvas.height = imageData.imageData.height;
                    previewCanvas.getContext('2d').putImageData(imageData.imageData, 0, 0);
                    previewSet = true;
                }
            }

            if (this.currentImages.length === 0) {
                this.showError('No valid images to process.');
                return;
            }

            if (this.currentImages.length === 1) {
                this.showSingleImageInterface();
            } else {
                this.showBatchInterface();
            }
        } catch (error) {
            this.showError('Error loading images: ' + error.message);
        }
    }

    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Limit canvas size for performance
                const maxSize = 1024;
                let width = img.naturalWidth || img.width;
                let height = img.naturalHeight || img.height;
                console.log('loadImage: img loaded', { width, height });
                // Ensure we have valid dimensions
                if (!width || !height || width <= 0 || height <= 0) {
                    console.error('loadImage: Invalid image dimensions', { width, height });
                    reject(new Error('Invalid image dimensions'));
                    return;
                }
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }
                // Ensure minimum size
                width = Math.max(1, width);
                height = Math.max(1, height);
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const imageData = ctx.getImageData(0, 0, width, height);
                console.log('loadImage: got imageData', {
                    width: imageData.width,
                    height: imageData.height,
                    dataLength: imageData.data.length
                });
                resolve({ imageData, canvas });
            };

            img.onerror = (e) => {
                console.error('loadImage: Failed to load image', e);
                reject(new Error('Failed to load image'));
            };
            // Handle both File objects and data URLs
            if (file instanceof File) {
                img.src = URL.createObjectURL(file);
            } else if (typeof file === 'string') {
                img.src = file;
            } else {
                console.error('loadImage: Invalid file type', file);
                reject(new Error('Invalid file type'));
            }
        });
    }

    showSingleImageInterface() {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('optionsSection').style.display = 'block';
        document.getElementById('batchSection').style.display = 'none';
    }

    showBatchInterface() {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('optionsSection').style.display = 'block';
        document.getElementById('batchSection').style.display = 'block';
        
        this.displayBatchQueue();
    }

    displayBatchQueue() {
        const batchQueue = document.getElementById('batchQueue');
        batchQueue.innerHTML = '';

        this.currentImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'batch-item';
            item.innerHTML = `
                <img src="${image.canvas.toDataURL()}" alt="Preview ${index + 1}">
                <div class="filename">${image.file.name}</div>
                <div class="status pending">⏳</div>
            `;
            batchQueue.appendChild(item);
        });
    }

    async processImages() {
        if (this.isProcessing) return;

        // Prevent processing if no image is loaded
        if (!this.currentImages || this.currentImages.length === 0) {
            this.showError('No image selected. Please upload an image before converting.');
            return;
        }

        this.isProcessing = true;
        this.showProcessingIndicator();

        const options = this.getProcessingOptions();

        try {
            if (this.currentImages.length === 1) {
                await this.processSingleImage(this.currentImages[0], options);
            } else {
                await this.processBatchImages(options);
            }
        } catch (error) {
            this.showError('Processing failed: ' + error.message);
        } finally {
            this.isProcessing = false;
            this.hideProcessingIndicator();
        }
    }

    async processSingleImage(image, options) {
        const progressCallback = (progress) => {
            document.getElementById('progressFill').style.width = `${progress}%`;
        };

        // Validate imageData before processing
        if (!image || !image.imageData || !image.imageData.data || image.imageData.width <= 0 || image.imageData.height <= 0) {
            console.error('processSingleImage: Invalid imageData', image);
            this.showError('Cannot process: Image data is invalid or missing.');
            return;
        }

        // Log imageData for debugging
        console.log('processSingleImage: imageData', image.imageData);

        let processedImageData;
        try {
            processedImageData = await this.processor.process(
                image.imageData,
                options,
                progressCallback
            );
        } catch (error) {
            console.error('processSingleImage: Processing failed', error, image.imageData);
            this.showError('Processing failed: ' + error.message);
            return;
        }

        this.displayResults(image.imageData, processedImageData);
    }

    async processBatchImages(options) {
        this.processedImages = [];
        const batchItems = document.querySelectorAll('.batch-item .status');

        for (let i = 0; i < this.currentImages.length; i++) {
            const item = batchItems[i];
            item.className = 'status processing';
            item.textContent = '⚡';

            try {
                const progressCallback = (progress) => {
                    const totalProgress = ((i / this.currentImages.length) + (progress / 100 / this.currentImages.length)) * 100;
                    document.getElementById('progressFill').style.width = `${totalProgress}%`;
                };

                const processedImageData = await this.processor.process(
                    this.currentImages[i].imageData,
                    options,
                    progressCallback
                );

                this.processedImages.push({
                    original: this.currentImages[i],
                    processed: processedImageData
                });

                item.className = 'status complete';
                item.textContent = '✅';
            } catch (error) {
                item.className = 'status error';
                item.textContent = '❌';
                console.error(`Failed to process image ${i + 1}:`, error);
            }
        }

        if (this.processedImages.length > 0) {
            document.getElementById('downloadAllButton').style.display = 'inline-block';
            this.showBatchResults();
        }
    }

    showBatchResults() {
        // Show a summary or the first processed image
        if (this.processedImages.length > 0) {
            const first = this.processedImages[0];
            this.displayResults(first.original.imageData, first.processed);
        }
    }

    displayResults(originalImageData, processedImageData) {
        // Display original image
        const originalCanvas = document.getElementById('originalCanvas');
        originalCanvas.width = originalImageData.width;
        originalCanvas.height = originalImageData.height;
        originalCanvas.getContext('2d').putImageData(originalImageData, 0, 0);

        // Display processed image
        const resultCanvas = document.getElementById('resultCanvas');
        resultCanvas.width = processedImageData.width;
        resultCanvas.height = processedImageData.height;
        resultCanvas.getContext('2d').putImageData(processedImageData, 0, 0);

        this.showResultsSection();
    }

    showResultsSection() {
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
    }

    showProcessingIndicator() {
        document.getElementById('optionsSection').style.display = 'none';
        document.getElementById('batchSection').style.display = 'none';
        document.getElementById('processingSection').style.display = 'block';
        document.getElementById('progressFill').style.width = '0%';
    }

    hideProcessingIndicator() {
        document.getElementById('processingSection').style.display = 'none';
    }

    getProcessingOptions() {
        return {
            palette: document.getElementById('colorPalette').value,
            dithering: document.getElementById('ditheringType').value,
            pixelSize: parseInt(document.getElementById('pixelSize').value),
            brightness: parseInt(document.getElementById('brightness').value),
            contrast: parseInt(document.getElementById('contrast').value)
        };
    }

    downloadImage() {
        const canvas = document.getElementById('resultCanvas');
        this.downloadCanvas(canvas, '8bit-converted.png');
    }

    downloadAllImages() {
        this.processedImages.forEach((image, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.processed.width;
            canvas.height = image.processed.height;
            canvas.getContext('2d').putImageData(image.processed, 0, 0);
            
            const filename = `8bit-${image.original.file.name.replace(/\.[^/.]+$/, '')}.png`;
            this.downloadCanvas(canvas, filename);
        });
    }

    downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    async shareImage() {
        const canvas = document.getElementById('resultCanvas');
        
        if (navigator.share && navigator.canShare) {
            try {
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], '8bit-converted.png', { type: 'image/png' });
                    
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: '8-Bit Photo Conversion',
                            text: 'Check out my retro 8-bit photo conversion!',
                            files: [file]
                        });
                    }
                });
            } catch (error) {
                this.fallbackShare(canvas);
            }
        } else {
            this.fallbackShare(canvas);
        }
    }

    fallbackShare(canvas) {
        // Copy image data URL to clipboard as fallback
        const dataURL = canvas.toDataURL('image/png');
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(dataURL).then(() => {
                this.showMessage('Image data copied to clipboard!');
            }).catch(() => {
                this.showMessage('Right-click the image to save or share it.');
            });
        } else {
            this.showMessage('Right-click the image to save or share it.');
        }
    }

    resetApp() {
        this.currentImages = [];
        this.processedImages = [];
        
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('optionsSection').style.display = 'none';
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('batchSection').style.display = 'none';
        document.getElementById('downloadAllButton').style.display = 'none';
        
        // Reset form values
        document.getElementById('brightness').value = 0;
        document.getElementById('contrast').value = 0;
        document.getElementById('brightnessValue').textContent = '0';
        document.getElementById('contrastValue').textContent = '0';
        document.getElementById('fileInput').value = '';
    }

    showError(message) {
        // Simple error display - could be enhanced with a modal
        alert('Error: ' + message);
    }

    showMessage(message) {
        // Simple message display - could be enhanced with a toast notification
        alert(message);
    }

    // Batch processing from batch section
    async processBatch() {
        if (this.currentImages.length === 0) return;
        await this.processImages();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}