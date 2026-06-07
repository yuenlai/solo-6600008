import React from 'react';
import { useCanvasStore } from '../store/canvas';
import { PRESET_PALETTES } from '../data/palettes';

export const PalettePanel: React.FC = () => {
  const {
    color,
    setColor,
    favoriteColors,
    recentColors,
    toggleFavoriteColor,
    activePaletteName,
    setActivePaletteName,
    toggleColorReplaceModal,
  } = useCanvasStore();

  const applyPalette = (paletteName: string) => {
    setActivePaletteName(activePaletteName === paletteName ? null : paletteName);
  };

  const activePalette = PRESET_PALETTES.find(p => p.name === activePaletteName);

  return (
    <div style={{
      width: '200px',
      background: '#263238',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #37474f',
    }}>
      <div style={{
        padding: '12px',
        fontWeight: 'bold',
        borderBottom: '1px solid #37474f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>调色板</span>
        <button
          onClick={toggleColorReplaceModal}
          title="颜色批量替换"
          style={{
            background: '#ff6f00',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          🔄 替换
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {favoriteColors.length > 0 && (
          <div style={{ padding: '12px', borderBottom: '1px solid #37474f' }}>
            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#90caf9' }}>
              ⭐ 常用颜色
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {favoriteColors.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleFavoriteColor(c);
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: c,
                    border: color === c ? '2px solid #fff' : '2px solid #546e7a',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  title={`${c} (右键取消收藏)`}
                />
              ))}
            </div>
          </div>
        )}

        {recentColors.length > 0 && (
          <div style={{ padding: '12px', borderBottom: '1px solid #37474f' }}>
            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#90caf9' }}>
              🕐 最近使用
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {recentColors.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleFavoriteColor(c);
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: c,
                    border: color === c ? '2px solid #fff' : '2px solid #546e7a',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  title={`${c}${favoriteColors.includes(c) ? ' (已收藏)' : ''}\n点击使用 | 右键收藏`}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#90caf9' }}>
            🎨 预设方案
          </div>
          {PRESET_PALETTES.map((palette) => (
            <div
              key={palette.name}
              onClick={() => applyPalette(palette.name)}
              style={{
                marginBottom: '12px',
                padding: '8px',
                borderRadius: '6px',
                background: activePaletteName === palette.name ? '#37474f' : 'transparent',
                border: activePaletteName === palette.name ? '1px solid #546e7a' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{palette.name}</span>
                {activePaletteName === palette.name && (
                  <span style={{ fontSize: '10px', color: '#4caf50' }}>✓ 已应用</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                {palette.colors.slice(0, 8).map((c) => (
                  <div
                    key={c}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColor(c);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavoriteColor(c);
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '2px',
                      background: c,
                      border: color === c ? '2px solid #fff' : '1px solid #546e7a',
                      cursor: 'pointer',
                    }}
                    title={`${c}${favoriteColors.includes(c) ? ' (已收藏)' : ''}\n点击使用 | 右键收藏`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {activePalette && (
          <div style={{ padding: '12px', borderTop: '1px solid #37474f' }}>
            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#90caf9' }}>
              🖌️ {activePalette.name} 全部颜色
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {activePalette.colors.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleFavoriteColor(c);
                  }}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    background: c,
                    border: color === c ? '3px solid #fff' : '2px solid #546e7a',
                    cursor: 'pointer',
                  }}
                  title={`${c}${favoriteColors.includes(c) ? ' (已收藏)' : ''}\n点击使用 | 右键收藏`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
