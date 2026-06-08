import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvas';

export const ClearCanvasConfirmModal: React.FC = () => {
  const { clearCanvasConfirmOpen, toggleClearCanvasConfirm, clearCanvas, clearAllLayers, layers, currentLayerId } = useCanvasStore();
  const [scope, setScope] = useState<'current' | 'all'>('current');

  if (!clearCanvasConfirmOpen) return null;

  const currentLayer = layers.find(l => l.id === currentLayerId);
  const hasMultipleLayers = layers.length > 1;
  const layerName = currentLayer?.name || '当前图层';

  const handleConfirm = () => {
    if (scope === 'all') {
      clearAllLayers();
    } else {
      clearCanvas();
      toggleClearCanvasConfirm();
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
        width: '380px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px' }}>⚠️</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>清空画布</h2>
        </div>

        <div style={{
          background: 'rgba(198, 40, 40, 0.1)',
          border: '1px solid rgba(198, 40, 40, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '13px', color: '#ef9a9a', lineHeight: '1.5' }}>
            此操作将清除画布上的所有像素内容，且无法恢复。请确认您已保存需要保留的作品。
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', marginBottom: '8px', color: '#b0bec5' }}>清除范围</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setScope('current')}
              style={{
                padding: '10px 14px',
                background: scope === 'current' ? 'rgba(198, 40, 40, 0.2)' : '#37474f',
                color: '#fff',
                border: scope === 'current' ? '1px solid #ef5350' : '1px solid #455a64',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>仅当前图层</div>
              <div style={{ fontSize: '11px', color: '#90a4ae' }}>清除「{layerName}」的内容</div>
            </button>
            {hasMultipleLayers && (
              <button
                onClick={() => setScope('all')}
                style={{
                  padding: '10px 14px',
                  background: scope === 'all' ? 'rgba(198, 40, 40, 0.2)' : '#37474f',
                  color: '#fff',
                  border: scope === 'all' ? '1px solid #ef5350' : '1px solid #455a64',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>所有图层</div>
                <div style={{ fontSize: '11px', color: '#90a4ae' }}>清除当前帧全部 {layers.length} 个图层的内容</div>
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={toggleClearCanvasConfirm}
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
            onClick={handleConfirm}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(183, 28, 28, 0.4)',
            }}
          >
            确认清空
          </button>
        </div>
      </div>
    </div>
  );
};
