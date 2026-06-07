import React, { useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../store/canvas';

const FrameThumbnail: React.FC<{ frameIndex: number; onClick: () => void; isActive: boolean }> = ({ frameIndex, onClick, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { frames, canvas, getCompositePixels } = useCanvasStore();
  const frame = frames[frameIndex];
  const thumbSize = 4;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !frame) return;
    const compositePixels = getCompositePixels(frame.layers);
    ctx.clearRect(0, 0, canvas.width * thumbSize, canvas.height * thumbSize);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const c = compositePixels[y][x];
        ctx.fillStyle = c === 'transparent' ? (x + y) % 2 === 0 ? '#f0f0f0' : '#e0e0e0' : c;
        ctx.fillRect(x * thumbSize, y * thumbSize, thumbSize, thumbSize);
      }
    }
  }, [frame, canvas, getCompositePixels]);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6px',
        borderRadius: '6px',
        cursor: 'pointer',
        background: isActive ? '#37474f' : 'transparent',
        border: isActive ? '2px solid #4fc3f7' : '2px solid transparent',
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvas.width * thumbSize}
        height={canvas.height * thumbSize}
        style={{ imageRendering: 'pixelated', borderRadius: '2px' }}
      />
      <span style={{ fontSize: '10px', marginTop: '4px', color: isActive ? '#4fc3f7' : '#90a4ae' }}>
        {frameIndex + 1}
      </span>
    </div>
  );
};

export const AnimationPanel: React.FC = () => {
  const {
    frames,
    currentFrame,
    setCurrentFrame,
    addFrame,
    deleteFrame,
    duplicateFrame,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setPlaybackSpeed,
    nextFrame,
    prevFrame,
  } = useCanvasStore();

  const playIntervalRef = useRef<number | null>(null);

  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  const startPlayback = useCallback(() => {
    stopPlayback();
    if (frames.length <= 1) return;
    playIntervalRef.current = window.setInterval(() => {
      const state = useCanvasStore.getState();
      const next = (state.currentFrame + 1) % state.frames.length;
      state.setCurrentFrame(next);
    }, Math.max(50, 200 / playbackSpeed));
  }, [stopPlayback, playbackSpeed, frames.length]);

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    } else {
      stopPlayback();
    }
    return () => stopPlayback();
  }, [isPlaying, startPlayback, stopPlayback]);

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    }
  }, [playbackSpeed, isPlaying, startPlayback]);

  return (
    <div style={{
      background: '#263238',
      color: '#fff',
      borderTop: '1px solid #37474f',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid #37474f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>动画帧</span>
          <span style={{ fontSize: '11px', color: '#90a4ae', background: '#37474f', padding: '2px 6px', borderRadius: '10px' }}>
            {currentFrame + 1} / {frames.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => addFrame(false)}
            style={buttonStyle}
            title="新建空白帧"
          >
            + 空白
          </button>
          <button
            onClick={() => addFrame(true)}
            style={buttonStyle}
            title="复制当前帧"
          >
            + 复制
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        gap: '8px',
        borderBottom: '1px solid #37474f',
      }}>
        <button
          onClick={prevFrame}
          style={controlButtonStyle}
          title="上一帧"
        >
          ⏮
        </button>
        <button
          onClick={togglePlay}
          style={{ ...controlButtonStyle, background: isPlaying ? '#e53935' : '#43a047', width: '40px' }}
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={nextFrame}
          style={controlButtonStyle}
          title="下一帧"
        >
          ⏭
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#90a4ae' }}>速度:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            style={{
              background: '#37474f',
              color: '#fff',
              border: '1px solid #546e7a',
              borderRadius: '4px',
              padding: '4px 6px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px',
        overflowX: 'auto',
        minHeight: '80px',
      }}>
        {frames.map((frame, index) => (
          <div key={frame.id} style={{ position: 'relative' }}>
            <FrameThumbnail
              frameIndex={index}
              onClick={() => setCurrentFrame(index)}
              isActive={index === currentFrame}
            />
            {frames.length > 1 && (
              <div style={{ position: 'absolute', top: '2px', right: '2px', display: 'flex', gap: '2px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateFrame(index); }}
                  style={iconButtonStyle}
                  title="复制帧"
                >
                  📋
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFrame(index); }}
                  style={{ ...iconButtonStyle, color: '#ef5350' }}
                  title="删除帧"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  background: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '11px',
};

const controlButtonStyle: React.CSSProperties = {
  background: '#37474f',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: '14px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const iconButtonStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.6)',
  border: 'none',
  borderRadius: '3px',
  padding: '2px 4px',
  cursor: 'pointer',
  fontSize: '10px',
  color: '#fff',
  opacity: 0.8,
};
