import React, { useState, useMemo } from 'react';
import { useCanvasStore } from '../store/canvas';

const SCALE_PRESETS = [
  { scale: 0.25, label: '1/4x' },
  { scale: 0.5, label: '1/2x' },
  { scale: 1, label: '1x (原尺寸)' },
  { scale: 2, label: '2x' },
  { scale: 3, label: '3x' },
  { scale: 4, label: '4x' },
  { scale: 8, label: '8x' },
];

export const ResizeCanvasModal: React.FC = () => {
  const { resizeCanvasModalOpen, toggleResizeCanvasModal, scaleCanvas, canvas } = useCanvasStore();
  const [selectedScale, setSelectedScale] = useState(1);
  const [customScale, setCustomScale] = useState('');

  const newSize = useMemo(() => {
    const scale = customScale ? parseFloat(customScale) : selectedScale;
    if (isNaN(scale) || scale <= 0) return { width: canvas.width, height: canvas.height };
    return {
      width: Math.max(1, Math.round(canvas.width * scale)),
      height: Math.max(1, Math.round(canvas.height * scale)),
    };
  }, [selectedScale, customScale, canvas]);

  if (!resizeCanvasModalOpen) return null;

  const handleScale = () => {
    const scale = customScale ? parseFloat(customScale) : selectedScale;
    if (!isNaN(scale) && scale > 0) {
      scaleCanvas(scale);
    }
  };

  const handleCustomScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomScale(e.target.value);
    setSelectedScale(1);
  };

  const handlePresetClick = (scale: number) => {
    setSelectedScale(scale);
    setCustomScale('');
  };

  const maxSize = Math.max(newSize.width, newSize.height);
  const previewScale = Math.min(180 / maxSize, 10);
  const previewWidth = newSize.width * previewScale;
  const previewHeight = newSize.height * previewScale;

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
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>缩放画布</h2>

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
              {newSize.width} × {newSize.height} 像素
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#b0bec5' }}>当前尺寸</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{canvas.width} × {canvas.height} 像素</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#b0bec5' }}>缩放倍数</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SCALE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.scale)}
                style={{
                  padding: '6px 12px',
                  background: (selectedScale === preset.scale && !customScale) ? '#1565c0' : '#37474f',
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

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#b0bec5' }}>
            自定义倍数
          </label>
          <input
            type="number"
            min="0.1"
            max="16"
            step="0.1"
            value={customScale}
            onChange={handleCustomScaleChange}
            placeholder="输入自定义缩放倍数"
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

        <div style={{ fontSize: '12px', color: '#90a4ae', marginBottom: '20px' }}>
          💡 使用最近邻插值算法，保留清晰的像素块边界
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={toggleResizeCanvasModal}
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
            onClick={handleScale}
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
            应用缩放
          </button>
        </div>
      </div>
    </div>
  );
};
