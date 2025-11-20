import React, { useState } from 'react';
import { useLogger } from '../utils/logger';

export const MobileDebugger: React.FC = () => {
    const { logs, clearLogs } = useLogger();
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                style={{position: 'fixed', bottom: 10, right: 10, zIndex: 1000, padding: '10px', background: '#333', color: '#fff', borderRadius: '50%'}}
            >
                🐞
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, height: '40vh', 
            background: 'rgba(0,0,0,0.9)', color: '#0f0', fontFamily: 'monospace',
            overflowY: 'auto', zIndex: 1000, padding: '10px', borderTop: '2px solid #444'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                <strong>System Console</strong>
                <div>
                    <button onClick={clearLogs} style={{marginRight: '10px'}}>Clear</button>
                    <button onClick={() => setIsOpen(false)}>Close</button>
                </div>
            </div>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '12px'}}>
                {logs.map(log => (
                    <li key={log.id} style={{borderBottom: '1px solid #333', padding: '2px 0', color: log.type === 'error' ? '#f55' : '#0f0'}}>
                        <span style={{opacity: 0.6}}>[{log.timestamp}]</span> {log.message}
                    </li>
                ))}
            </ul>
        </div>
    );
};
