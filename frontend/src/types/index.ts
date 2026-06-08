export type Tool = 'pen' | 'eraser' | 'fill' | 'picker' | 'line' | 'rect' | 'select' | 'hand';
export type MirrorMode = 'none' | 'horizontal' | 'vertical' | 'both';
export type BackgroundMode = 'checkerboard' | 'white' | 'black' | 'gray' | 'dark' | 'blue' | 'green';

export interface AnimationFrame {
  id: string;
  name: string;
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

export interface PixelTemplate {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  thumbnail: string;
  pixels: string[][];
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
}
