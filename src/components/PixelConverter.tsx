import { useState, useEffect, useCallback } from "react";
import { usePixelConverter, PaletteType } from "@/hooks/usePixelConverter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const PALETTES: { value: PaletteType; label: string }[] = [
  { value: "original", label: "ORIGINAL COLORS" },
  { value: "gameboy", label: "GAME BOY" },
  { value: "nes", label: "NES PALETTE" },
  { value: "bw", label: "BLACK & WHITE" },
  { value: "cga", label: "CGA (CYAN/MAGENTA)" },
];

export function PixelConverter() {
  const [pixelSize, setPixelSize] = useState(10);
  const [palette, setPalette] = useState<PaletteType>("original");
  const { canvasRef, originalImage, isProcessing, handleImageUpload, processImage, downloadImage, clearImage } = usePixelConverter();

  useEffect(() => {
    if (originalImage) {
      processImage(pixelSize, palette);
    }
  }, [pixelSize, palette, originalImage, processImage]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("PLEASE SELECT AN IMAGE FILE");
        return;
      }
      handleImageUpload(file);
      toast.success("IMAGE LOADED!");
    }
  }, [handleImageUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("PLEASE DROP AN IMAGE FILE");
        return;
      }
      handleImageUpload(file);
      toast.success("IMAGE LOADED!");
    }
  }, [handleImageUpload]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDownload = useCallback(() => {
    downloadImage();
    toast.success("8-BIT IMAGE DOWNLOADED!");
  }, [downloadImage]);

  const handleClear = useCallback(() => {
    clearImage();
    toast("IMAGE CLEARED");
  }, [clearImage]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Button */}
      <div className="flex justify-center">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />
          <div className="flex items-center gap-3 px-8 py-4 bg-card border-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all box-glow-pink">
            <Upload className="w-5 h-5" />
            <span className="text-xs">SELECT IMAGE</span>
          </div>
        </label>
      </div>

      {/* Settings (shown when image is loaded) */}
      {originalImage && (
        <div className="space-y-6 p-6 bg-card border-4 border-secondary animate-pixel-fade-in">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary text-glow-cyan">PIXEL SIZE</span>
              <span className="text-xs text-primary text-glow-pink">{pixelSize}px</span>
            </div>
            <Slider
              value={[pixelSize]}
              onValueChange={(value) => setPixelSize(value[0])}
              min={2}
              max={40}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <span className="text-xs text-secondary text-glow-cyan">COLOR PALETTE</span>
            <Select value={palette} onValueChange={(v) => setPalette(v as PaletteType)}>
              <SelectTrigger className="w-full bg-muted border-2 border-primary/50 text-xs h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-2 border-primary">
                {PALETTES.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div
        className="relative w-full aspect-video bg-arcade-dark border-4 border-foreground/30 overflow-hidden scanlines"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {!originalImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ImageIcon className="w-16 h-16 opacity-50" />
            <p className="text-xs animate-pulse-glow">UPLOAD AN IMAGE TO START</p>
            <p className="text-[10px] opacity-50">OR DRAG & DROP HERE</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        )}
        
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-xs text-primary animate-blink">PROCESSING...</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {originalImage && (
        <div className="flex justify-center gap-4 animate-pixel-fade-in">
          <Button
            onClick={handleDownload}
            className="px-8 py-6 bg-neon-green text-arcade-dark border-4 border-neon-green hover:bg-transparent hover:text-neon-green text-xs"
          >
            <Download className="w-4 h-4 mr-2" />
            DOWNLOAD 8-BIT
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="px-8 py-6 border-4 border-destructive text-destructive hover:bg-destructive hover:text-foreground text-xs"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            CLEAR
          </Button>
        </div>
      )}
    </div>
  );
}
