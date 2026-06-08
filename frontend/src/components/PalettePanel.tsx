import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvas';
import { PRESET_PALETTES } from '../data/palettes';

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
};

const getColorLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
};

const ColorSwatch: React.FC<{
  color: string;
  currentColor: string;
  isFavorite: boolean;
  inRecent: boolean;
  inActivePalette: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  size?: number;
  showBadges?: boolean;
}> = ({ color: swatchColor, currentColor, isFavorite, inRecent, inActivePalette, onClick, onContextMenu, size = 28, showBadges = true }) => {
  const isActive = currentColor === swatchColor;
  const luminance = getColorLuminance(swatchColor);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onContextMenu={onContextMenu}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '4px',
        background: swatchColor,
        border: isActive
          ? '2px solid #fff'
          : `2px solid ${luminance > 0.5 ? '#90a4ae' : '#546e7a'}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: isActive
          ? `0 0 8px ${swatchColor}88, 0 0 12px ${swatchColor}44`
          : 'none',
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        boxSizing: 'border-box',
      }}
      title={`${swatchColor}${isFavorite ? ' ⭐已收藏' : ''}${inActivePalette ? ' 🎨当前方案' : ''}\n点击使用 | 右键收藏/取消`}
    >
      {showBadges && isFavorite && (
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          fontSize: '9px',
          lineHeight: 1,
          background: '#ffd54f',
          color: '#333',
          borderRadius: '50%',
          width: '12px',
          height: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }}>★</div>
      )}
      {showBadges && inActivePalette && !isFavorite && (
        <div style={{
          position: 'absolute',
          bottom: '-3px',
          right: '-3px',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#4caf50',
          border: '1px solid #263238',
          pointerEvents: 'none',
        }} />
      )}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: luminance > 0.5 ? '#000' : '#fff',
          fontSize: `${Math.max(10, size * 0.45)}px`,
          fontWeight: 'bold',
          pointerEvents: 'none',
          textShadow: luminance > 0.5
            ? '0 0 4px rgba(255,255,255,0.8)'
            : '0 0 4px rgba(0,0,0,0.8)',
        }}>✓</div>
      )}
    </div>
  );
};

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

  const [hexInput, setHexInput] = useState(color);
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setHexInput(color);
  }, [color]);

  const activePalette = PRESET_PALETTES.find(p => p.name === activePaletteName);
  const activePaletteColors = activePalette ? activePalette.colors : [];

  const applyPalette = (paletteName: string) => {
    setActivePaletteName(activePaletteName === paletteName ? null : paletteName);
  };

  const handleHexSubmit = () => {
    let val = hexInput.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setColor(val.toLowerCase());
    } else {
      setHexInput(color);
    }
  };

  const copyColor = () => {
    navigator.clipboard.writeText(color.toUpperCase()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const rgb = hexToRgb(color);

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
        <div style={{ padding: '12px', borderBottom: '1px solid #37474f' }}>
          <div style={{ fontSize: '12px', marginBottom: '10px', color: '#90caf9', fontWeight: 600 }}>
            🎨 当前颜色
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  background: color,
                  border: '3px solid #fff',
                  boxShadow: `0 0 16px ${color}66, 0 2px 8px rgba(0,0,0,0.3)`,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => setPickerOpen(!pickerOpen)}
                title="点击打开颜色选择器"
              >
                {color === 'transparent' && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 4px 4px',
                  }} />
                )}
              </div>
              {pickerOpen && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  left: '-4px',
                  zIndex: 100,
                }}>
                  <input
                    type="color"
                    value={color === 'transparent' ? '#000000' : color}
                    onChange={e => {
                      setColor(e.target.value);
                      setPickerOpen(false);
                    }}
                    onBlur={() => setTimeout(() => setPickerOpen(false), 150)}
                    autoFocus
                    style={{
                      width: '56px',
                      height: '40px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      border: '2px solid #546e7a',
                      background: 'transparent',
                    }}
                  />
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                onClick={copyColor}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  background: copied ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.06)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  marginBottom: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'background 0.2s',
                }}
                title="点击复制颜色值"
              >
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#fff',
                  letterSpacing: '0.5px',
                }}>
                  {color.toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', color: copied ? '#4caf50' : '#90a4ae', marginLeft: 'auto' }}>
                  {copied ? '✓ 已复制' : '📋'}
                </span>
              </div>
              {rgb && (
                <div style={{
                  fontSize: '11px',
                  color: '#b0bec5',
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                }}>
                  R:{rgb.r} G:{rgb.g} B:{rgb.b}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={hexInput}
              onChange={e => setHexInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleHexSubmit();
                if (e.key === 'Escape') setHexInput(color);
              }}
              onBlur={handleHexSubmit}
              placeholder="#000000"
              style={{
                flex: 1,
                background: '#1a2328',
                color: '#fff',
                border: '1px solid #546e7a',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <button
              onClick={() => setPickerOpen(true)}
              title="打开颜色选择器"
              style={{
                background: '#37474f',
                color: '#fff',
                border: '1px solid #546e7a',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
              }}
            >🎨</button>
          </div>
        </div>

        {favoriteColors.length > 0 && (
          <div style={{ padding: '12px', borderBottom: '1px solid #37474f' }}>
            <div
              onClick={() => toggleSection('favorites')}
              style={{
                fontSize: '12px',
                marginBottom: collapsedSections.favorites ? 0 : '8px',
                color: '#ffd54f',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '10px' }}>{collapsedSections.favorites ? '▶' : '▼'}</span>
              ⭐ 常用颜色 ({favoriteColors.length})
            </div>
            {!collapsedSections.favorites && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {favoriteColors.map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    currentColor={color}
                    isFavorite={true}
                    inRecent={recentColors.includes(c)}
                    inActivePalette={activePaletteColors.includes(c)}
                    onClick={() => setColor(c)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleFavoriteColor(c);
                    }}
                    size={28}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {recentColors.length > 0 && (
          <div style={{ padding: '12px', borderBottom: '1px solid #37474f' }}>
            <div
              onClick={() => toggleSection('recent')}
              style={{
                fontSize: '12px',
                marginBottom: collapsedSections.recent ? 0 : '8px',
                color: '#90caf9',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '10px' }}>{collapsedSections.recent ? '▶' : '▼'}</span>
              🕐 最近使用 ({recentColors.length})
            </div>
            {!collapsedSections.recent && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recentColors.map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    currentColor={color}
                    isFavorite={favoriteColors.includes(c)}
                    inRecent={true}
                    inActivePalette={activePaletteColors.includes(c)}
                    onClick={() => setColor(c)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleFavoriteColor(c);
                    }}
                    size={28}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#90caf9', fontWeight: 600 }}>
            🎨 预设方案
          </div>
          {PRESET_PALETTES.map((palette) => {
            const isCollapsed = collapsedSections[`palette-${palette.name}`];
            const isActive = activePaletteName === palette.name;
            const paletteFavCount = palette.colors.filter(c => favoriteColors.includes(c)).length;
            const paletteRecentCount = palette.colors.filter(c => recentColors.includes(c)).length;

            return (
              <div
                key={palette.name}
                style={{
                  marginBottom: '8px',
                  borderRadius: '6px',
                  background: isActive ? '#37474f' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid #546e7a' : '1px solid transparent',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => applyPalette(palette.name)}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection(`palette-${palette.name}`);
                        }}
                        style={{ fontSize: '10px', color: '#78909c', cursor: 'pointer' }}
                      >
                        {isCollapsed ? '▶' : '▼'}
                      </span>
                      <span>{palette.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {paletteFavCount > 0 && (
                        <span style={{ fontSize: '9px', color: '#ffd54f' }} title={`${paletteFavCount}个已收藏`}>
                          ★{paletteFavCount}
                        </span>
                      )}
                      {paletteRecentCount > 0 && (
                        <span style={{ fontSize: '9px', color: '#90caf9' }} title={`${paletteRecentCount}个最近使用`}>
                          ●{paletteRecentCount}
                        </span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: '10px', color: '#4caf50' }}>✓</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                    {palette.colors.slice(0, isCollapsed ? 6 : undefined).map((c) => (
                      <ColorSwatch
                        key={c}
                        color={c}
                        currentColor={color}
                        isFavorite={favoriteColors.includes(c)}
                        inRecent={recentColors.includes(c)}
                        inActivePalette={isActive}
                        onClick={() => setColor(c)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavoriteColor(c);
                        }}
                        size={20}
                        showBadges={false}
                      />
                    ))}
                    {isCollapsed && palette.colors.length > 6 && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '2px',
                        background: '#37474f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        color: '#90a4ae',
                        border: '1px solid #546e7a',
                      }}>
                        +{palette.colors.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
