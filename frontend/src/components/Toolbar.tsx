import React from 'react';
import { useCanvasStore } from '../store/canvas';
import { Tool, MirrorMode, BackgroundMode } from '../types';

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

const BACKGROUND_MODES: { key: BackgroundMode; label: string; title: string; color: string | [string, string] }[] = [
  { key: 'checkerboard', label: '▦', title: '棋盘格', color: ['#f0f0f0', '#e0e0e0'] },
  { key: 'white', label: '⬜', title: '白色', color: '#ffffff' },
  { key: 'black', label: '⬛', title: '黑色', color: '#000000' },
  { key: 'gray', label: '🔲', title: '灰色', color: '#888888' },
  { key: 'dark', label: '🌑', title: '深色', color: '#263238' },
  { key: 'blue', label: '🔵', title: '蓝色', color: '#1565c0' },
  { key: 'green', label: '🟢', title: '绿色', color: '#2e7d32' },
];

export const Toolbar: React.FC = () => {
  const { tool, setTool, color, setColor, zoom, setZoom, clearCanvas, undo, exportPNG, exportMultiSizePNG, toggleDraftPanel, toggleNewCanvasModal, toggleResizeCanvasModal, toggleTemplatePanel, mirrorMode, setMirrorMode, backgroundMode, setBackgroundMode } = useCanvasStore();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px', background: '#263238', color: '#fff', width: '60px', alignItems: 'center' }}>
      <button onClick={toggleNewCanvasModal} title="新建画布" style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#7b1fa2', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>➕</button>
      <button onClick={toggleResizeCanvasModal} title="缩放画布" style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#00897b', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>🔍</button>
      <button onClick={toggleTemplatePanel} title="像素模板" style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#e65100', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>📋</button>
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
      <div style={{ borderTop: '1px solid #546e7a', width: '100%', paddingTop: '8px' }}>
        <div style={{ fontSize: '10px', marginBottom: '4px', textAlign: 'center' }}>背景</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', justifyItems: 'center' }}>
          {BACKGROUND_MODES.map(bg => (
            <button key={bg.key} onClick={() => setBackgroundMode(bg.key)} title={bg.title}
              style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none',
                background: Array.isArray(bg.color) ? `linear-gradient(45deg, ${bg.color[0]} 25%, ${bg.color[1]} 25%, ${bg.color[1]} 50%, ${bg.color[0]} 50%, ${bg.color[0]} 75%, ${bg.color[1]} 75%)` : bg.color,
                backgroundSize: Array.isArray(bg.color) ? '8px 8px' : 'auto',
                boxShadow: backgroundMode === bg.key ? '0 0 0 2px #fff' : 'none',
                cursor: 'pointer', fontSize: '10px' }}>{bg.label}</button>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #546e7a', width: '100%', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <button onClick={() => setZoom(Math.min(zoom + 4, 40))} style={{ width: '36px', height: '28px', borderRadius: '4px', border: 'none', background: '#37474f', color: '#fff', cursor: 'pointer' }}>+</button>
        <span style={{ fontSize: '10px' }}>{zoom}px</span>
        <button onClick={() => setZoom(Math.max(zoom - 4, 4))} style={{ width: '36px', height: '28px', borderRadius: '4px', border: 'none', background: '#37474f', color: '#fff', cursor: 'pointer' }}>-</button>
      </div>
      <button onClick={undo} style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#37474f', cursor: 'pointer', fontSize: '14px' }}>↩️</button>
      <button onClick={clearCanvas} style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#b71c1c', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
      <div style={{ borderTop: '1px solid #546e7a', width: '100%', paddingTop: '8px' }}>
        <button onClick={() => exportPNG(1)} title="导出 PNG (1x)" style={{ width: '40px', height: '32px', borderRadius: '6px', border: 'none', background: '#1565c0', color: '#fff', cursor: 'pointer', fontSize: '12px', marginBottom: '4px' }}>1x</button>
        <button onClick={() => exportPNG(2)} title="导出 PNG (2x)" style={{ width: '40px', height: '32px', borderRadius: '6px', border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer', fontSize: '12px', marginBottom: '4px' }}>2x</button>
        <button onClick={() => exportPNG(4)} title="导出 PNG (4x)" style={{ width: '40px', height: '32px', borderRadius: '6px', border: 'none', background: '#1e88e5', color: '#fff', cursor: 'pointer', fontSize: '12px', marginBottom: '4px' }}>4x</button>
        <button onClick={() => exportMultiSizePNG()} title="批量导出 (1x+2x+4x)" style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', background: '#2e7d32', color: '#fff', cursor: 'pointer', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold' }}>全部</button>
        <button onClick={toggleDraftPanel} title="本地草稿箱" style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: '#ff8f00', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>📁</button>
      </div>
    </div>
  );
};
