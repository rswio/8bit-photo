/**
 * 8-Bit Image Processor
 * Handles image conversion to 8-bit style with various effects
 */

class ImageProcessor {
    constructor() {
        this.colorPalettes = {
            gameboy: [
                [15, 56, 15],      // darkest green
                [48, 98, 48],      // dark green
                [139, 172, 15],    // light green
                [155, 188, 15]     // lightest green
            ],
            nes: this.generateNESPalette(),
            atari: this.generateAtariPalette(),
            commodore: this.generateCommodorePalette(),
            custom256: this.generateCustomPalette(256)
        };
    }

    /**
     * Generate NES color palette (simplified)
     */
    generateNESPalette() {
        const palette = [];
        // Basic NES colors - simplified version
        const baseColors = [
            [84, 84, 84], [0, 30, 116], [8, 16, 144], [48, 0, 136],
            [68, 0, 100], [92, 0, 48], [84, 4, 0], [60, 24, 0],
            [32, 42, 0], [8, 58, 0], [0, 64, 0], [0, 60, 0],
            [0, 50, 60], [0, 0, 0], [0, 0, 0], [0, 0, 0],
            [152, 150, 152], [8, 76, 196], [48, 50, 236], [92, 30, 228],
            [136, 20, 176], [160, 20, 100], [152, 34, 32], [120, 60, 0],
            [84, 90, 0], [40, 114, 0], [8, 124, 0], [0, 118, 40],
            [0, 102, 120], [0, 0, 0], [0, 0, 0], [0, 0, 0]
        ];
        
        return baseColors;
    }

    /**
     * Generate Atari 2600 color palette
     */
    generateAtariPalette() {
        const palette = [];
        for (let i = 0; i < 128; i++) {
            const hue = (i % 16) * 22.5;
            const sat = Math.floor(i / 16) / 7;
            const val = 0.5 + (i % 2) * 0.5;
            palette.push(this.hsvToRgb(hue, sat, val));
        }
        return palette;
    }

    /**
     * Generate Commodore 64 palette
     */
    generateCommodorePalette() {
        return [
            [0, 0, 0],         // black
            [255, 255, 255],   // white
            [136, 57, 50],     // red
            [103, 182, 189],   // cyan
            [139, 63, 150],    // purple
            [85, 160, 73],     // green
            [64, 49, 141],     // blue
            [191, 206, 114],   // yellow
            [139, 84, 41],     // orange
            [87, 66, 0],       // brown
            [184, 105, 98],    // light red
            [80, 80, 80],      // dark grey
            [120, 120, 120],   // grey
            [148, 224, 137],   // light green
            [120, 105, 196],   // light blue
            [159, 159, 159]    // light grey
        ];
    }

    /**
     * Generate custom palette with specified number of colors
     */
    generateCustomPalette(numColors) {
        const palette = [];
        for (let i = 0; i < numColors; i++) {
            const hue = (i * 137.508) % 360; // Golden angle for good distribution
            const sat = 0.5 + (i % 2) * 0.3;
            const val = 0.3 + (i % 3) * 0.3;
            palette.push(this.hsvToRgb(hue, sat, val));
        }
        return palette;
    }

