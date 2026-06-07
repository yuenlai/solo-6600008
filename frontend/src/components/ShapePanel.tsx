import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvas';

type ShapeType = 'rect' | 'line';

export const ShapePanel: React.FC = () => {
  const { canvas, color, drawRect, drawLine } = useCanvasStore();
  const [shapeType, setShapeType] = useState<ShapeType>('rect');
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [fill, setFill] = useState(false);
  const [x2, setX2] = useState(8);
  const [y2, setY2] = useState(8);

  const handleDraw = () => {
    if (shapeType === 'rect') {
      drawRect(x, y, width, height, fill);
    } else {
      drawLine(x, y, x2, y2);
    }
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
        形状绘制
      </div>
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
    </div>
  );
};
