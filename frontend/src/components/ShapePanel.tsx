import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvas';

type ShapeType = 'rect' | 'line';
type PanelMode = 'shape' | 'outline';

export const ShapePanel: React.FC = () => {
  const { canvas, color, setColor, drawRect, drawLine, addOutline } = useCanvasStore();
  const [shapeType, setShapeType] = useState<ShapeType>('rect');
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [fill, setFill] = useState(false);
  const [x2, setX2] = useState(8);
  const [y2, setY2] = useState(8);
  const [panelMode, setPanelMode] = useState<PanelMode>('shape');
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [outlineThickness, setOutlineThickness] = useState(1);

  const handleDraw = () => {
    if (shapeType === 'rect') {
      drawRect(x, y, width, height, fill);
    } else {
      drawLine(x, y, x2, y2);
    }
  };

  const handleAddOutline = () => {
    addOutline(outlineColor, outlineThickness);
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
      }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          <button
            onClick={() => setPanelMode('shape')}
            style={{
              flex: 1,
              padding: '6px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: panelMode === 'shape' ? '#1565c0' : '#37474f',
              color: '#fff',
              fontSize: '12px',
            }}
          >
            形状
          </button>
          <button
            onClick={() => setPanelMode('outline')}
            style={{
              flex: 1,
              padding: '6px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: panelMode === 'outline' ? '#1565c0' : '#37474f',
              color: '#fff',
              fontSize: '12px',
            }}
          >
            描边
          </button>
        </div>
        {panelMode === 'shape' ? '形状绘制' : '自动描边'}
      </div>

      {panelMode === 'shape' ? (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShapeType('rect')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: shapeType === 'rect' ? '#1565c0' : '#37474f',
                color: '#fff',
                fontSize: '13px',
              }}
            >
              ⬜ 矩形
            </button>
            <button
              onClick={() => setShapeType('line')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: shapeType === 'line' ? '#1565c0' : '#37474f',
                color: '#fff',
                fontSize: '13px',
              }}
            >
              📏 直线
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#b0bec5' }}>起点 X</label>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(Math.max(0, Math.min(canvas.width - 1, parseInt(e.target.value) || 0)))}
              min={0}
              max={canvas.width - 1}
              style={{
                padding: '6px 8px',
                background: '#1a2328',
                border: '1px solid #546e7a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#b0bec5' }}>起点 Y</label>
            <input
              type="number"
              value={y}
              onChange={(e) => setY(Math.max(0, Math.min(canvas.height - 1, parseInt(e.target.value) || 0)))}
              min={0}
              max={canvas.height - 1}
              style={{
                padding: '6px 8px',
                background: '#1a2328',
                border: '1px solid #546e7a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
          </div>

          {shapeType === 'rect' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#b0bec5' }}>宽度</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  style={{
                    padding: '6px 8px',
                    background: '#1a2328',
                    border: '1px solid #546e7a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#b0bec5' }}>高度</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  style={{
                    padding: '6px 8px',
                    background: '#1a2328',
                    border: '1px solid #546e7a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="fill"
                  checked={fill}
                  onChange={(e) => setFill(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="fill" style={{ fontSize: '13px', cursor: 'pointer' }}>填充矩形</label>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#b0bec5' }}>终点 X</label>
                <input
                  type="number"
                  value={x2}
                  onChange={(e) => setX2(Math.max(0, Math.min(canvas.width - 1, parseInt(e.target.value) || 0)))}
                  min={0}
                  max={canvas.width - 1}
                  style={{
                    padding: '6px 8px',
                    background: '#1a2328',
                    border: '1px solid #546e7a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#b0bec5' }}>终点 Y</label>
                <input
                  type="number"
                  value={y2}
                  onChange={(e) => setY2(Math.max(0, Math.min(canvas.height - 1, parseInt(e.target.value) || 0)))}
                  min={0}
                  max={canvas.height - 1}
                  style={{
                    padding: '6px 8px',
                    background: '#1a2328',
                    border: '1px solid #546e7a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
            <div style={{ fontSize: '12px', color: '#b0bec5' }}>当前颜色:</div>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                background: color,
                border: '2px solid #546e7a',
              }}
            />
          </div>

          <button
            onClick={handleDraw}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: '#4caf50',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            绘制到画布
          </button>

          <div style={{ fontSize: '11px', color: '#78909c', textAlign: 'center', paddingTop: '8px' }}>
            画布尺寸: {canvas.width} × {canvas.height} 像素
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: '#e0e0e0' }}>✨ 自动描边功能</div>
            <div style={{ fontSize: '11px', color: '#90a4ae', lineHeight: '1.5' }}>
              为当前图层的所有图案自动添加外轮廓描边，适用于已有像素图案。
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#b0bec5' }}>描边颜色</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={outlineColor}
                onChange={(e) => setOutlineColor(e.target.value)}
                style={{
                  width: '40px',
                  height: '32px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: 'none',
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: '32px',
                  borderRadius: '4px',
                  background: outlineColor,
                  border: '2px solid #546e7a',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#b0bec5' }}>描边粗细: {outlineThickness} 像素</label>
            <input
              type="range"
              min="1"
              max="5"
              value={outlineThickness}
              onChange={(e) => setOutlineThickness(parseInt(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#78909c' }}>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {['#000000', '#ffffff', '#e53935', '#43a047', '#1e88e5', '#fdd835'].map((c) => (
              <button
                key={c}
                onClick={() => setOutlineColor(c)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '4px',
                  background: c,
                  border: outlineColor === c ? '2px solid #fff' : '2px solid #546e7a',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleAddOutline}
            style={{
              padding: '12px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: '#ff6f00',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              marginTop: '8px',
            }}
          >
            🖌️ 一键添加描边
          </button>

          <div style={{ fontSize: '11px', color: '#78909c', textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #37474f' }}>
            画布尺寸: {canvas.width} × {canvas.height} 像素
          </div>
        </div>
      )}
    </div>
  );
};
