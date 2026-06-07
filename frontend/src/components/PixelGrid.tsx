import React, { useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../store/canvas';

export const PixelGrid: React.FC = () => {
  const { canvas, zoom, setPixel, getCompositePixels, layers, isPlaying } = useCanvasStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const compositePixels = getCompositePixels();
    ctx.clearRect(0, 0, canvas.width * zoom, canvas.height * zoom);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const c = compositePixels[y][x];
        ctx.fillStyle = c === 'transparent' ? (x + y) % 2 === 0 ? '#f0f0f0' : '#e0e0e0' : c;
        ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
      }
    }
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x++) { ctx.beginPath(); ctx.moveTo(x*zoom, 0); ctx.lineTo(x*zoom, canvas.height*zoom); ctx.stroke(); }
    for (let y = 0; y <= canvas.height; y++) { ctx.beginPath(); ctx.moveTo(0, y*zoom); ctx.lineTo(canvas.width*zoom, y*zoom); ctx.stroke(); }
  }, [canvas, zoom, getCompositePixels, layers]);

  useEffect(() => { draw(); }, [draw]);

  const getPixel = (e: React.MouseEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [Math.floor((e.clientX - rect.left) / zoom), Math.floor((e.clientY - rect.top) / zoom)];
  };

  return (
    <canvas ref={canvasRef} width={canvas.width * zoom} height={canvas.height * zoom}
      style={{ cursor: isPlaying ? 'default' : 'crosshair', imageRendering: 'pixelated', pointerEvents: isPlaying ? 'none' : 'auto' }}
      onMouseDown={e => { if (!isPlaying) { drawingRef.current = true; const [x, y] = getPixel(e); setPixel(x, y); } }}
      onMouseMove={e => { if (drawingRef.current && !isPlaying) { const [x, y] = getPixel(e); setPixel(x, y); } }}
      onMouseUp={() => drawingRef.current = false}
      onMouseLeave={() => drawingRef.current = false} />
  );
};
