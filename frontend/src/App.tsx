import React from 'react';
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

const App: React.FC = () => (
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
  </div>
);
export default App;
