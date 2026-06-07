import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvas';

const PRESETS = [
  { width: 16, height: 16, label: '16×16' },
  { width: 32, height: 32, label: '32×32' },
  { width: 64, height: 64, label: '64×64' },
  { width: 128, height: 128, label: '128×128' },
  { width: 256, height: 256, label: '256×256' },
  { width: 16, height: 32, label: '16×32' },
  { width: 32, height: 16, label: '32×16' },
  { width: 24, height: 32, label: '24×32' },
];

export const NewCanvasModal: React.FC = () => {
  const { newCanvasModalOpen, toggleNewCanvasModal, createNewCanvas, canvas } = useCanvasStore();
  const [width, setWidth] = useState(canvas.width);
  const [height, setHeight] = useState(canvas.height);

  if (!newCanvasModalOpen) return null;

  const maxSize = Math.max(width, height);
  const previewScale = Math.min(180 / maxSize, 10);
  const previewWidth = width * previewScale;
  const previewHeight = height * previewScale;

  const handlePreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  const handleCreate = () => {
    if (width > 0 && height > 0 && width <= 512 && height <= 512) {
      createNewCanvas(width, height);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 512) {
      setWidth(val);
    } else if (e.target.value === '') {
      setWidth(1);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 512) {
      setHeight(val);
    } else if (e.target.value === '') {
      setHeight(1);
    }
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
    }}>
      <div style={{
        background: '#263238',
        color: '#fff',
        borderRadius: '12px',
        padding: '24px',
        width: '420px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>新建画布</h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          background: '#1a2328',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <div style={{
            width: previewWidth,
            height: previewHeight,
            background: '#fff',
            border: '2px solid #546e7a',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              bottom: '-24px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '12px',
              color: '#90a4ae',
              whiteSpace: 'nowrap',
            }}>
              {width} × {height} 像素
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#b0bec5' }}>常用尺寸</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.width, preset.height)}
                style={{
                  padding: '6px 12px',
                  background: width === preset.width && height === preset.height ? '#1565c0' : '#37474f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#b0bec5' }}>
              宽度 (px)
            </label>
            <input
              type="number"
              min="1"
              max="512"
              value={width}
              onChange={handleWidthChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#1a2328',
                color: '#fff',
                border: '1px solid #546e7a',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#b0bec5' }}>
              高度 (px)
            </label>
            <input
              type="number"
              min="1"
              max="512"
              value={height}
              onChange={handleHeightChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#1a2328',
                color: '#fff',
                border: '1px solid #546e7a',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={toggleNewCanvasModal}
            style={{
              padding: '10px 20px',
              background: '#37474f',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
};
