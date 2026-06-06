import { create } from 'zustand';
import { Tool, AnimationFrame, PixelCanvas } from '../types';

interface CanvasState {
  canvas: PixelCanvas;
  tool: Tool;
  color: string;
  zoom: number;
  frames: AnimationFrame[];
  currentFrame: number;
  history: string[][][];
  historyIndex: number;
  setTool: (t: Tool) => void;
  setColor: (c: string) => void;
  setZoom: (z: number) => void;
  setPixel: (x: number, y: number) => void;
  clearCanvas: () => void;
  undo: () => void;
  addFrame: () => void;
  setCurrentFrame: (i: number) => void;
  resizeCanvas: (w: number, h: number) => void;
}

const emptyPixels = (w: number, h: number) => Array.from({ length: h }, () => Array(w).fill('transparent'));

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvas: { width: 32, height: 32, pixels: emptyPixels(32, 32) },
  tool: 'pen', color: '#000000', zoom: 16, frames: [], currentFrame: 0,
  history: [], historyIndex: -1,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setZoom: (zoom) => set({ zoom }),
  setPixel: (x, y) => {
    const { canvas, color, tool } = get();
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
    const pixels = canvas.pixels.map(r => [...r]);
    if (tool === 'pen') pixels[y][x] = color;
    else if (tool === 'eraser') pixels[y][x] = 'transparent';
    else if (tool === 'fill') {
      const target = pixels[y][x];
      const stack = [[x, y]];
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
        if (pixels[cy][cx] !== target) continue;
        pixels[cy][cx] = color;
        stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
      }
    }
    const prev = get().history.slice(0, get().historyIndex + 1);
    set({ canvas: { ...canvas, pixels }, history: [...prev, canvas.pixels], historyIndex: prev.length });
  },
  clearCanvas: () => {
    const { canvas } = get();
    set({ canvas: { ...canvas, pixels: emptyPixels(canvas.width, canvas.height) } });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) set({ canvas: { ...get().canvas, pixels: history[historyIndex - 1] }, historyIndex: historyIndex - 1 });
  },
  addFrame: () => set({ frames: [...get().frames, { id: Date.now().toString(), pixels: emptyPixels(get().canvas.width, get().canvas.height), duration: 200 }] }),
  setCurrentFrame: (i) => set({ currentFrame: i }),
  resizeCanvas: (w, h) => set({ canvas: { width: w, height: h, pixels: emptyPixels(w, h) }, history: [], historyIndex: -1 }),
}));
