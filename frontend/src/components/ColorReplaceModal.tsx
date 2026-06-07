import React, { useState, useMemo } from 'react';
import { useCanvasStore } from '../store/canvas';

export const ColorReplaceModal: React.FC = () => {
  const { colorReplaceModalOpen, toggleColorReplaceModal, getAllUsedColors, replaceColor } = useCanvasStore();
  const [selectedOldColor, setSelectedOldColor] = useState<string | null>(null);
  const [newColor, setNewColor] = useState('#ff0000');

  const usedColors = useMemo(() => getAllUsedColors(), [colorReplaceModalOpen, getAllUsedColors]);

  if (!colorReplaceModalOpen) return null;

  const handleReplace = () => {
    if (selectedOldColor && newColor) {
      replaceColor(selectedOldColor, newColor);
    }
  };

  const handleClose = () => {
    setSelectedOldColor(null);
    toggleColorReplaceModal();
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
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>颜色批量替换</h2>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#b0bec5' }}>
            选择要替换的颜色
          </div>
          {usedColors.length > 0 ? (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '12px',
              background: '#1a2328',
              borderRadius: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
            }}>
              {usedColors.map((color) => (
                <div
                  key={color}
                  onClick={() => setSelectedOldColor(color)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: color,
                    border: selectedOldColor === color ? '3px solid #fff' : '2px solid #546e7a',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: selectedOldColor === color ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
                  }}
                  title={color}
                />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '20px',
              background: '#1a2328',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#78909c',
              fontSize: '13px',
            }}>
              画布中还没有使用任何颜色
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#b0bec5' }}>
            替换为
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#1a2328',
            borderRadius: '8px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              background: newColor,
              border: '2px solid #546e7a',
            }} />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              style={{
                width: '50px',
                height: '40px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'transparent',
              }}
            />
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#263238',
                color: '#fff',
                border: '1px solid #546e7a',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
          </div>
        </div>

        {selectedOldColor && (
          <div style={{
            marginBottom: '20px',
            padding: '12px',
            background: '#1e3a4f',
            borderRadius: '8px',
            border: '1px solid #2a5a7a',
          }}>
            <div style={{ fontSize: '13px', marginBottom: '8px', color: '#90caf9' }}>
              预览替换效果
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: selectedOldColor,
                  border: '2px solid #546e7a',
                  marginBottom: '4px',
                }} />
                <span style={{ fontSize: '11px', color: '#90a4ae', fontFamily: 'monospace' }}>
                  {selectedOldColor}
                </span>
              </div>
              <span style={{ fontSize: '24px', color: '#90a4ae' }}>→</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: newColor,
                  border: '2px solid #546e7a',
                  marginBottom: '4px',
                }} />
                <span style={{ fontSize: '11px', color: '#90a4ae', fontFamily: 'monospace' }}>
                  {newColor}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
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
            onClick={handleReplace}
            disabled={!selectedOldColor || selectedOldColor === newColor}
            style={{
              padding: '10px 20px',
              background: (!selectedOldColor || selectedOldColor === newColor) ? '#455a64' : '#ff6f00',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: (!selectedOldColor || selectedOldColor === newColor) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            替换
          </button>
        </div>
      </div>
    </div>
  );
};
