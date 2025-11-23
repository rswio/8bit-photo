const imageUpload = document.getElementById('imageUpload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pixelSizeInput = document.getElementById('pixelSize');
const pixelSizeValue = document.getElementById('pixelSizeValue');
const paletteSelect = document.getElementById('palette');
const downloadBtn = document.getElementById('downloadBtn');
const settingsSection = document.getElementById('settingsSection');
const actionButtons = document.getElementById('actionButtons');
const placeholder = document.getElementById('placeholder');

let originalImage = null;

// Event Listeners
imageUpload.addEventListener('change', handleImageUpload);
pixelSizeInput.addEventListener('input', updatePixelSizeDisplay);
pixelSizeInput.addEventListener('change', processImage);
paletteSelect.addEventListener('change', processImage);
downloadBtn.addEventListener('click', downloadImage);

function updatePixelSizeDisplay() {
    pixelSizeValue.textContent = pixelSizeInput.value;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        originalImage = new Image();
        originalImage.onload = function () {
            // Show controls
            settingsSection.style.display = 'flex';
            actionButtons.style.display = 'flex';
            placeholder.style.display = 'none';

            // Initial process
            processImage();
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function processImage() {
    if (!originalImage) return;

    const pixelSize = parseInt(pixelSizeInput.value);
    const palette = paletteSelect.value;

    // Calculate scaled dimensions
    const w = originalImage.width;
    const h = originalImage.height;

    // We want the canvas to be the full size, but the drawing to be blocky.
    // Strategy: Draw small to an offscreen canvas, then draw back large.

    // 1. Set canvas size to match original image
    canvas.width = w;
    canvas.height = h;

    // 2. Calculate small dimensions
    const smallW = Math.ceil(w / pixelSize);
    const smallH = Math.ceil(h / pixelSize);

    // 3. Create offscreen canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = smallW;
    offCanvas.height = smallH;
    const offCtx = offCanvas.getContext('2d');

    // 4. Draw image reduced
    offCtx.drawImage(originalImage, 0, 0, smallW, smallH);

    // 5. Get pixel data for color manipulation
    if (palette !== 'original') {
        const imageData = offCtx.getImageData(0, 0, smallW, smallH);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const [newR, newG, newB] = applyPalette(r, g, b, palette);

            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
        }

        offCtx.putImageData(imageData, 0, 0);
    }

    // 6. Draw back to main canvas scaled up
    // Disable smoothing to get sharp pixels
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, smallW, smallH, 0, 0, w, h);
}

function applyPalette(r, g, b, paletteType) {
    // Simple nearest color quantization or effect

    if (paletteType === 'bw') {
        const avg = (r + g + b) / 3;
        const val = avg > 128 ? 255 : 0;
        return [val, val, val];
    }

    if (paletteType === 'gameboy') {
        // Gameboy 4 greens
        // #0f380f, #306230, #8bac0f, #9bbc0f
        const avg = (r + g + b) / 3;
        if (avg < 64) return [15, 56, 15];
        if (avg < 128) return [48, 98, 48];
        if (avg < 192) return [139, 172, 15];
        return [155, 188, 15];
    }

    if (paletteType === 'cga') {
        // CGA Palette 1 (High intensity): Black, Cyan, Magenta, White
        // Simple distance check
        const colors = [
            [0, 0, 0],       // Black
            [85, 255, 255],  // Cyan
            [255, 85, 255],  // Magenta
            [255, 255, 255]  // White
        ];
        return findNearestColor(r, g, b, colors);
    }

    if (paletteType === 'nes') {
        // Simplified NES-like palette (just a subset for effect)
        // This is a rough approximation using a few distinct colors
        const colors = [
            [124, 124, 124], [0, 0, 252], [0, 0, 188], [68, 40, 188], [148, 0, 132], [168, 0, 32], [168, 16, 0], [136, 20, 0],
            [80, 48, 0], [0, 120, 0], [0, 104, 0], [0, 88, 0], [0, 64, 88], [0, 0, 0],
            [188, 188, 188], [0, 120, 248], [0, 88, 248], [104, 68, 252], [216, 0, 204], [228, 0, 88], [248, 56, 0], [228, 92, 16],
            [172, 124, 0], [0, 184, 0], [0, 168, 0], [0, 168, 68], [0, 136, 136],
            [248, 248, 248], [60, 188, 252], [104, 136, 252], [152, 120, 248], [248, 120, 248], [248, 88, 152], [248, 120, 88], [252, 160, 68],
            [248, 184, 0], [184, 248, 24], [88, 216, 84], [88, 248, 152], [0, 232, 216], [120, 120, 120]
        ];
        return findNearestColor(r, g, b, colors);
    }

    return [r, g, b];
}

function findNearestColor(r, g, b, palette) {
    let minDist = Infinity;
    let nearest = palette[0];

    for (const color of palette) {
        const dr = r - color[0];
        const dg = g - color[1];
        const db = b - color[2];
        const dist = dr * dr + dg * dg + db * db;

        if (dist < minDist) {
            minDist = dist;
            nearest = color;
        }
    }
    return nearest;
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = '8bit-photo.png';
    link.href = canvas.toDataURL();
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}
