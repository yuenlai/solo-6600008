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
    onionSkin,
    getOnionSkinFrames,
    offsetX,
    offsetY,
    setOffset,
    color,
    setColor,
  } = useCanvasStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const [selectStart, setSelectStart] = useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [tempSelection, setTempSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<[number, number]>([0, 0]);
  const [panOffsetStart, setPanOffsetStart] = useState<[number, number]>([0, 0]);
  const [spacePressed, setSpacePressed] = useState(false);

  const isPointInSelection = useCallback(
    (x: number, y: number) => {
      if (!selection) return false;
      return x >= selection.x && x < selection.x + selection.width && y >= selection.y && y < selection.y + selection.height;
    },
    [selection]
  );

  const resizeCanvas = useCallback(() => {
    const canvasEl = canvasRef.current;
    const container = containerRef.current;
    if (!canvasEl || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;
    const ctx = canvasEl.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    canvasEl.style.width = `${rect.width}px`;
    canvasEl.style.height = `${rect.height}px`;
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const canvasEl = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);

    const pixelSize = zoom;
    const startX = offsetX;
    const startY = offsetY;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
        ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
      }
    }

    if (onionSkin.enabled && !isPlaying) {
      const onionFrames = getOnionSkinFrames();
      for (const onionFrame of onionFrames) {
        ctx.globalAlpha = onionFrame.opacity;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const c = onionFrame.pixels[y][x];
            if (c !== 'transparent') {
              if (onionFrame.isPrev) {
                ctx.fillStyle = '#4a90d9';
              } else {
                ctx.fillStyle = '#e74c3c';
              }
              ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    const compositePixels = getCompositePixels();
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const c = compositePixels[y][x];
        if (c !== 'transparent') {
          ctx.fillStyle = c;
          ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
        }
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
              ctx.fillRect(startX + cx * pixelSize, startY + cy * pixelSize, pixelSize, pixelSize);
            }
          }
        }
      }
    }

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x++) {
      ctx.beginPath();
      ctx.moveTo(startX + x * pixelSize, startY);
      ctx.lineTo(startX + x * pixelSize, startY + canvas.height * pixelSize);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y++) {
      ctx.beginPath();
      ctx.moveTo(startX, startY + y * pixelSize);
      ctx.lineTo(startX + canvas.width * pixelSize, startY + y * pixelSize);
      ctx.stroke();
    }

    const activeSelection = tempSelection || selection;
    if (activeSelection && tool === 'select') {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(
        startX + activeSelection.x * pixelSize,
        startY + activeSelection.y * pixelSize,
        activeSelection.width * pixelSize,
        activeSelection.height * pixelSize
      );
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
      ctx.fillRect(
        startX + activeSelection.x * pixelSize,
        startY + activeSelection.y * pixelSize,
        activeSelection.width * pixelSize,
        activeSelection.height * pixelSize
      );
    }
  }, [canvas, zoom, getCompositePixels, layers, selection, selectionPixels, tempSelection, tool, isDragging, onionSkin, getOnionSkinFrames, isPlaying, offsetX, offsetY]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed && !e.repeat) {
        e.preventDefault();
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        if (isPanning) {
          setIsPanning(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed, isPanning]);

  const getPixel = (e: React.MouseEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - offsetX) / zoom);
    const y = Math.floor((e.clientY - rect.top - offsetY) / zoom);
    return [x, y];
  };

  const getCanvasPoint = (e: React.MouseEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const isPanMode = tool === 'hand' || spacePressed;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPlaying) return;

    if (isPanMode) {
      setIsPanning(true);
      const [x, y] = getCanvasPoint(e);
      setPanStart([x, y]);
      setPanOffsetStart([offsetX, offsetY]);
      return;
    }

    const [x, y] = getPixel(e);

    if (tool === 'picker') {
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const compositePixels = getCompositePixels();
        const pickedColor = compositePixels[y][x];
        if (pickedColor !== 'transparent') {
          setColor(pickedColor);
        }
      }
      return;
    }

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
    if (isPanning) {
      const [x, y] = getCanvasPoint(e);
      const dx = x - panStart[0];
      const dy = y - panStart[1];
      setOffset(panOffsetStart[0] + dx, panOffsetStart[1] + dy);
      return;
    }

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
    if (isPanning) {
      setIsPanning(false);
      return;
    }

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
    if (isPanning) {
      setIsPanning(false);
      return;
    }

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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -4 : 4;
    const newZoom = Math.max(4, Math.min(40, zoom + delta));
    useCanvasStore.getState().setZoom(newZoom);
  };

  const getCursor = () => {
    if (isPlaying) return 'default';
    if (isPanning) return 'grabbing';
    if (isPanMode) return 'grab';
    if (tool === 'picker') return 'crosshair';
    if (tool === 'select') return 'crosshair';
    return 'crosshair';
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        style={{
          cursor: getCursor(),
          imageRendering: 'pixelated',
          pointerEvents: isPlaying ? 'none' : 'auto',
          display: 'block',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};