    /**
     * Convert HSV to RGB
     */
    hsvToRgb(h, s, v) {
        h = h / 360;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        let r, g, b;
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * Find closest color in palette
     */
    findClosestColor(rgb, palette) {
        let minDistance = Infinity;
        let closestColor = palette[0];
        
        for (const color of palette) {
            const distance = Math.sqrt(
                Math.pow(rgb[0] - color[0], 2) +
                Math.pow(rgb[1] - color[1], 2) +
                Math.pow(rgb[2] - color[2], 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = color;
            }
        }
        
        return closestColor;
    }

    /**
     * Apply Floyd-Steinberg dithering
     */
    floydSteinbergDithering(imageData, palette) {
        const width = imageData.width;
        const height = imageData.height;
        const data = new Uint8ClampedArray(imageData.data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const oldColor = [data[idx], data[idx + 1], data[idx + 2]];
                const newColor = this.findClosestColor(oldColor, palette);
                
                data[idx] = newColor[0];
                data[idx + 1] = newColor[1];
                data[idx + 2] = newColor[2];
                
                const error = [
                    oldColor[0] - newColor[0],
                    oldColor[1] - newColor[1],
                    oldColor[2] - newColor[2]
                ];
                
                // Distribute error to neighboring pixels
                this.distributeError(data, width, height, x, y, error);
            }
        }
        
        return new ImageData(data, width, height);
    }

    /**
     * Distribute dithering error to neighboring pixels
     */
    distributeError(data, width, height, x, y, error) {
        const offsets = [
            { x: 1, y: 0, factor: 7/16 },
            { x: -1, y: 1, factor: 3/16 },
            { x: 0, y: 1, factor: 5/16 },
            { x: 1, y: 1, factor: 1/16 }
        ];
        
        for (const offset of offsets) {
            const nx = x + offset.x;
            const ny = y + offset.y;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (ny * width + nx) * 4;
                data[idx] = Math.max(0, Math.min(255, data[idx] + error[0] * offset.factor));
                data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + error[1] * offset.factor));
                data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + error[2] * offset.factor));
            }
        }
    }

    /**
     * Apply ordered dithering
     */
    orderedDithering(imageData, palette) {
        const width = imageData.width;
        const height = imageData.height;
        const data = new Uint8ClampedArray(imageData.data);
        
        // Bayer matrix for ordered dithering
        const bayerMatrix = [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5]
        ];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const threshold = (bayerMatrix[y % 4][x % 4] / 16) * 255;
                
                const oldColor = [data[idx], data[idx + 1], data[idx + 2]];
                
                // Add threshold for dithering effect
                const adjustedColor = [
                    Math.min(255, oldColor[0] + (threshold - 128) / 4),
                    Math.min(255, oldColor[1] + (threshold - 128) / 4),
                    Math.min(255, oldColor[2] + (threshold - 128) / 4)
                ];
                
                const newColor = this.findClosestColor(adjustedColor, palette);
                data[idx] = newColor[0];
                data[idx + 1] = newColor[1];
                data[idx + 2] = newColor[2];
            }
        }
        
        return new ImageData(data, width, height);
    }

    /**
     * Apply random dithering
     */
    randomDithering(imageData, palette) {
        const width = imageData.width;
        const height = imageData.height;
        const data = new Uint8ClampedArray(imageData.data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const noise = (Math.random() - 0.5) * 50;
                
                const oldColor = [
                    Math.max(0, Math.min(255, data[idx] + noise)),
                    Math.max(0, Math.min(255, data[idx + 1] + noise)),
                    Math.max(0, Math.min(255, data[idx + 2] + noise))
                ];
                
                const newColor = this.findClosestColor(oldColor, palette);
                data[idx] = newColor[0];
                data[idx + 1] = newColor[1];
                data[idx + 2] = newColor[2];
            }
        }
        
        return new ImageData(data, width, height);
    }

    /**
     * Apply pixelation effect
     */
    pixelate(imageData, pixelSize) {
        if (pixelSize <= 1) return imageData;
        
        const width = imageData.width;
        const height = imageData.height;
        
        // Ensure we have valid dimensions
        if (!width || !height || width <= 0 || height <= 0) {
            throw new Error('Invalid image dimensions for pixelation');
        }
        
        const data = new Uint8ClampedArray(imageData.data);
        
        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                // Calculate average color for this pixel block
                let r = 0, g = 0, b = 0, count = 0;
                
                for (let py = y; py < Math.min(y + pixelSize, height); py++) {
                    for (let px = x; px < Math.min(x + pixelSize, width); px++) {
                        const idx = (py * width + px) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        count++;
                    }
                }
                
                if (count > 0) {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    
                    // Apply averaged color to entire block
                    for (let py = y; py < Math.min(y + pixelSize, height); py++) {
                        for (let px = x; px < Math.min(x + pixelSize, width); px++) {
                            const idx = (py * width + px) * 4;
                            data[idx] = r;
                            data[idx + 1] = g;
                            data[idx + 2] = b;
                        }
                    }
                }
            }
        }
        
        return new ImageData(data, width, height);
    }

    /**
     * Adjust brightness and contrast
     */
    adjustBrightnessContrast(imageData, brightness, contrast) {
        const data = new Uint8ClampedArray(imageData.data);
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        
        for (let i = 0; i < data.length; i += 4) {
            // Apply brightness
            data[i] = Math.max(0, Math.min(255, data[i] + brightness));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
            
            // Apply contrast
            data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
        }
        
        return new ImageData(data, imageData.width, imageData.height);
    }

    /**
     * Main processing function
     */
    async process(imageData, options, progressCallback) {
        // Validate input
        if (!imageData || !imageData.data || imageData.width <= 0 || imageData.height <= 0) {
            throw new Error('Invalid image data provided');
        }
        
        let processedData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        const steps = 5;
        let currentStep = 0;

        try {
            // Step 1: Adjust brightness and contrast
            if (options.brightness !== 0 || options.contrast !== 0) {
                processedData = this.adjustBrightnessContrast(
                    processedData,
                    options.brightness,
                    options.contrast
                );
            }
            progressCallback && progressCallback(++currentStep / steps * 100);

            // Step 2: Apply pixelation
            if (options.pixelSize > 1) {
                processedData = this.pixelate(processedData, options.pixelSize);
            }
            progressCallback && progressCallback(++currentStep / steps * 100);

            // Step 3: Get color palette
            const palette = this.colorPalettes[options.palette] || this.colorPalettes.nes;
            progressCallback && progressCallback(++currentStep / steps * 100);

            // Step 4: Apply dithering
            if (options.dithering === 'floyd') {
                processedData = this.floydSteinbergDithering(processedData, palette);
            } else if (options.dithering === 'ordered') {
                processedData = this.orderedDithering(processedData, palette);
            } else if (options.dithering === 'random') {
                processedData = this.randomDithering(processedData, palette);
            } else {
                // No dithering - just quantize to palette
                const data = new Uint8ClampedArray(processedData.data);
                const width = processedData.width;
                const height = processedData.height;
                
                for (let i = 0; i < data.length; i += 4) {
                    const color = this.findClosestColor([data[i], data[i + 1], data[i + 2]], palette);
                    data[i] = color[0];
                    data[i + 1] = color[1];
                    data[i + 2] = color[2];
                }
                processedData = new ImageData(data, width, height);
            }
            progressCallback && progressCallback(++currentStep / steps * 100);

            // Step 5: Final processing
            progressCallback && progressCallback(100);

            return processedData;
        } catch (error) {
            console.error('Processing error:', error);
            throw new Error('Failed to process image: ' + error.message);
        }
    }
}

// Export for use in main application
window.ImageProcessor = ImageProcessor;