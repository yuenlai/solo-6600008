import { PixelTemplate, TemplateCategory } from '../types';

const T = 'transparent';

const createThumbnail = (pixels: string[][], scale: number = 4): string => {
  const canvas = document.createElement('canvas');
  const width = pixels[0].length;
  const height = pixels.length;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixels[y][x];
      if (color !== T) {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  return canvas.toDataURL('image/png');
};

const avatarPixels1: string[][] = [
  [T,T,T,'#ffcc99','#ffcc99','#ffcc99','#ffcc99',T,T,T],
  [T,T,'#ffcc99','#ffcc99','#ffcc99','#ffcc99','#ffcc99','#ffcc99',T,T],
  [T,'#ffcc99','#ffcc99','#222222','#ffcc99','#ffcc99','#222222','#ffcc99','#ffcc99',T],
  [T,'#ffcc99','#ffcc99','#222222','#ffcc99','#ffcc99','#222222','#ffcc99','#ffcc99',T],
  [T,'#ffcc99','#ffcc99','#ffcc99','#ffcc99','#ffcc99','#ffcc99','#ffcc99','#ffcc99',T],
  [T,T,'#ffcc99','#ffcc99','#e53935','#e53935','#ffcc99','#ffcc99',T,T],
  [T,T,T,'#ffcc99','#ffcc99','#ffcc99','#ffcc99',T,T,T],
  [T,T,T,T,'#795548','#795548',T,T,T,T],
  [T,T,T,'#795548','#795548','#795548','#795548',T,T,T],
  [T,T,'#795548','#795548',T,T,'#795548','#795548',T,T],
];

const avatarPixels2: string[][] = [
  [T,T,T,'#ffb74d','#ffb74d','#ffb74d','#ffb74d',T,T,T],
  [T,T,'#ffb74d','#ffb74d','#ffb74d','#ffb74d','#ffb74d','#ffb74d',T,T],
  [T,'#ffb74d','#ffb74d','#1565c0','#ffb74d','#ffb74d','#1565c0','#ffb74d','#ffb74d',T],
  [T,'#ffb74d','#ffb74d','#1565c0','#ffb74d','#ffb74d','#1565c0','#ffb74d','#ffb74d',T],
  [T,'#ffb74d','#ffb74d','#ffb74d','#1565c0','#1565c0','#ffb74d','#ffb74d','#ffb74d',T],
  [T,T,'#ffb74d','#ffb74d','#ffb74d','#ffb74d','#ffb74d','#ffb74d',T,T],
  [T,T,T,'#ffb74d','#ffb74d','#ffb74d','#ffb74d',T,T,T],
  [T,T,T,T,'#388e3c','#388e3c',T,T,T,T],
  [T,T,T,'#388e3c','#388e3c','#388e3c','#388e3c',T,T,T],
  [T,T,'#388e3c','#388e3c',T,T,'#388e3c','#388e3c',T,T],
];

const tilePixels1: string[][] = [
  ['#7cb342','#8bc34a','#7cb342','#8bc34a','#7cb342','#8bc34a','#7cb342','#8bc34a'],
  ['#8bc34a','#9ccc65','#8bc34a','#9ccc65','#8bc34a','#9ccc65','#8bc34a','#9ccc65'],
  ['#7cb342','#8bc34a','#7cb342','#8bc34a','#7cb342','#8bc34a','#7cb342','#8bc34a'],
  ['#8bc34a','#9ccc65','#8bc34a','#9ccc65','#8bc34a','#9ccc65','#8bc34a','#9ccc65'],
  ['#689f38','#7cb342','#689f38','#7cb342','#689f38','#7cb342','#689f38','#7cb342'],
  ['#558b2f','#689f38','#558b2f','#689f38','#558b2f','#689f38','#558b2f','#689f38'],
  ['#795548','#8d6e63','#795548','#8d6e63','#795548','#8d6e63','#795548','#8d6e63'],
  ['#6d4c41','#795548','#6d4c41','#795548','#6d4c41','#795548','#6d4c41','#795548'],
];

const tilePixels2: string[][] = [
  ['#90a4ae','#b0bec5','#90a4ae','#b0bec5','#90a4ae','#b0bec5','#90a4ae','#b0bec5'],
  ['#b0bec5','#cfd8dc','#b0bec5','#cfd8dc','#b0bec5','#cfd8dc','#b0bec5','#cfd8dc'],
  ['#90a4ae','#b0bec5','#90a4ae','#b0bec5','#90a4ae','#b0bec5','#90a4ae','#b0bec5'],
  ['#78909c','#90a4ae','#78909c','#90a4ae','#78909c','#90a4ae','#78909c','#90a4ae'],
  ['#607d8b','#78909c','#607d8b','#78909c','#607d8b','#78909c','#607d8b','#78909c'],
  ['#546e7a','#607d8b','#546e7a','#607d8b','#546e7a','#607d8b','#546e7a','#607d8b'],
  ['#455a64','#546e7a','#455a64','#546e7a','#455a64','#546e7a','#455a64','#546e7a'],
  ['#37474f','#455a64','#37474f','#455a64','#37474f','#455a64','#37474f','#455a64'],
];

const itemPixels1: string[][] = [
  [T,T,T,'#ffd700','#ffd700','#ffd700',T,T,T],
  [T,T,'#ffd700','#ffeb3b','#ffeb3b','#ffeb3b','#ffd700',T,T],
  [T,'#ffd700','#ffeb3b','#fff59d','#fff59d','#fff59d','#ffeb3b','#ffd700',T],
  ['#ffd700','#ffeb3b','#fff59d','#ffffff','#ffffff','#ffffff','#fff59d','#ffeb3b','#ffd700'],
  ['#ffd700','#ffeb3b','#fff59d','#ffffff','#ffeb3b','#ffffff','#fff59d','#ffeb3b','#ffd700'],
  ['#ffd700','#ffeb3b','#fff59d','#ffffff','#ffffff','#ffffff','#fff59d','#ffeb3b','#ffd700'],
  [T,'#ffd700','#ffeb3b','#fff59d','#fff59d','#fff59d','#ffeb3b','#ffd700',T],
  [T,T,'#ffd700','#ffeb3b','#ffeb3b','#ffeb3b','#ffd700',T,T],
  [T,T,T,'#ffd700','#ffd700','#ffd700',T,T,T],
];

const itemPixels2: string[][] = [
  [T,T,T,T,'#e53935','#e53935',T,T,T,T],
  [T,T,T,'#e53935','#ef5350','#ef5350','#e53935',T,T,T],
  [T,T,'#e53935','#ef5350','#ff8a80','#ff8a80','#ef5350','#e53935',T,T],
  [T,'#e53935','#ef5350','#ff8a80','#ffcdd2','#ffcdd2','#ff8a80','#ef5350','#e53935',T],
  ['#c62828','#e53935','#ef5350','#ff8a80','#ffcdd2','#ffcdd2','#ff8a80','#ef5350','#e53935','#c62828'],
  ['#c62828','#e53935','#ef5350','#ff8a80','#ff8a80','#ff8a80','#ff8a80','#ef5350','#e53935','#c62828'],
  [T,'#c62828','#e53935','#ef5350','#ef5350','#ef5350','#ef5350','#e53935','#c62828',T],
  [T,T,'#c62828','#e53935','#e53935','#e53935','#e53935','#c62828',T,T],
  [T,T,T,'#b71c1c','#b71c1c','#b71c1c','#b71c1c',T,T,T],
  [T,T,T,T,'#b71c1c','#b71c1c',T,T,T,T],
];

const itemPixels3: string[][] = [
  [T,T,T,T,'#1565c0',T,T,T,T],
  [T,T,T,'#1565c0','#1976d2','#1565c0',T,T,T],
  [T,T,'#1565c0','#1976d2','#2196f3','#1976d2','#1565c0',T,T],
  [T,'#1565c0','#1976d2','#2196f3','#42a5f5','#2196f3','#1976d2','#1565c0',T],
  ['#0d47a1','#1565c0','#1976d2','#2196f3','#42a5f5','#2196f3','#1976d2','#1565c0','#0d47a1'],
  [T,'#0d47a1','#1565c0','#1976d2','#2196f3','#1976d2','#1565c0','#0d47a1',T],
  [T,T,'#0d47a1','#1565c0','#1976d2','#1565c0','#0d47a1',T,T],
  [T,T,T,'#0d47a1','#1565c0','#0d47a1',T,T,T],
  [T,T,T,T,'#0d47a1',T,T,T,T],
];

const itemPixels4: string[][] = [
  [T,T,'#795548',T,T,T,T,'#795548',T,T],
  [T,T,'#8d6e63','#795548',T,T,'#795548','#8d6e63',T,T],
  [T,T,'#795548','#8d6e63','#795548','#795548','#8d6e63','#795548',T,T],
  [T,T,T,'#795548','#8d6e63','#8d6e63','#795548',T,T,T],
  [T,T,T,T,'#795548','#795548',T,T,T,T],
  [T,T,T,T,'#795548','#795548',T,T,T,T],
  [T,T,T,'#795548','#8d6e63','#8d6e63','#795548',T,T,T],
  [T,T,'#795548','#8d6e63','#795548','#795548','#8d6e63','#795548',T,T],
  [T,T,'#8d6e63','#795548',T,T,'#795548','#8d6e63',T,T],
  [T,T,'#795548',T,T,T,T,'#795548',T,T],
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'avatar', name: '头像', icon: '👤' },
  { id: 'tile', name: '地块', icon: '🟩' },
  { id: 'item', name: '道具', icon: '⚔️' },
];

