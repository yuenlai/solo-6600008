import { create } from 'zustand';
import { Tool, AnimationFrame, PixelCanvas, Layer, Draft } from '../types';

interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
  drafts: Draft[];
  draftPanelOpen: boolean;
  newCanvasModalOpen: boolean;
  selection: Selection | null;
  selectionPixels: string[][] | null;
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
  generateThumbnail: () => string;
  saveDraft: (name: string) => void;
  loadDraft: (id: string) => void;
  deleteDraft: (id: string) => void;
  loadDrafts: () => void;
  toggleDraftPanel: () => void;
  toggleNewCanvasModal: () => void;
  createNewCanvas: (width: number, height: number) => void;
  setSelection: (selection: Selection | null) => void;
  captureSelectionPixels: () => void;
  clearSelectionArea: () => void;
  setSelectionPosition: (x: number, y: number) => void;
  commitSelectionMove: () => void;
  moveSelection: (dx: number, dy: number) => void;
  applySelection: () => void;
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

const DRAFTS_STORAGE_KEY = 'pixel-editor-drafts';

export const useCanvasStore = create<CanvasState>((set, get) => {
  const initialLayer = createLayer(32, 32, '图层 1');
  const initialLayers = [initialLayer];
  const initialFrame = createFrame(initialLayers, 200);

  const loadDraftsFromStorage = (): Draft[] => {
    try {
      const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveDraftsToStorage = (drafts: Draft[]) => {
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.error('Failed to save drafts:', e);
    }
  };

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
    drafts: [],
    draftPanelOpen: false,
    newCanvasModalOpen: false,
    selection: null,
    selectionPixels: null,
    setTool: (tool) => set({ tool, selection: null, selectionPixels: null }),
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
      set({ layers: newLayers, frames: newFrames, selection: null, selectionPixels: null });
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
      set({ canvas: { width: w, height: h }, layers: newLayers, frames: newFrames, currentFrame: 0, currentLayerId: newLayers[0].id, history: [], historyIndex: -1, selection: null, selectionPixels: null });
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
      const compositePixels = get().getCompositePixels();
      const height = compositePixels.length;
      const width = compositePixels[0]?.length || 0;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = width * scale;
      exportCanvas.height = height * scale;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const color = compositePixels[y][x];
          if (color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
      const link = document.createElement('a');
      link.download = `pixel-art-${width}x${height}-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    },
    generateThumbnail: () => {
      const compositePixels = get().getCompositePixels();
      const height = compositePixels.length;
      const width = compositePixels[0]?.length || 0;
      const thumbSize = 64;
      const scale = Math.min(thumbSize / width, thumbSize / height);
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = thumbSize;
      thumbCanvas.height = thumbSize;
      const ctx = thumbCanvas.getContext('2d');
      if (!ctx) return '';
      ctx.imageSmoothingEnabled = false;
      const offsetX = (thumbSize - width * scale) / 2;
      const offsetY = (thumbSize - height * scale) / 2;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const color = compositePixels[y][x];
          if (color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
          }
        }
      }
      return thumbCanvas.toDataURL('image/png');
    },
    saveDraft: (name) => {
      const { canvas, frames, currentFrame, drafts } = get();
      const thumbnail = get().generateThumbnail();
      const now = Date.now();
      const newDraft: Draft = {
        id: now.toString() + Math.random().toString(36).substr(2, 9),
        name: name || `草稿 ${new Date(now).toLocaleString()}`,
        createdAt: now,
        updatedAt: now,
        canvas: { ...canvas },
        frames: JSON.parse(JSON.stringify(frames)),
        currentFrame,
        thumbnail,
      };
      const newDrafts = [newDraft, ...drafts];
      saveDraftsToStorage(newDrafts);
      set({ drafts: newDrafts });
    },
    loadDraft: (id) => {
      const { drafts } = get();
      const draft = drafts.find(d => d.id === id);
      if (!draft) return;
      const targetLayers = deepCloneLayers(draft.frames[draft.currentFrame].layers);
      set({
        canvas: { ...draft.canvas },
        frames: JSON.parse(JSON.stringify(draft.frames)),
        currentFrame: draft.currentFrame,
        layers: targetLayers,
        currentLayerId: targetLayers[0].id,
        history: [],
        historyIndex: -1,
      });
    },
    deleteDraft: (id) => {
      const { drafts } = get();
      const newDrafts = drafts.filter(d => d.id !== id);
      saveDraftsToStorage(newDrafts);
      set({ drafts: newDrafts });
    },
    loadDrafts: () => {
      set({ drafts: loadDraftsFromStorage() });
    },
    toggleDraftPanel: () => {
      set({ draftPanelOpen: !get().draftPanelOpen });
    },
    toggleNewCanvasModal: () => {
      set({ newCanvasModalOpen: !get().newCanvasModalOpen });
    },
    createNewCanvas: (width, height) => {
      const newLayer = createLayer(width, height, '图层 1');
      const newLayers = [newLayer];
      const newFrame = createFrame(newLayers, 200);
      set({
        canvas: { width, height },
        layers: newLayers,
        frames: [newFrame],
        currentFrame: 0,
        currentLayerId: newLayer.id,
        history: [],
        historyIndex: -1,
        newCanvasModalOpen: false,
        selection: null,
        selectionPixels: null,
      });
    },
    setSelection: (selection) => set({ selection }),
    captureSelectionPixels: () => {
      const { selection, layers, currentLayerId, canvas } = get();
      if (!selection) return;
      const layer = layers.find(l => l.id === currentLayerId);
      if (!layer) return;
      const { x, y, width, height } = selection;
      const pixels: string[][] = [];
      for (let py = 0; py < height; py++) {
        const row: string[] = [];
        for (let px = 0; px < width; px++) {
          const cx = x + px;
          const cy = y + py;
          if (cx >= 0 && cx < canvas.width && cy >= 0 && cy < canvas.height) {
            row.push(layer.pixels[cy][cx]);
          } else {
            row.push('transparent');
          }
        }
        pixels.push(row);
      }
      set({ selectionPixels: pixels });
    },
    clearSelectionArea: () => {
      const { selection, layers, currentLayerId, currentFrame, frames, canvas } = get();
      if (!selection) return;
      const newLayers = layers.map(layer => {
        if (layer.id !== currentLayerId) return layer;
        const pixels = layer.pixels.map(r => [...r]);
        for (let py = 0; py < selection.height; py++) {
          for (let px = 0; px < selection.width; px++) {
            const cx = selection.x + px;
            const cy = selection.y + py;
            if (cx >= 0 && cx < canvas.width && cy >= 0 && cy < canvas.height) {
              pixels[cy][cx] = 'transparent';
            }
          }
        }
        return { ...layer, pixels };
      });
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({ layers: newLayers, frames: newFrames });
    },
    setSelectionPosition: (x, y) => {
      const { selection } = get();
      if (!selection) return;
      set({ selection: { ...selection, x, y } });
    },
    commitSelectionMove: () => {
      const { selection, selectionPixels, layers, currentLayerId, currentFrame, frames, canvas } = get();
      if (!selection || !selectionPixels) return;
      const newLayers = layers.map(layer => {
        if (layer.id !== currentLayerId) return layer;
        const pixels = layer.pixels.map(r => [...r]);
        for (let py = 0; py < selectionPixels.length; py++) {
          for (let px = 0; px < selectionPixels[py].length; px++) {
            const cx = selection.x + px;
            const cy = selection.y + py;
            if (cx >= 0 && cx < canvas.width && cy >= 0 && cy < canvas.height) {
              const color = selectionPixels[py][px];
              if (color !== 'transparent') {
                pixels[cy][cx] = color;
              }
            }
          }
        }
        return { ...layer, pixels };
      });
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({ layers: newLayers, frames: newFrames });
    },
    moveSelection: (dx, dy) => {
      const { selection, layers, currentLayerId, currentFrame, frames, selectionPixels, canvas } = get();
      if (!selection || !selectionPixels) return;
      const newX = selection.x + dx;
      const newY = selection.y + dy;
      const newLayers = layers.map(layer => {
        if (layer.id !== currentLayerId) return layer;
        const pixels = layer.pixels.map(r => [...r]);
        for (let py = 0; py < selection.height; py++) {
          for (let px = 0; px < selection.width; px++) {
            const oldCx = selection.x + px;
            const oldCy = selection.y + py;
            if (oldCx >= 0 && oldCx < canvas.width && oldCy >= 0 && oldCy < canvas.height) {
              pixels[oldCy][oldCx] = 'transparent';
            }
          }
        }
        for (let py = 0; py < selectionPixels.length; py++) {
          for (let px = 0; px < selectionPixels[py].length; px++) {
            const newCx = newX + px;
            const newCy = newY + py;
            if (newCx >= 0 && newCx < canvas.width && newCy >= 0 && newCy < canvas.height) {
              pixels[newCy][newCx] = selectionPixels[py][px];
            }
          }
        }
        return { ...layer, pixels };
      });
      const newFrames = frames.map((f, i) =>
        i === currentFrame ? { ...f, layers: deepCloneLayers(newLayers) } : f
      );
      set({
        layers: newLayers,
        frames: newFrames,
        selection: { ...selection, x: newX, y: newY },
      });
    },
    applySelection: () => {
      set({ selection: null, selectionPixels: null });
    },
  };
});
