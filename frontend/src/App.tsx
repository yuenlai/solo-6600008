import React from 'react';
import { PixelGrid } from './components/PixelGrid';
import { Toolbar } from './components/Toolbar';

const App: React.FC = () => (
  <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
    <Toolbar />
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#37474f' }}>
      <PixelGrid />
    </div>
  </div>
);
export default App;
