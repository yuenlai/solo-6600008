import React from 'react';
import { useCanvasStore } from '../store/canvas';
import { Tool, MirrorMode } from '../types';

const MIRROR_MODES: { key: MirrorMode; label: string; title: string }[] = [
  { key: 'none', label: '◯', title: '关闭镜像' },
  { key: 'horizontal', label: '↔', title: '水平镜像' },
  { key: 'vertical', label: '↕', title: '垂直镜像' },
  { key: 'both', label: '✚', title: '双向镜像' },
];

const TOOLS: { key: Tool; label: string }[] = [
  { key: 'pen', label: '✏️' }, { key: 'eraser', label: '🧹' },
  { key: 'fill', label: '🪣' }, { key: 'picker', label: '💉' },
  { key: 'line', label: '📏' }, { key: 'rect', label: '⬜' },
  { key: 'select', label: '🔲' }, { key: 'hand', label: '✋' },
];

const PALETTE = ['#000000','#ffffff','#e53935','#43a047','#1e88e5','#fdd835','#8e24aa','#ff6f00','#00acc1','#795548'];

export const Toolbar: React.FC = () => {
  const { tool, setTool, color, setColor, zoom, setZoom, clearCanvas, undo, exportPNG, toggleDraftPanel, toggleNewCanvasModal, mirrorMode, setMirrorMode } = useCanvasStore();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px', background: '#263238', color: '#fff', width: '60px', alignItems: 'center' }}>
      <button onClick={toggleNewCanvasModal} title="新建画布" style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#7b1fa2', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>➕</button>
      <div style={{ borderTop: '1px solid #546e7a', width: '100%' }} />
      {TOOLS.map(t => (
        <button key={t.key} onClick={() => setTool(t.key)} title={t.key}
          style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none',
            background: tool === t.key ? '#1565c0' : '#37474f', cursor: 'pointer', fontSize: '18px' }}>{t.label}</button>
      ))}
      <div style={{ borderTop: '1px solid #546e7a', width: '100%', paddingTop: '8px' }}>
        <div style={{ fontSize: '10px', marginBottom: '4px', textAlign: 'center' }}>镜像</div>
        {MIRROR_MODES.map(m => (
          <button key={m.key} onClick={() => setMirrorMode(m.key)} title={m.title}
            style={{ width: '32px', height: '32px', borderRadius: '4px', border: 'none', margin: '2px',
              background: mirrorMode === m.key ? '#ff6f00' : '#37474f', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>{m.label}</button>
        ))}
      </div>
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
      <div style={{ borderTop: '1px solid #546e7a', width: '100%', paddingTop: '8px' }}>
        <button onClick={() => exportPNG(1)} title="导出 PNG (1:1)" style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#1565c0', color: '#fff', cursor: 'pointer', fontSize: '18px', marginBottom: '4px' }}>💾</button>
        <button onClick={() => exportPNG(4)} title="导出 PNG (4x)" style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#2e7d32', color: '#fff', cursor: 'pointer', fontSize: '12px', marginBottom: '4px' }}>4x</button>
        <button onClick={toggleDraftPanel} title="本地草稿箱" style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#ff8f00', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>📁</button>
      </div>
    </div>
  );
};
