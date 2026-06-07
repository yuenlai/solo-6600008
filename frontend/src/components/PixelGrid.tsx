import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '../store/canvas';

export const PixelGrid: React.FC = () => {
  const {
    canvas,
    zoom,
    tool,
    setPixel,
    getCompositePixels,
    layers,
    isPlaying,
    selection,
    selectionPixels,
    setSelection,
    captureSelectionPixels,
    clearSelectionArea,
    setSelectionPosition,
    commitSelectionMove,
    applySelection,
  } = useCanvasStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [selectStart, setSelectStart] = useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [tempSelection, setTempSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const isPointInSelection = useCallback(
    (x: number, y: number) => {
      if (!selection) return false;
      return x >= selection.x && x < selection.x + selection.width && y >= selection.y && y < selection.y + selection.height;
    },
    [selection]
  );

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

    if (isDragging && selection && selectionPixels) {
      for (let py = 0; py < selectionPixels.length; py++) {
        for (let px = 0; px < selectionPixels[py].length; px++) {
          const color = selectionPixels[py][px];
          if (color !== 'transparent') {
            const cx = selection.x + px;
            const cy = selection.y + py;
            if (cx >= 0 && cx < canvas.width && cy >= 0 && cy < canvas.height) {
              ctx.fillStyle = color;
              ctx.fillRect(cx * zoom, cy * zoom, zoom, zoom);
            }
          }
        }
      }
    }

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * zoom, 0);
      ctx.lineTo(x * zoom, canvas.height * zoom);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * zoom);
      ctx.lineTo(canvas.width * zoom, y * zoom);
      ctx.stroke();
    }

    const activeSelection = tempSelection || selection;
    if (activeSelection && tool === 'select') {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(
        activeSelection.x * zoom,
        activeSelection.y * zoom,
        activeSelection.width * zoom,
        activeSelection.height * zoom
      );
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
      ctx.fillRect(
        activeSelection.x * zoom,
        activeSelection.y * zoom,
        activeSelection.width * zoom,
        activeSelection.height * zoom
      );
    }
  }, [canvas, zoom, getCompositePixels, layers, selection, selectionPixels, tempSelection, tool, isDragging]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getPixel = (e: React.MouseEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [Math.floor((e.clientX - rect.left) / zoom), Math.floor((e.clientY - rect.top) / zoom)];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPlaying) return;
    const [x, y] = getPixel(e);

    if (tool === 'select') {
      if (selection && isPointInSelection(x, y)) {
        setIsDragging(true);
        setDragOffset([x - selection.x, y - selection.y]);
        captureSelectionPixels();
        clearSelectionArea();
      } else {
        if (isDragging) {
          commitSelectionMove();
          setIsDragging(false);
        }
        applySelection();
        setSelectStart([x, y]);
        setTempSelection({ x, y, width: 1, height: 1 });
      }
      return;
    }

    if (selection) {
      applySelection();
    }
    drawingRef.current = true;
    setPixel(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const [x, y] = getPixel(e);

    if (tool === 'select') {
      if (selectStart) {
        const [startX, startY] = selectStart;
        const minX = Math.min(startX, x);
        const maxX = Math.max(startX, x);
        const minY = Math.min(startY, y);
        const maxY = Math.max(startY, y);
        setTempSelection({
          x: minX,
          y: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
        });
      } else if (isDragging && selection) {
        const newX = x - dragOffset[0];
        const newY = y - dragOffset[1];
        setSelectionPosition(newX, newY);
      }
      return;
    }

    if (drawingRef.current && !isPlaying) {
      setPixel(x, y);
    }
  };

  const handleMouseUp = () => {
    if (tool === 'select') {
      if (selectStart && tempSelection) {
        setSelection(tempSelection);
        captureSelectionPixels();
        setTempSelection(null);
        setSelectStart(null);
      }
      if (isDragging) {
        commitSelectionMove();
        setIsDragging(false);
      }
      return;
    }
    drawingRef.current = false;
  };

  const handleMouseLeave = () => {
    if (tool === 'select') {
      if (selectStart && tempSelection) {
        setSelection(tempSelection);
        captureSelectionPixels();
        setTempSelection(null);
        setSelectStart(null);
      }
      if (isDragging) {
        commitSelectionMove();
        setIsDragging(false);
      }
      return;
    }
    drawingRef.current = false;
  };

  const getCursor = () => {
    if (isPlaying) return 'default';
    if (tool === 'select') {
      return 'crosshair';
    }
    return 'crosshair';
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvas.width * zoom}
      height={canvas.height * zoom}
      style={{
        cursor: getCursor(),
        imageRendering: 'pixelated',
        pointerEvents: isPlaying ? 'none' : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};
