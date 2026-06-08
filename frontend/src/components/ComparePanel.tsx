import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvasStore } from '../store/canvas';
import { Draft } from '../types';

export const ComparePanel: React.FC = () => {
  const [, forceUpdate] = useState(0);
  const currentCanvasRef = useRef<HTMLCanvasElement>(null);
  const draftCanvasRef = useRef<HTMLCanvasElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showDiff, setShowDiff] = useState(true);
  const [diffMode, setDiffMode] = useState<'side' | 'diff'>('side');

  const comparePanelOpen = useCanvasStore((s) => s.comparePanelOpen);
  const compareDraft = useCanvasStore((s) => s.compareDraft);
  const toggleComparePanel = useCanvasStore((s) => s.toggleComparePanel);
  const setCompareDraft = useCanvasStore((s) => s.setCompareDraft);
  const getCompositePixelsFromDraft = useCanvasStore((s) => s.getCompositePixelsFromDraft);
  const getPixelDifferences = useCanvasStore((s) => s.getPixelDifferences);

  useEffect(() => {
    if (!comparePanelOpen) return;

    const unsubscribe = useCanvasStore.subscribe(
      (state) => {
        forceUpdate((n) => n + 1);
      }
    );

    return unsubscribe;
  }, [comparePanelOpen]);

  const getCurrentPixels = useCallback((): string[][] => {
    const state = useCanvasStore.getState();
    const { canvas, frames, currentFrame, layers } = state;
    const composite: string[][] = [];
    const height = canvas.height;
    const width = canvas.width;
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      for (let x = 0; x < width; x++) {
        row.push('transparent');
      }
      composite.push(row);
    }
    const targetLayers = frames[currentFrame]?.layers || layers;
    for (const layer of targetLayers) {
      if (!layer.visible) continue;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (layer.pixels[y] && layer.pixels[y][x] !== 'transparent') {
            composite[y][x] = layer.pixels[y][x];
          }
        }
      }
    }
    return composite;
  }, []);

  const getDraftPixels = useCallback((draft: Draft): string[][] => {
    return getCompositePixelsFromDraft(draft);
  }, [getCompositePixelsFromDraft]);

  const getDifferences = useCallback((p1: string[][], p2: string[][]): boolean[][] => {
    return getPixelDifferences(p1, p2);
  }, [getPixelDifferences]);

  const currentPixels = getCurrentPixels();
  const draftPixels = compareDraft ? getDraftPixels(compareDraft) : [];
  const differences = currentPixels.length && draftPixels.length
    ? getDifferences(currentPixels, draftPixels)
    : [];
  const diffCount = differences.flat().filter(Boolean).length;

  const drawPixels = (
    canvas: HTMLCanvasElement | null,
    pixels: string[][],
    highlightDiff?: boolean,
    diffMap?: boolean[][]
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const height = pixels.length;
    const width = pixels[0]?.length || 0;
    const pixelSize = Math.max(4, Math.min(16, Math.floor(300 / Math.max(width, height))));

    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;

    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = pixels[y]?.[x] || 'transparent';
        if (color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        } else {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#c0c0c0';
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }

        if (highlightDiff && diffMap?.[y]?.[x]) {
          ctx.strokeStyle = '#ff4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(x * pixelSize + 1, y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
        }
      }
    }
  };

  const drawDiffOnly = (
    canvas: HTMLCanvasElement | null,
    currPixels: string[][],
    drPixels: string[][],
    diffMap: boolean[][]
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const height = diffMap.length;
    const width = diffMap[0]?.length || 0;
    const pixelSize = Math.max(4, Math.min(16, Math.floor(400 / Math.max(width, height))));

    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;

    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isDiff = diffMap[y]?.[x];
        if (isDiff) {
          const currentColor = currPixels[y]?.[x] || 'transparent';
          const draftColor = drPixels[y]?.[x] || 'transparent';

          if (currentColor !== 'transparent' && draftColor === 'transparent') {
            ctx.fillStyle = 'rgba(76, 175, 80, 0.7)';
          } else if (currentColor === 'transparent' && draftColor !== 'transparent') {
            ctx.fillStyle = 'rgba(244, 67, 54, 0.7)';
          } else {
            ctx.fillStyle = 'rgba(255, 193, 7, 0.7)';
          }
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        } else {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#c0c0c0';
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  };

  useEffect(() => {
    if (!comparePanelOpen || !compareDraft) return;
    
    if (diffMode === 'side') {
      drawPixels(currentCanvasRef.current, currentPixels, showDiff, differences);
      drawPixels(draftCanvasRef.current, draftPixels, showDiff, differences);
    } else {
      drawDiffOnly(diffCanvasRef.current, currentPixels, draftPixels, differences);
    }
  }, [comparePanelOpen, compareDraft, showDiff, diffMode, currentPixels, draftPixels, differences]);

  const handleClose = () => {
    toggleComparePanel();
    setCompareDraft(null);
  };

  if (!comparePanelOpen || !compareDraft) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={handleClose}>
      <div style={{
        width: '900px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        background: '#263238',
        color: '#fff',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #37474f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>版本对比</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #37474f',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#90a4ae' }}>视图模式:</span>
            <button
              onClick={() => setDiffMode('side')}
              style={{
                padding: '6px 12px',
                background: diffMode === 'side' ? '#1565c0' : '#546e7a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              并排对比
            </button>
            <button
              onClick={() => setDiffMode('diff')}
              style={{
                padding: '6px 12px',
                background: diffMode === 'diff' ? '#1565c0' : '#546e7a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              差异视图
            </button>
          </div>
          {diffMode === 'side' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#90a4ae', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showDiff}
                onChange={(e) => setShowDiff(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              高亮差异
            </label>
          )}
          <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#ff9800', fontWeight: 'bold' }}>
            共 {diffCount} 处差异
          </div>
        </div>

        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
        }}>
          {diffMode === 'side' ? (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#4caf50',
                }}>
                  当前版本
                </div>
                <div style={{
                  background: '#1a2328',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'inline-block',
                }}>
                  <canvas
                    ref={currentCanvasRef}
                    style={{
                      imageRendering: 'pixelated',
                      display: 'block',
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#90a4ae',
              }}>
                VS
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#2196f3',
                }}>
                  {compareDraft.name}
                </div>
                <div style={{ fontSize: '12px', color: '#90a4ae', marginBottom: '8px' }}>
                  {formatDate(compareDraft.updatedAt)}
                </div>
                <div style={{
                  background: '#1a2328',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'inline-block',
                }}>
                  <canvas
                    ref={draftCanvasRef}
                    style={{
                      imageRendering: 'pixelated',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#ff9800',
              }}>
                差异视图
              </div>
              <div style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '12px',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '16px', height: '16px', background: 'rgba(76, 175, 80, 0.7)', borderRadius: '2px' }}></span>
                  新增像素
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '16px', height: '16px', background: 'rgba(244, 67, 54, 0.7)', borderRadius: '2px' }}></span>
                  删除像素
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '16px', height: '16px', background: 'rgba(255, 193, 7, 0.7)', borderRadius: '2px' }}></span>
                  颜色变更
                </span>
              </div>
              <div style={{
                background: '#1a2328',
                padding: '12px',
                borderRadius: '8px',
                display: 'inline-block',
              }}>
                <canvas
                  ref={diffCanvasRef}
                  style={{
                    imageRendering: 'pixelated',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #37474f',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 20px',
              background: '#546e7a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
