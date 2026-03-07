import { useCallback, useRef, useState } from "react";

export type PaletteType = "original" | "gameboy" | "nes" | "bw" | "cga";

interface UsePixelConverterReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  originalImage: HTMLImageElement | null;
  isProcessing: boolean;
  handleImageUpload: (file: File) => void;
  processImage: (pixelSize: number, palette: PaletteType) => void;
  downloadImage: () => void;
  clearImage: () => void;
}

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

function findNearestColor(r: number, g: number, b: number, palette: number[][]): number[] {
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

function applyPalette(r: number, g: number, b: number, paletteType: PaletteType): [number, number, number] {
  if (paletteType === "bw") {
    const avg = (r + g + b) / 3;
    const val = avg > 128 ? 255 : 0;
    return [val, val, val];
  }

  if (paletteType === "gameboy") {
    const avg = (r + g + b) / 3;
    if (avg < 64) return [15, 56, 15];
    if (avg < 128) return [48, 98, 48];
    if (avg < 192) return [139, 172, 15];
    return [155, 188, 15];
  }

  if (paletteType === "cga") {
    const nearest = findNearestColor(r, g, b, PALETTES.cga);
    return [nearest[0], nearest[1], nearest[2]];
  }

  if (paletteType === "nes") {
    const nearest = findNearestColor(r, g, b, PALETTES.nes);
    return [nearest[0], nearest[1], nearest[2]];
  }

  return [r, g, b];
}

export function usePixelConverter(): UsePixelConverterReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = useCallback((pixelSize: number, palette: PaletteType) => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = originalImage.width;
    const h = originalImage.height;

    canvas.width = w;
    canvas.height = h;

    const smallW = Math.ceil(w / pixelSize);
    const smallH = Math.ceil(h / pixelSize);

    const offCanvas = document.createElement("canvas");
    offCanvas.width = smallW;
    offCanvas.height = smallH;
    const offCtx = offCanvas.getContext("2d");
    if (!offCtx) return;

    offCtx.drawImage(originalImage, 0, 0, smallW, smallH);

    if (palette !== "original") {
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

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, smallW, smallH, 0, 0, w, h);

    setIsProcessing(false);
  }, [originalImage]);

  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement("a");
    link.download = "8bit-photo.png";
    link.href = canvasRef.current.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const clearImage = useCallback(() => {
    setOriginalImage(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  return {
    canvasRef,
    originalImage,
    isProcessing,
    handleImageUpload,
    processImage,
    downloadImage,
    clearImage,
  };
}
