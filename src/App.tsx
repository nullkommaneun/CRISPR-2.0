import { MobileDebugger } from './ui/MobileDebugger';
import { SimulationCanvas } from './ui/SimulationCanvas';

function App() {
  return (
    <div className="App" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <SimulationCanvas />
      <MobileDebugger />
    </div>
  );
}

export default App;
