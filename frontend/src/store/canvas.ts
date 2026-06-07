import { create } from 'zustand';
import { Tool, AnimationFrame, PixelCanvas, Layer } from '../types';

interface CanvasState {
  canvas: PixelCanvas;
  tool: Tool;
  color: string;
  zoom: number;
  frames: AnimationFrame[];
  currentFrame: number;
  layers: Layer[];
  currentLayerId: string;
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
  addLayer: () => void;
  setCurrentLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  deleteLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  getCompositePixels: () => string[][];
}

const emptyPixels = (w: number, h: number) => Array.from({ length: h }, () => Array(w).fill('transparent'));

const createLayer = (width: number, height: number, name: string): Layer => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name,
  visible: true,
  pixels: emptyPixels(width, height),
});

export const useCanvasStore = create<CanvasState>((set, get) => {
  const initialLayer = createLayer(32, 32, '图层 1');
  return {
    canvas: { width: 32, height: 32, pixels: emptyPixels(32, 32) },
    tool: 'pen', color: '#000000', zoom: 16, frames: [], currentFrame: 0,
    layers: [initialLayer],
    currentLayerId: initialLayer.id,
    history: [], historyIndex: -1,
    setTool: (tool) => set({ tool }),
    setColor: (color) => set({ color }),
    setZoom: (zoom) => set({ zoom }),
    setPixel: (x, y) => {
      const { canvas, color, tool, layers, currentLayerId } = get();
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
      const newLayers = layers.map(layer => {
        if (layer.id !== currentLayerId) return layer;
        const pixels = layer.pixels.map(r => [...r]);
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
        return { ...layer, pixels };
      });
      const prev = get().history.slice(0, get().historyIndex + 1);
      set({ layers: newLayers, history: [...prev, get().getCompositePixels()], historyIndex: prev.length });
    },
    clearCanvas: () => {
      const { layers, currentLayerId } = get();
      const newLayers = layers.map(layer => {
        if (layer.id !== currentLayerId) return layer;
        return { ...layer, pixels: emptyPixels(layer.pixels[0].length, layer.pixels.length) };
      });
      set({ layers: newLayers });
    },
    undo: () => {
      const { history, historyIndex, layers, canvas } = get();
      if (historyIndex <= 0) return;
      const prevPixels = history[historyIndex - 1];
      const newLayers = layers.map((layer, idx) => {
        if (idx === 0) return { ...layer, pixels: prevPixels };
        return { ...layer, pixels: emptyPixels(canvas.width, canvas.height) };
      });
      set({ layers: newLayers, historyIndex: historyIndex - 1 });
    },
    addFrame: () => set({ frames: [...get().frames, { id: Date.now().toString(), pixels: emptyPixels(get().canvas.width, get().canvas.height), duration: 200 }] }),
    setCurrentFrame: (i) => set({ currentFrame: i }),
    resizeCanvas: (w, h) => {
      const newLayers = get().layers.map(layer => ({
        ...layer,
        pixels: emptyPixels(w, h),
      }));
      set({ canvas: { width: w, height: h, pixels: emptyPixels(w, h) }, layers: newLayers, history: [], historyIndex: -1 });
    },
    addLayer: () => {
      const { canvas, layers } = get();
      const newLayer = createLayer(canvas.width, canvas.height, `图层 ${layers.length + 1}`);
      set({ layers: [...layers, newLayer], currentLayerId: newLayer.id });
    },
    setCurrentLayer: (id) => set({ currentLayerId: id }),
    toggleLayerVisibility: (id) => {
      const newLayers = get().layers.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      );
      set({ layers: newLayers });
    },
    deleteLayer: (id) => {
      const { layers, currentLayerId } = get();
      if (layers.length <= 1) return;
      const newLayers = layers.filter(layer => layer.id !== id);
      const newCurrentLayerId = currentLayerId === id ? newLayers[newLayers.length - 1].id : currentLayerId;
      set({ layers: newLayers, currentLayerId: newCurrentLayerId });
    },
    renameLayer: (id, name) => {
      const newLayers = get().layers.map(layer =>
        layer.id === id ? { ...layer, name } : layer
      );
      set({ layers: newLayers });
    },
    getCompositePixels: () => {
      const { layers, canvas } = get();
      const composite = emptyPixels(canvas.width, canvas.height);
      for (const layer of layers) {
        if (!layer.visible) continue;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            if (layer.pixels[y][x] !== 'transparent') {
              composite[y][x] = layer.pixels[y][x];
            }
          }
        }
      }
      return composite;
    },
  };
});
