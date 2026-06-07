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
  isPlaying: boolean;
  playbackSpeed: number;
  setTool: (t: Tool) => void;
  setColor: (c: string) => void;
  setZoom: (z: number) => void;
  setPixel: (x: number, y: number) => void;
  clearCanvas: () => void;
  undo: () => void;
  addFrame: (copyCurrent?: boolean) => void;
  deleteFrame: (index: number) => void;
  duplicateFrame: (index: number) => void;
  setCurrentFrame: (i: number) => void;
  setFrameDuration: (index: number, duration: number) => void;
  resizeCanvas: (w: number, h: number) => void;
  addLayer: () => void;
  setCurrentLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  deleteLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  getCompositePixels: (layers?: Layer[]) => string[][];
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  nextFrame: () => void;
  prevFrame: () => void;
  exportPNG: (scale?: number) => void;
}

const emptyPixels = (w: number, h: number) => Array.from({ length: h }, () => Array(w).fill('transparent'));

const deepCloneLayers = (layers: Layer[]): Layer[] =>
  layers.map(layer => ({
    ...layer,
    pixels: layer.pixels.map(row => [...row]),
  }));

const createLayer = (width: number, height: number, name: string): Layer => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name,
  visible: true,
  pixels: emptyPixels(width, height),
});

const createFrame = (layers: Layer[], duration: number = 200): AnimationFrame => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  layers: deepCloneLayers(layers),
  duration,
});

