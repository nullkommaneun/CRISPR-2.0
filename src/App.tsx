import React, { useEffect, useRef } from 'react';
import { MobileDebugger } from './ui/MobileDebugger';
import { log } from './utils/logger';

// Placeholder für die PixiJS Canvas Integration
const SimulationCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            log("Simulation initialized", "system");
            log("PixiJS ready context setup...", "info");
            // Hier kommt später der Pixi Application Code rein
        }
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100vh', background: '#111' }} />;
};

function App() {
  return (
    <div className="App">
      <SimulationCanvas />
      <MobileDebugger />
    </div>
  );
}

export default App;
