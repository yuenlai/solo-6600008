import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvas';
import { Tool, MirrorMode, BackgroundMode } from '../types';

interface ToolInfo {
  key: Tool;
  label: string;
  name: string;
  description: string;
  shortcut: string;
}

const TOOLS: ToolInfo[] = [
  { key: 'pen', label: '✏️', name: '画笔', description: '在画布上绘制像素点', shortcut: 'P' },
  { key: 'eraser', label: '🧹', name: '橡皮擦', description: '擦除画布上的像素', shortcut: 'E' },
  { key: 'fill', label: '🪣', name: '填充', description: '填充相邻的同色区域', shortcut: 'G' },
  { key: 'picker', label: '💉', name: '取色器', description: '从画布上拾取颜色', shortcut: 'I' },
  { key: 'line', label: '📏', name: '直线', description: '绘制直线形状', shortcut: 'L' },
  { key: 'rect', label: '⬜', name: '矩形', description: '绘制矩形形状', shortcut: 'R' },
  { key: 'select', label: '🔲', name: '选择', description: '选择并移动区域', shortcut: 'V' },
  { key: 'hand', label: '✋', name: '抓手', description: '拖动平移画布', shortcut: 'H' },
];

const MIRROR_MODES: { key: MirrorMode; label: string; title: string; description: string }[] = [
  { key: 'none', label: '◯', title: '关闭镜像', description: '禁用镜像绘制' },
  { key: 'horizontal', label: '↔', title: '水平镜像', description: '沿垂直轴对称绘制' },
  { key: 'vertical', label: '↕', title: '垂直镜像', description: '沿水平轴对称绘制' },
  { key: 'both', label: '✚', title: '双向镜像', description: '同时沿两轴对称绘制' },
];

const PALETTE = ['#000000','#ffffff','#e53935','#43a047','#1e88e5','#fdd835','#8e24aa','#ff6f00','#00acc1','#795548'];

const BACKGROUND_MODES: { key: BackgroundMode; label: string; title: string; color: string | [string, string] }[] = [
  { key: 'checkerboard', label: '▦', title: '棋盘格', color: ['#ffffff', '#c0c0c0'] },
  { key: 'white', label: '⬜', title: '白色', color: '#ffffff' },
  { key: 'black', label: '⬛', title: '黑色', color: '#000000' },
  { key: 'gray', label: '🔲', title: '灰色', color: '#888888' },
  { key: 'dark', label: '🌑', title: '深色', color: '#263238' },
  { key: 'blue', label: '🔵', title: '蓝色', color: '#1565c0' },
  { key: 'green', label: '🟢', title: '绿色', color: '#2e7d32' },
];

interface HoverState {
  type: 'tool' | 'action' | 'mirror' | 'background';
  key: string;
  x: number;
  y: number;
}

