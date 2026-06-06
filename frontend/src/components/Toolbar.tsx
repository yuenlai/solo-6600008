import React from 'react';
import { useCanvasStore } from '../store/canvas';
import { Tool } from '../types';

const TOOLS: { key: Tool; label: string }[] = [
  { key: 'pen', label: '✏️' }, { key: 'eraser', label: '🧹' },
  { key: 'fill', label: '🪣' }, { key: 'picker', label: '💉' },
  { key: 'line', label: '📏' }, { key: 'rect', label: '⬜' },
];

const PALETTE = ['#000000','#ffffff','#e53935','#43a047','#1e88e5','#fdd835','#8e24aa','#ff6f00','#00acc1','#795548'];

export const Toolbar: React.FC = () => {
  const { tool, setTool, color, setColor, zoom, setZoom, clearCanvas, undo } = useCanvasStore();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px', background: '#263238', color: '#fff', width: '60px', alignItems: 'center' }}>
      {TOOLS.map(t => (
        <button key={t.key} onClick={() => setTool(t.key)} title={t.key}
          style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none',
            background: tool === t.key ? '#1565c0' : '#37474f', cursor: 'pointer', fontSize: '18px' }}>{t.label}</button>
      ))}
      <div style={{ borderTop: '1px solid #546e7a', width: '100%', paddingTop: '8px' }}>
        {PALETTE.map(c => (
          <div key={c} onClick={() => setColor(c)}
            style={{ width: '28px', height: '28px', margin: '2px auto', borderRadius: '4px', background: c,
              border: color === c ? '3px solid #fff' : '2px solid #546e7a', cursor: 'pointer' }} />
        ))}
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          style={{ width: '32px', height: '32px', margin: '4px auto', display: 'block', cursor: 'pointer' }} />
      </div>
      <div style={{ borderTop: '1px solid #546e7a', width: '100%', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <button onClick={() => setZoom(Math.min(zoom + 4, 40))} style={{ width: '36px', height: '28px', borderRadius: '4px', border: 'none', background: '#37474f', color: '#fff', cursor: 'pointer' }}>+</button>
        <span style={{ fontSize: '10px' }}>{zoom}px</span>
        <button onClick={() => setZoom(Math.max(zoom - 4, 4))} style={{ width: '36px', height: '28px', borderRadius: '4px', border: 'none', background: '#37474f', color: '#fff', cursor: 'pointer' }}>-</button>
      </div>
      <button onClick={undo} style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#37474f', cursor: 'pointer', fontSize: '14px' }}>↩️</button>
      <button onClick={clearCanvas} style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#b71c1c', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
    </div>
  );
};
