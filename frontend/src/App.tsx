import React, { useEffect } from 'react';
import { useCanvasStore } from './store/canvas';
import { Tool } from './types';
import { PixelGrid } from './components/PixelGrid';
import { Toolbar } from './components/Toolbar';
import { LayerPanel } from './components/LayerPanel';
import { ShapePanel } from './components/ShapePanel';
import { PalettePanel } from './components/PalettePanel';
import { AnimationPanel } from './components/AnimationPanel';
import { DraftPanel } from './components/DraftPanel';
import { NewCanvasModal } from './components/NewCanvasModal';
import { ResizeCanvasModal } from './components/ResizeCanvasModal';
import { TemplatePanel } from './components/TemplatePanel';
import { ColorReplaceModal } from './components/ColorReplaceModal';
import { ClearCanvasConfirmModal } from './components/ClearCanvasConfirmModal';
import { ComparePanel } from './components/ComparePanel';

const TOOL_SHORTCUTS: Record<string, Tool> = {
  p: 'pen',
  e: 'eraser',
  g: 'fill',
  i: 'picker',
  l: 'line',
  r: 'rect',
  v: 'select',
  h: 'hand',
};

const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useCanvasStore.getState().undo();
        return;
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        useCanvasStore.getState().redo();
        return;
      }
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        useCanvasStore.getState().zoomIn();
        return;
      }
      if (mod && e.key === '-') {
        e.preventDefault();
        useCanvasStore.getState().zoomOut();
        return;
      }
      if (mod && e.key === '0') {
        e.preventDefault();
        useCanvasStore.getState().resetZoom();
        return;
      }

      if (mod) return;

      if (e.key === '=' || e.key === '+') {
        useCanvasStore.getState().zoomIn();
        return;
      }
      if (e.key === '-') {
        useCanvasStore.getState().zoomOut();
        return;
      }
      if (e.key === '0') {
        useCanvasStore.getState().resetZoom();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        useCanvasStore.getState().toggleClearCanvasConfirm();
        return;
      }

      const tool = TOOL_SHORTCUTS[e.key.toLowerCase()];
      if (tool) {
        useCanvasStore.getState().setTool(tool);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};

const App: React.FC = () => {
  useKeyboardShortcuts();

  return (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <Toolbar />
      <PalettePanel />
      <div style={{ flex: 1, display: 'flex', background: '#37474f', overflow: 'hidden' }}>
        <PixelGrid />
      </div>
      <ShapePanel />
      <LayerPanel />
    </div>
    <AnimationPanel />
    <DraftPanel />
    <NewCanvasModal />
    <ResizeCanvasModal />
    <TemplatePanel />
    <ColorReplaceModal />
    <ClearCanvasConfirmModal />
    <ComparePanel />
  </div>
  );
};
export default App;
