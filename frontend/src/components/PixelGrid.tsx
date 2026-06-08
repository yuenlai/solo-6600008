import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '../store/canvas';
import { BackgroundMode } from '../types';

const BACKGROUND_COLORS: Record<BackgroundMode, string | [string, string]> = {
  checkerboard: ['#f0f0f0', '#e0e0e0'],
  white: '#ffffff',
  black: '#000000',
  gray: '#888888',
  dark: '#263238',
  blue: '#1565c0',
  green: '#2e7d32',
};

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
    backgroundMode,
    undo,
    redo,
    getZoomPercentage,
    pickerFeedback,
    setPickerFeedback,
    lastTool,
    setTool,
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
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [zoomIndicatorTimeout, setZoomIndicatorTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

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

    const bg = BACKGROUND_COLORS[backgroundMode];
    if (Array.isArray(bg)) {
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? bg[0] : bg[1];
          ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    } else {
      ctx.fillStyle = bg;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
        }
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
  }, [canvas, zoom, getCompositePixels, layers, selection, selectionPixels, tempSelection, tool, isDragging, onionSkin, getOnionSkinFrames, isPlaying, offsetX, offsetY, backgroundMode]);

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
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
  }, [spacePressed, isPanning, undo, redo]);

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
        const isTransparent = pickedColor === 'transparent';

        const rect = canvasRef.current!.getBoundingClientRect();
        const feedbackX = rect.left + offsetX + x * zoom + zoom / 2;
        const feedbackY = rect.top + offsetY + y * zoom + zoom / 2;

        if (!isTransparent) {
          useCanvasStore.getState().setColor(pickedColor);
        }

        setPickerFeedback({
          visible: true,
          color: isTransparent ? '#888888' : pickedColor,
          x: feedbackX,
          y: feedbackY,
          isTransparent,
        });
        
        setTimeout(() => {
          setPickerFeedback(null);
        }, 1200);
        
        setTimeout(() => {
          const state = useCanvasStore.getState();
          state.setTool(state.lastTool);
        }, 500);
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
    const state = useCanvasStore.getState();
    const isFine = e.shiftKey;
    const step = isFine ? 1 : 2;
    const delta = e.deltaY > 0 ? -step : step;
    const newZoom = Math.max(1, Math.min(64, state.zoom + delta));
    state.setZoom(newZoom);
    
    setShowZoomIndicator(true);
    if (zoomIndicatorTimeout) {
      clearTimeout(zoomIndicatorTimeout);
    }
    const timeout = setTimeout(() => setShowZoomIndicator(false), 800);
    setZoomIndicatorTimeout(timeout);
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
      {showZoomIndicator && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'zoomIndicatorFade 0.2s ease-out',
          }}
        >
          <div style={{ fontSize: '24px', color: '#64b5f6' }}>{getZoomPercentage()}</div>
          <div style={{ fontSize: '12px', color: '#90a4ae' }}>{zoom}px / 像素</div>
        </div>
      )}
      {pickerFeedback && (
        <div
          style={{
            position: 'fixed',
            left: pickerFeedback.x,
            top: pickerFeedback.y,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none',
            zIndex: 1000,
            animation: 'pickerFeedbackPop 0.3s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.85)',
              padding: '10px 14px',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: pickerFeedback.color,
                border: pickerFeedback.isTransparent ? '2px dashed #666' : '2px solid #fff',
                boxShadow: pickerFeedback.isTransparent 
                  ? 'none' 
                  : `0 0 16px ${pickerFeedback.color}80`,
              }}
            />
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: pickerFeedback.isTransparent ? '#90a4ae' : '#fff',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              {pickerFeedback.isTransparent ? '透明' : pickerFeedback.color.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#64b5f6',
              }}
            >
              {pickerFeedback.isTransparent ? '已跳过' : '已选取'}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '-6px',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(0, 0, 0, 0.85)',
            }}
          />
        </div>
      )}
      <style>{`
        @keyframes zoomIndicatorFade {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes pickerFeedbackPop {
          0% {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.8);
          }
          50% {
            transform: translate(-50%, -125%) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -120%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
