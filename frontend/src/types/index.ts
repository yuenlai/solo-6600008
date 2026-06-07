export type Tool = 'pen' | 'eraser' | 'fill' | 'picker' | 'line' | 'rect' | 'select';

export interface AnimationFrame {
  id: string;
  layers: Layer[];
  duration: number;
}

export interface PixelCanvas {
  width: number; height: number;
}

export interface Palette {
  name: string; colors: string[];
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  pixels: string[][];
}

export interface Draft {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  canvas: PixelCanvas;
  frames: AnimationFrame[];
  currentFrame: number;
  thumbnail: string;
}
