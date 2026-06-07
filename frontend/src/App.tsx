import React from 'react';
import { PixelGrid } from './components/PixelGrid';
import { Toolbar } from './components/Toolbar';
import { LayerPanel } from './components/LayerPanel';
import { AnimationPanel } from './components/AnimationPanel';
import { DraftPanel } from './components/DraftPanel';

const App: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <Toolbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#37474f', overflow: 'auto' }}>
        <PixelGrid />
      </div>
      <LayerPanel />
    </div>
    <AnimationPanel />
    <DraftPanel />
  </div>
);
export default App;
