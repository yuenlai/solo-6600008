export type Tool = 'pen' | 'eraser' | 'fill' | 'picker' | 'line' | 'rect';

export interface AnimationFrame {
  id: string; pixels: string[][]; duration: number;
}

export interface PixelCanvas {
  width: number; height: number; pixels: string[][];
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