export const Toolbar: React.FC = () => {
  const { tool, setTool, color, setColor, colorChangedAt, zoom, setZoom, zoomIn, zoomOut, resetZoom, getZoomPercentage, toggleClearCanvasConfirm, undo, redo, canUndo, canRedo, exportPNG, exportMultiSizePNG, toggleDraftPanel, toggleNewCanvasModal, toggleResizeCanvasModal, toggleTemplatePanel, mirrorMode, setMirrorMode, backgroundMode, setBackgroundMode, rectFill, setRectFill } = useCanvasStore();
  const [hover, setHover] = useState<HoverState | null>(null);
  const [colorPulseKey, setColorPulseKey] = useState(0);

  const currentTool = TOOLS.find(t => t.key === tool);

  React.useEffect(() => {
    if (colorChangedAt > 0) {
      setColorPulseKey(prev => prev + 1);
    }
  }, [colorChangedAt]);

  const getToolTipContent = () => {
    if (!hover) return null;
    if (hover.type === 'tool') {
      const t = TOOLS.find(x => x.key === hover.key);
      return t ? { name: t.name, description: t.description, shortcut: t.shortcut } : null;
    }
    if (hover.type === 'mirror') {
      const m = MIRROR_MODES.find(x => x.key === hover.key);
      return m ? { name: m.title, description: m.description, shortcut: '' } : null;
    }
    const actionTips: Record<string, { name: string; description: string; shortcut: string }> = {
      new: { name: '新建画布', description: '创建新的像素画布', shortcut: 'Ctrl+N' },
      resize: { name: '缩放画布', description: '调整画布尺寸', shortcut: '' },
      template: { name: '像素模板', description: '从模板库选择', shortcut: '' },
      undo: { name: '撤销', description: '撤销上一步操作', shortcut: 'Ctrl+Z' },
      redo: { name: '重做', description: '重做已撤销的操作', shortcut: 'Ctrl+Y' },
      clear: { name: '清空画布', description: '清除当前图层内容', shortcut: '' },
      export1: { name: '导出 PNG (1x)', description: '导出原始尺寸图片', shortcut: '' },
      export2: { name: '导出 PNG (2x)', description: '导出2倍放大图片', shortcut: '' },
      export4: { name: '导出 PNG (4x)', description: '导出4倍放大图片', shortcut: '' },
      exportAll: { name: '批量导出', description: '同时导出1x/2x/4x尺寸', shortcut: '' },
      draft: { name: '本地草稿箱', description: '查看和管理保存的草稿', shortcut: '' },
    };
    return actionTips[hover.key] || null;
  };

  const tipContent = getToolTipContent();

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: 'linear-gradient(180deg, #263238 0%, #1e2a2f 100%)', color: '#fff', width: '72px', alignItems: 'center', boxShadow: '2px 0 12px rgba(0,0,0,0.3)' }}>
      {currentTool && (
        <div style={{ width: '100%', padding: '10px 8px', background: 'rgba(21, 101, 192, 0.15)', borderRadius: '8px', border: '1px solid rgba(21, 101, 192, 0.3)', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>{currentTool.label}</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64b5f6' }}>{currentTool.name}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#b0bec5', lineHeight: '1.3' }}>{currentTool.description}</div>
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#ffd54f' }}>
            快捷键: <span style={{ background: 'rgba(255,213,79,0.15)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{currentTool.shortcut}</span>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', alignItems: 'center' }}>
        <button
          onClick={toggleNewCanvasModal}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'new', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)', color: '#fff', cursor: 'pointer', fontSize: '18px', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(123, 31, 162, 0.4)' }}
        >➕</button>
        <button
          onClick={toggleResizeCanvasModal}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'resize', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00897b 0%, #00695c 100%)', color: '#fff', cursor: 'pointer', fontSize: '18px', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0, 105, 92, 0.4)' }}
        >🔍</button>
        <button
          onClick={toggleTemplatePanel}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'template', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ef6c00 0%, #e65100 100%)', color: '#fff', cursor: 'pointer', fontSize: '18px', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(230, 81, 0, 0.4)' }}
        >📋</button>
      </div>
      <div style={{ borderTop: '1px solid #455a64', width: '85%', margin: '4px 0' }} />
      {TOOLS.map(t => (
        <button
          key={t.key}
          onClick={() => setTool(t.key)}
          onMouseEnter={(e) => setHover({ type: 'tool', key: t.key, x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{
            width: '44px', height: '44px', borderRadius: '10px', border: tool === t.key ? '2px solid #64b5f6' : '2px solid transparent',
            background: tool === t.key ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' : '#37474f',
            cursor: 'pointer', fontSize: '18px', transition: 'all 0.2s',
            boxShadow: tool === t.key ? '0 0 12px rgba(100, 181, 246, 0.5)' : 'none',
          }}
        >{t.label}</button>
      ))}
      {tool === 'rect' && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
          <button
            onClick={() => setRectFill(!rectFill)}
            title={rectFill ? '当前: 填充矩形 (点击切换为描边)' : '当前: 描边矩形 (点击切换为填充)'}
            style={{
              width: '44px', height: '28px', borderRadius: '6px', border: 'none',
              background: rectFill ? 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)' : '#37474f',
              color: '#fff', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold',
              transition: 'all 0.2s',
              boxShadow: rectFill ? '0 2px 6px rgba(46, 125, 50, 0.4)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px',
            }}
          >
            {rectFill ? ' fill' : ' stroke'}
          </button>
        </div>
      )}
      <div style={{ borderTop: '1px solid #455a64', width: '85%', paddingTop: '8px' }}>
        <div style={{ fontSize: '10px', marginBottom: '6px', textAlign: 'center', color: '#90a4ae', fontWeight: 500 }}>镜像</div>
        {MIRROR_MODES.map(m => (
          <button
            key={m.key}
            onClick={() => setMirrorMode(m.key)}
            onMouseEnter={(e) => setHover({ type: 'mirror', key: m.key, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHover(null)}
            style={{ width: '34px', height: '34px', borderRadius: '6px', border: mirrorMode === m.key ? '2px solid #ffb74d' : '2px solid transparent', margin: '3px',
              background: mirrorMode === m.key ? 'linear-gradient(135deg, #ff8f00 0%, #ef6c00 100%)' : '#37474f', color: '#fff', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
          >{m.label}</button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #455a64', width: '85%', paddingTop: '10px' }}>
        <div style={{ marginBottom: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', marginBottom: '6px', color: '#90a4ae', fontWeight: 500 }}>当前颜色</div>
          <div
            key={`current-${color}-${colorPulseKey}`}
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto 6px auto',
              borderRadius: '10px',
              background: color,
              border: '3px solid #fff',
              boxShadow: `0 0 16px ${color}80, 0 2px 8px rgba(0,0,0,0.3)`,
              animation: 'colorPulse 0.6s ease-out',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              fontFamily: 'monospace',
              color: '#b0bec5',
              whiteSpace: 'nowrap',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              {color.toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '10px', margin: '12px 0 6px 0', textAlign: 'center', color: '#90a4ae', fontWeight: 500 }}>调色板</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', justifyItems: 'center', padding: '0 2px' }}>
          {PALETTE.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{ 
                width: '26px', 
                height: '26px', 
                borderRadius: '6px', 
                background: c,
                border: color === c ? '2px solid #fff' : '2px solid #546e7a', 
                cursor: 'pointer', 
                transition: 'all 0.2s', 
                boxShadow: color === c ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
                transform: color === c ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </div>
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', marginBottom: '4px', color: '#90a4ae', fontWeight: 500 }}>自定义</div>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            style={{ width: '40px', height: '32px', cursor: 'pointer', borderRadius: '6px', border: '2px solid #546e7a', background: 'transparent' }} />
        </div>
      </div>
      <div style={{ borderTop: '1px solid #455a64', width: '85%', paddingTop: '8px' }}>
        <div style={{ fontSize: '10px', marginBottom: '6px', textAlign: 'center', color: '#90a4ae', fontWeight: 500 }}>背景</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', justifyItems: 'center', padding: '0 4px' }}>
          {BACKGROUND_MODES.map(bg => (
            <button
              key={bg.key}
              onClick={() => setBackgroundMode(bg.key)}
              title={bg.title}
              style={{ width: '26px', height: '26px', borderRadius: '4px', border: backgroundMode === bg.key ? '2px solid #fff' : '2px solid transparent',
                background: Array.isArray(bg.color) ? `linear-gradient(45deg, ${bg.color[0]} 25%, ${bg.color[1]} 25%, ${bg.color[1]} 50%, ${bg.color[0]} 50%, ${bg.color[0]} 75%, ${bg.color[1]} 75%)` : bg.color,
                backgroundSize: Array.isArray(bg.color) ? '8px 8px' : 'auto',
                cursor: 'pointer', fontSize: '10px', transition: 'all 0.2s' }}
            >{bg.label}</button>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #455a64', width: '85%', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <div style={{ fontSize: '10px', color: '#90a4ae', fontWeight: 500 }}>缩放</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>
          <button 
            onClick={() => zoomOut()} 
            onContextMenu={(e) => { e.preventDefault(); zoomOut(true); }}
            title="缩小 (右键细粒度)"
            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#37474f', color: '#fff', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >−</button>
          <div 
            onClick={resetZoom}
            title="重置缩放"
            style={{ 
              minWidth: '50px', 
              textAlign: 'center', 
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(100, 181, 246, 0.1)',
              border: '1px solid rgba(100, 181, 246, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#64b5f6', lineHeight: 1.2 }}>{getZoomPercentage()}</div>
            <div style={{ fontSize: '9px', color: '#78909c' }}>{zoom}px</div>
          </div>
          <button 
            onClick={() => zoomIn()} 
            onContextMenu={(e) => { e.preventDefault(); zoomIn(true); }}
            title="放大 (右键细粒度)"
            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#37474f', color: '#fff', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
        </div>
        <input 
          type="range" 
          min="1" 
          max="64" 
          step="1"
          value={zoom} 
          onChange={(e) => setZoom(parseInt(e.target.value))}
          style={{ 
            width: '90%', 
            height: '4px', 
            cursor: 'pointer',
            accentColor: '#64b5f6',
          }} 
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', fontSize: '9px', color: '#546e7a' }}>
          <span>6%</span>
          <span>100%</span>
          <span>400%</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={undo}
          disabled={!canUndo()}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'undo', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', background: canUndo() ? 'linear-gradient(135deg, #546e7a 0%, #455a64 100%)' : '#37474f', cursor: canUndo() ? 'pointer' : 'not-allowed', fontSize: '16px', transition: 'all 0.2s', color: canUndo() ? '#fff' : '#666', opacity: canUndo() ? 1 : 0.5 }}
        >↩️</button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'redo', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', background: canRedo() ? 'linear-gradient(135deg, #546e7a 0%, #455a64 100%)' : '#37474f', cursor: canRedo() ? 'pointer' : 'not-allowed', fontSize: '16px', transition: 'all 0.2s', color: canRedo() ? '#fff' : '#666', opacity: canRedo() ? 1 : 0.5 }}
        >↪️</button>
      </div>
      <button
        onClick={toggleClearCanvasConfirm}
        onMouseEnter={(e) => setHover({ type: 'action', key: 'clear', x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setHover(null)}
        style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)', color: '#fff', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(183, 28, 28, 0.4)' }}
      >🗑️</button>
      <div style={{ borderTop: '1px solid #455a64', width: '85%', paddingTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => exportPNG(1)}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'export1', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '32px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 500, transition: 'all 0.2s' }}
        >1x</button>
        <button
          onClick={() => exportPNG(2)}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'export2', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '32px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 500, transition: 'all 0.2s' }}
        >2x</button>
        <button
          onClick={() => exportPNG(4)}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'export4', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '32px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #1e88e5 0%, #1976d2 100%)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 500, transition: 'all 0.2s' }}
        >4x</button>
        <button
          onClick={() => exportMultiSizePNG()}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'exportAll', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '36px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(27, 94, 32, 0.4)' }}
        >全部</button>
        <button
          onClick={toggleDraftPanel}
          onMouseEnter={(e) => setHover({ type: 'action', key: 'draft', x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHover(null)}
          style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ff8f00 0%, #ef6c00 100%)', color: '#fff', cursor: 'pointer', fontSize: '18px', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(239, 108, 0, 0.4)', marginTop: '4px' }}
        >📁</button>
      </div>
      {tipContent && (
        <div style={{
          position: 'fixed',
          left: '96px',
          top: hover?.y ? hover.y - 10 : 0,
          transform: 'translateY(-50%)',
          background: 'rgba(33, 33, 33, 0.95)',
          color: '#fff',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000,
          pointerEvents: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          minWidth: '160px',
        }}>
          <div style={{ fontWeight: 'bold', color: '#64b5f6', marginBottom: '4px', fontSize: '13px' }}>{tipContent.name}</div>
          <div style={{ color: '#b0bec5', lineHeight: '1.4', marginBottom: '6px' }}>{tipContent.description}</div>
          {tipContent.shortcut && (
            <div style={{ color: '#ffd54f', fontSize: '11px' }}>
              快捷键: <span style={{ background: 'rgba(255,213,79,0.15)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{tipContent.shortcut}</span>
            </div>
          )}
        </div>
      )}
      <style key={`style-${color}-${colorPulseKey}`}>{`
        @keyframes colorPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 16px ${color}80, 0 2px 8px rgba(0,0,0,0.3);
          }
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 32px ${color}cc, 0 0 48px ${color}66, 0 2px 8px rgba(0,0,0,0.3);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 16px ${color}80, 0 2px 8px rgba(0,0,0,0.3);
          }
        }
      `}</style>
    </div>
  );
};