export const useCanvasStore = create<CanvasState>((set, get) => {
  const initialLayer = createLayer(32, 32, '图层 1');
  const initialLayers = [initialLayer];
  const initialFrame = createFrame(initialLayers, 200);

  return {
    canvas: { width: 32, height: 32 },
    tool: 'pen', color: '#000000', zoom: 16,
    frames: [initialFrame],
    currentFrame: 0,
    layers: initialLayers,
    currentLayerId: initialLayer.id,
    history: [], historyIndex: -1,
    isPlaying: false,
    playbackSpeed: 1,
    setTool: (tool) => set({ tool }),
    setColor: (color) => set({ color }),
    setZoom: (zoom) => set({ zoom }),
    setPixel: (x, y) => {
      const { canvas, color, tool, layers, currentLayerId, currentFrame, frames } = get();
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
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({ layers: newLayers, frames: newFrames, history: [...get().history.slice(0, get().historyIndex + 1), get().getCompositePixels()], historyIndex: get().historyIndex + 1 });
    },
    clearCanvas: () => {
      const { layers, currentLayerId, currentFrame, frames } = get();
      const newLayers = layers.map(layer => {
        if (layer.id !== currentLayerId) return layer;
        return { ...layer, pixels: emptyPixels(layer.pixels[0].length, layer.pixels.length) };
      });
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({ layers: newLayers, frames: newFrames });
    },
    undo: () => {
      const { history, historyIndex, canvas, currentFrame, frames } = get();
      if (historyIndex <= 0) return;
      const prevPixels = history[historyIndex - 1];
      const newLayers = frames[currentFrame].layers.map((layer, idx) => {
        if (idx === 0) return { ...layer, pixels: prevPixels };
        return { ...layer, pixels: emptyPixels(canvas.width, canvas.height) };
      });
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: newLayers } : f
      );
      set({ layers: newLayers, frames: newFrames, historyIndex: historyIndex - 1 });
    },
    addFrame: (copyCurrent = false) => {
      const { frames, currentFrame, layers, canvas } = get();
      const newLayers = copyCurrent
        ? deepCloneLayers(layers)
        : [createLayer(canvas.width, canvas.height, `图层 1`)];
      const newFrame = createFrame(newLayers, 200);
      const newFrames = [...frames, newFrame];
      set({
        frames: newFrames,
        currentFrame: newFrames.length - 1,
        layers: newLayers,
        currentLayerId: newLayers[0].id,
      });
    },
    deleteFrame: (index: number) => {
      const { frames, currentFrame } = get();
      if (frames.length <= 1) return;
      const newFrames = frames.filter((_, i) => i !== index);
      let newCurrentFrame = currentFrame;
      if (currentFrame >= index) {
        newCurrentFrame = Math.max(0, currentFrame - 1);
      }
      set({
        frames: newFrames,
        currentFrame: newCurrentFrame,
        layers: deepCloneLayers(newFrames[newCurrentFrame].layers),
        currentLayerId: newFrames[newCurrentFrame].layers[0].id,
      });
    },
    duplicateFrame: (index: number) => {
      const { frames } = get();
      const sourceFrame = frames[index];
      const newFrame = createFrame(sourceFrame.layers, sourceFrame.duration);
      const newFrames = [...frames.slice(0, index + 1), newFrame, ...frames.slice(index + 1)];
      set({ frames: newFrames });
    },
    setCurrentFrame: (i) => {
      const { frames } = get();
      if (i < 0 || i >= frames.length) return;
      const targetLayers = deepCloneLayers(frames[i].layers);
      set({
        currentFrame: i,
        layers: targetLayers,
        currentLayerId: targetLayers[0].id,
      });
    },
    setFrameDuration: (index, duration) => {
      const { frames } = get();
      const newFrames = frames.map((f, i) =>
        i === index ? { ...f, duration } : f
      );
      set({ frames: newFrames });
    },
    resizeCanvas: (w, h) => {
      const newLayers = get().layers.map(layer => ({
        ...layer,
        pixels: emptyPixels(w, h),
      }));
      const newFrames = [createFrame(newLayers, 200)];
      set({ canvas: { width: w, height: h }, layers: newLayers, frames: newFrames, currentFrame: 0, currentLayerId: newLayers[0].id, history: [], historyIndex: -1 });
    },
    addLayer: () => {
      const { canvas, layers, currentFrame, frames } = get();
      const newLayer = createLayer(canvas.width, canvas.height, `图层 ${layers.length + 1}`);
      const newLayers = [...layers, newLayer];
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({ layers: newLayers, frames: newFrames, currentLayerId: newLayer.id });
    },
    setCurrentLayer: (id) => set({ currentLayerId: id }),
    toggleLayerVisibility: (id) => {
      const { layers, currentFrame, frames } = get();
      const newLayers = layers.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      );
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({ layers: newLayers, frames: newFrames });
    },
    deleteLayer: (id) => {
      const { layers, currentLayerId, currentFrame, frames } = get();
      if (layers.length <= 1) return;
      const newLayers = layers.filter(layer => layer.id !== id);
      const newCurrentLayerId = currentLayerId === id ? newLayers[newLayers.length - 1].id : currentLayerId;
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({ layers: newLayers, currentLayerId: newCurrentLayerId, frames: newFrames });
    },
    renameLayer: (id, name) => {
      const { layers, currentFrame, frames } = get();
      const newLayers = layers.map(layer =>
        layer.id === id ? { ...layer, name } : layer
      );
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({ layers: newLayers, frames: newFrames });
    },
    getCompositePixels: (inputLayers) => {
      const { layers, canvas } = get();
      const targetLayers = inputLayers || layers;
      const composite = emptyPixels(canvas.width, canvas.height);
      for (const layer of targetLayers) {
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
    togglePlay: () => set({ isPlaying: !get().isPlaying }),
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
    nextFrame: () => {
      const { currentFrame, frames } = get();
      const next = (currentFrame + 1) % frames.length;
      get().setCurrentFrame(next);
    },
    prevFrame: () => {
      const { currentFrame, frames } = get();
      const prev = (currentFrame - 1 + frames.length) % frames.length;
      get().setCurrentFrame(prev);
    },
    exportPNG: (scale = 1) => {
      const { canvas, getCompositePixels } = get();
      const compositePixels = getCompositePixels();
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width * scale;
      exportCanvas.height = canvas.height * scale;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const color = compositePixels[y][x];
          if (color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
      const link = document.createElement('a');
      link.download = `pixel-art-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    },
  };
});
