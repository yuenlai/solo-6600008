import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '../store/canvas';

const FrameThumbnail: React.FC<{ frameIndex: number; small?: boolean }> = ({ frameIndex, small = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { frames, canvas, getCompositePixels } = useCanvasStore();
  const frame = frames[frameIndex];
  const thumbSize = small ? 3 : 4;

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
  }, [frame, canvas, getCompositePixels, thumbSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvas.width * thumbSize}
      height={canvas.height * thumbSize}
      style={{ imageRendering: 'pixelated', borderRadius: '2px' }}
    />
  );
};

const TimelineFrame: React.FC<{
  index: number;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isDragBefore: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onClick: () => void;
  onDurationChange: (duration: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}> = ({
  index,
  isActive,
  isDragging,
  isDragOver,
  isDragBefore,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onDurationChange,
  onDuplicate,
  onDelete,
}) => {
  const { frames } = useCanvasStore();
  const frame = frames[index];
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationInput, setDurationInput] = useState(frame.duration.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingDuration && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingDuration]);

  const handleDurationSubmit = () => {
    const value = parseInt(durationInput);
    if (!isNaN(value) && value > 0) {
      onDurationChange(Math.max(50, Math.min(5000, value)));
    }
    setIsEditingDuration(false);
  };

  const minWidth = 80;
  const durationWidth = Math.max(minWidth, (frame.duration / 200) * 80);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6px 4px',
        borderRadius: '6px',
        cursor: 'grab',
        background: isActive ? '#37474f' : 'transparent',
        border: isActive ? '2px solid #4fc3f7' : '2px solid transparent',
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        minWidth: `${durationWidth}px`,
        flexShrink: 0,
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {isDragOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '3px',
            background: '#4fc3f7',
            borderRadius: '2px',
            left: isDragBefore ? '-2px' : 'auto',
            right: isDragBefore ? 'auto' : '-2px',
          }}
        />
      )}
      <div style={{ position: 'relative' }}>
        <FrameThumbnail frameIndex={index} small />
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          fontSize: '9px',
          background: isActive ? '#4fc3f7' : '#546e7a',
          color: '#fff',
          padding: '1px 4px',
          borderRadius: '8px',
          fontWeight: 'bold',
        }}>
          {index + 1}
        </span>
      </div>

      <div style={{ marginTop: '4px', width: '100%' }}>
        {isEditingDuration ? (
          <input
            ref={inputRef}
            type="number"
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            onBlur={handleDurationSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDurationSubmit();
              if (e.key === 'Escape') setIsEditingDuration(false);
            }}
            onClick={(e) => e.stopPropagation()}
            min={50}
            max={5000}
            step={50}
            style={{
              width: '100%',
              fontSize: '10px',
              background: '#1a2328',
              color: '#4fc3f7',
              border: '1px solid #4fc3f7',
              borderRadius: '3px',
              padding: '2px 4px',
              textAlign: 'center',
            }}
          />
        ) : (
          <div
            onClick={(e) => { e.stopPropagation(); setIsEditingDuration(true); setDurationInput(frame.duration.toString()); }}
            style={{
              fontSize: '10px',
              color: isActive ? '#4fc3f7' : '#90a4ae',
              textAlign: 'center',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '3px',
              background: isActive ? 'rgba(79, 195, 247, 0.1)' : 'transparent',
            }}
            title="点击编辑时长(ms)"
          >
            {frame.duration}ms
          </div>
        )}
      </div>

      {frames.length > 1 && (
        <div style={{ position: 'absolute', top: '2px', left: '2px', display: 'flex', gap: '2px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            style={iconButtonStyle}
            title="复制帧"
          >
            📋
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ ...iconButtonStyle, color: '#ef5350' }}
            title="删除帧"
          >
            ✕
          </button>
        </div>
      )}
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
    onionSkin,
    setOnionSkinEnabled,
    setOnionSkinPrevFrames,
    setOnionSkinNextFrames,
    setOnionSkinOpacity,
    moveFrame,
    setFrameDuration,
  } = useCanvasStore();

  const playTimeoutRef = useRef<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragBefore, setDragBefore] = useState(true);

  const stopPlayback = useCallback(() => {
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
  }, []);

  const startPlayback = useCallback(() => {
    stopPlayback();
    if (frames.length <= 1) return;

    const playNextFrame = () => {
      const state = useCanvasStore.getState();
      const next = (state.currentFrame + 1) % state.frames.length;
      const currentFrameData = state.frames[state.currentFrame];
      const duration = Math.max(50, currentFrameData.duration / state.playbackSpeed);
      state.setCurrentFrame(next);
      playTimeoutRef.current = window.setTimeout(playNextFrame, duration);
    };

    const currentFrameData = frames[currentFrame];
    const duration = Math.max(50, currentFrameData.duration / playbackSpeed);
    playTimeoutRef.current = window.setTimeout(playNextFrame, duration);
  }, [stopPlayback, frames, currentFrame, playbackSpeed]);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    setDragBefore(e.clientX < midX);
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    let finalToIndex = dragBefore ? toIndex : toIndex + 1;
    if (draggedIndex < finalToIndex) {
      finalToIndex -= 1;
    }
    if (draggedIndex !== finalToIndex) {
      moveFrame(draggedIndex, finalToIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const totalDuration = frames.reduce((sum, f) => sum + f.duration, 0);

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
          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>动画时间轴</span>
          <span style={{ fontSize: '11px', color: '#90a4ae', background: '#37474f', padding: '2px 6px', borderRadius: '10px' }}>
            {currentFrame + 1} / {frames.length} 帧
          </span>
          <span style={{ fontSize: '11px', color: '#90a4ae', background: '#37474f', padding: '2px 6px', borderRadius: '10px' }}>
            总时长: {(totalDuration / 1000).toFixed(2)}s
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
        padding: '8px 12px',
        borderBottom: '1px solid #37474f',
        background: '#1e282d',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={() => setOnionSkinEnabled(!onionSkin.enabled)}
            style={{
              ...controlButtonStyle,
              width: 'auto',
              padding: '4px 10px',
              fontSize: '11px',
              height: '28px',
              background: onionSkin.enabled ? '#4caf50' : '#37474f',
            }}
          >
            🧅 洋葱皮 {onionSkin.enabled ? '开' : '关'}
          </button>
        </div>
        {onionSkin.enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#90a4ae', width: '50px' }}>前帧:</span>
              <input
                type="range"
                min="0"
                max="5"
                value={onionSkin.prevFrames}
                onChange={(e) => setOnionSkinPrevFrames(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#4a90d9' }}
              />
              <span style={{ fontSize: '11px', color: '#4a90d9', width: '20px', textAlign: 'right' }}>
                {onionSkin.prevFrames}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#90a4ae', width: '50px' }}>后帧:</span>
              <input
                type="range"
                min="0"
                max="5"
                value={onionSkin.nextFrames}
                onChange={(e) => setOnionSkinNextFrames(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#e74c3c' }}
              />
              <span style={{ fontSize: '11px', color: '#e74c3c', width: '20px', textAlign: 'right' }}>
                {onionSkin.nextFrames}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#90a4ae', width: '50px' }}>透明度:</span>
              <input
                type="range"
                min="10"
                max="80"
                value={Math.round(onionSkin.opacity * 100)}
                onChange={(e) => setOnionSkinOpacity(Number(e.target.value) / 100)}
                style={{ flex: 1, accentColor: '#4fc3f7' }}
              />
              <span style={{ fontSize: '11px', color: '#4fc3f7', width: '20px', textAlign: 'right' }}>
                {Math.round(onionSkin.opacity * 100)}%
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', color: '#4a90d9' }}>■ 前帧</span>
              <span style={{ fontSize: '10px', color: '#e74c3c' }}>■ 后帧</span>
            </div>
          </div>
        )}
      </div>

      <div
        onDragEnd={handleDragEnd}
        style={{
          display: 'flex',
          gap: '2px',
          padding: '12px 8px',
          overflowX: 'auto',
          minHeight: '100px',
          alignItems: 'flex-start',
          background: '#1a2328',
        }}
      >
        {frames.map((frame, index) => (
          <TimelineFrame
            key={frame.id}
            index={index}
            isActive={index === currentFrame}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            isDragBefore={dragBefore}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => setCurrentFrame(index)}
            onDurationChange={(duration) => setFrameDuration(index, duration)}
            onDuplicate={() => duplicateFrame(index)}
            onDelete={() => deleteFrame(index)}
          />
        ))}
      </div>

      <div style={{
        padding: '6px 12px',
        fontSize: '10px',
        color: '#666',
        borderTop: '1px solid #37474f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>💡 拖动帧调整顺序 | 点击时长数字编辑(50-5000ms)</span>
        <span>当前帧: {frames[currentFrame]?.duration || 0}ms</span>
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
