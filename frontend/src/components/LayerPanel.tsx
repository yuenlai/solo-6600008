import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvas';

export const LayerPanel: React.FC = () => {
  const {
    layers,
    currentLayerId,
    addLayer,
    setCurrentLayer,
    toggleLayerVisibility,
    deleteLayer,
    renameLayer,
  } = useCanvasStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const finishEditing = (id: string) => {
    if (editName.trim()) {
      renameLayer(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div style={{
      width: '200px',
      background: '#263238',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #37474f',
    }}>
      <div style={{
        padding: '12px',
        fontWeight: 'bold',
        borderBottom: '1px solid #37474f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>图层</span>
        <button
          onClick={addLayer}
          style={{
            background: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          + 新建
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            onClick={() => setCurrentLayer(layer.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              marginBottom: '4px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: layer.id === currentLayerId ? '#37474f' : 'transparent',
              border: layer.id === currentLayerId ? '1px solid #546e7a' : '1px solid transparent',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility(layer.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: layer.visible ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0 4px',
                marginRight: '8px',
              }}
              title={layer.visible ? '隐藏图层' : '显示图层'}
            >
              {layer.visible ? '👁' : '▢'}
            </button>
            {editingId === layer.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => finishEditing(layer.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishEditing(layer.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                style={{
                  flex: 1,
                  background: '#1a2328',
                  color: '#fff',
                  border: '1px solid #546e7a',
                  borderRadius: '2px',
                  padding: '2px 4px',
                  fontSize: '13px',
                }}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startEditing(layer.id, layer.name);
                }}
                style={{ flex: 1, fontSize: '13px' }}
              >
                {layer.name}
              </span>
            )}
            {layers.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(layer.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef5350',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 4px',
                  marginLeft: '4px',
                }}
                title="删除图层"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