export const TEMPLATES: PixelTemplate[] = [
  {
    id: 'avatar-1',
    name: '笑脸头像',
    category: 'avatar',
    width: 10,
    height: 10,
    thumbnail: '',
    pixels: avatarPixels1,
  },
  {
    id: 'avatar-2',
    name: '惊讶头像',
    category: 'avatar',
    width: 10,
    height: 10,
    thumbnail: '',
    pixels: avatarPixels2,
  },
  {
    id: 'tile-1',
    name: '草地地块',
    category: 'tile',
    width: 8,
    height: 8,
    thumbnail: '',
    pixels: tilePixels1,
  },
  {
    id: 'tile-2',
    name: '石砖地块',
    category: 'tile',
    width: 8,
    height: 8,
    thumbnail: '',
    pixels: tilePixels2,
  },
  {
    id: 'item-1',
    name: '金币',
    category: 'item',
    width: 9,
    height: 9,
    thumbnail: '',
    pixels: itemPixels1,
  },
  {
    id: 'item-2',
    name: '红宝石',
    category: 'item',
    width: 10,
    height: 10,
    thumbnail: '',
    pixels: itemPixels2,
  },
  {
    id: 'item-3',
    name: '蓝宝石',
    category: 'item',
    width: 9,
    height: 9,
    thumbnail: '',
    pixels: itemPixels3,
  },
  {
    id: 'item-4',
    name: '蝴蝶结',
    category: 'item',
    width: 10,
    height: 10,
    thumbnail: '',
    pixels: itemPixels4,
  },
];

export const getTemplatesWithThumbnails = (): PixelTemplate[] => {
  if (typeof document === 'undefined') return TEMPLATES;
  return TEMPLATES.map(template => ({
    ...template,
    thumbnail: createThumbnail(template.pixels),
  }));
};
