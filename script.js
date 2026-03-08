// 8-Bit Photo Converter - Main JavaScript

// State
let originalImage = null;
let isProcessing = false;

// Color Palettes
const PALETTES = {
  gameboy: [
    [15, 56, 15],
    [48, 98, 48],
    [139, 172, 15],
    [155, 188, 15],
  ],
  nes: [
    [124, 124, 124], [0, 0, 252], [0, 0, 188], [68, 40, 188], [148, 0, 132], [168, 0, 32], [168, 16, 0], [136, 20, 0],
    [80, 48, 0], [0, 120, 0], [0, 104, 0], [0, 88, 0], [0, 64, 88], [0, 0, 0],
    [188, 188, 188], [0, 120, 248], [0, 88, 248], [104, 68, 252], [216, 0, 204], [228, 0, 88], [248, 56, 0], [228, 92, 16],
    [172, 124, 0], [0, 184, 0], [0, 168, 0], [0, 168, 68], [0, 136, 136],
    [248, 248, 248], [60, 188, 252], [104, 136, 252], [152, 120, 248], [248, 120, 248], [248, 88, 152], [248, 120, 88], [252, 160, 68],
    [248, 184, 0], [184, 248, 24], [88, 216, 84], [88, 248, 152], [0, 232, 216], [120, 120, 120],
  ],
  cga: [
    [0, 0, 0],
    [85, 255, 255],
    [255, 85, 255],
    [255, 255, 255],
  ],
};

// DOM Elements
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const controls = document.getElementById('controls');
const actions = document.getElementById('actions');
const placeholder = document.getElementById('placeholder');
const processing = document.getElementById('processing');
const pixelSizeInput = document.getElementById('pixelSize');
const pixelValueDisplay = document.getElementById('pixelValue');
const paletteSelect = document.getElementById('palette');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const canvasContainer = document.getElementById('canvasContainer');
const toast = document.getElementById('toast');

// Helper Functions
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
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

function applyPalette(r, g, b, paletteType) {
  if (paletteType === 'bw') {
    const avg = (r + g + b) / 3;
    const val = avg > 128 ? 255 : 0;
    return [val, val, val];
  }

  if (paletteType === 'gameboy') {
    const avg = (r + g + b) / 3;
    if (avg < 64) return [15, 56, 15];
    if (avg < 128) return [48, 98, 48];
    if (avg < 192) return [139, 172, 15];
    return [155, 188, 15];
  }

  if (paletteType === 'cga') {
    const nearest = findNearestColor(r, g, b, PALETTES.cga);
    return [nearest[0], nearest[1], nearest[2]];
  }

  if (paletteType === 'nes') {
    const nearest = findNearestColor(r, g, b, PALETTES.nes);
    return [nearest[0], nearest[1], nearest[2]];
  }

  return [r, g, b];
}

function processImage() {
  if (!originalImage || isProcessing) return;

  isProcessing = true;
  processing.classList.add('active');

  // Use setTimeout to allow UI to update
  setTimeout(() => {
    const pixelSize = parseInt(pixelSizeInput.value);
    const palette = paletteSelect.value;

    const w = originalImage.width;
    const h = originalImage.height;

    canvas.width = w;
    canvas.height = h;

    const smallW = Math.ceil(w / pixelSize);
    const smallH = Math.ceil(h / pixelSize);

    // Create off-screen canvas for downsampling
    const offCanvas = document.createElement('canvas');
    offCanvas.width = smallW;
    offCanvas.height = smallH;
    const offCtx = offCanvas.getContext('2d');

    // Draw downsampled image
    offCtx.drawImage(originalImage, 0, 0, smallW, smallH);

    // Apply palette if not original
    if (palette !== 'original') {
      const imageData = offCtx.getImageData(0, 0, smallW, smallH);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const [newR, newG, newB] = applyPalette(data[i], data[i + 1], data[i + 2], palette);
        data[i] = newR;
        data[i + 1] = newG;
        data[i + 2] = newB;
      }

      offCtx.putImageData(imageData, 0, 0);
    }

    // Draw upscaled pixelated image
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, smallW, smallH, 0, 0, w, h);

    isProcessing = false;
    processing.classList.remove('active');
  }, 10);
}

function handleImageUpload(file) {
  if (!file.type.startsWith('image/')) {
    showToast('PLEASE SELECT AN IMAGE FILE');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      placeholder.style.display = 'none';
      controls.classList.add('active');
      actions.classList.add('active');
      processImage();
      showToast('IMAGE LOADED!');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function downloadImage() {
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = '8bit-photo.png';
  link.href = canvas.toDataURL();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('8-BIT IMAGE DOWNLOADED!');
}

function clearImage() {
  originalImage = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  placeholder.style.display = 'flex';
  controls.classList.remove('active');
  actions.classList.remove('active');
  fileInput.value = '';
  showToast('IMAGE CLEARED');
}

// Event Listeners
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    handleImageUpload(file);
  }
});

pixelSizeInput.addEventListener('input', (e) => {
  pixelValueDisplay.textContent = `${e.target.value}px`;
  processImage();
});

paletteSelect.addEventListener('change', () => {
  processImage();
});

downloadBtn.addEventListener('click', downloadImage);
clearBtn.addEventListener('click', clearImage);

// Drag and Drop
canvasContainer.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

canvasContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const file = e.dataTransfer.files[0];
  if (file) {
    handleImageUpload(file);
  }
});

// Initialize
console.log('8-Bit Photo Converter Ready!');
