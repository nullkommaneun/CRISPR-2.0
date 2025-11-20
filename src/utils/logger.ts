import { create } from 'zustand';

export type LogType = 'info' | 'warn' | 'error' | 'system';

interface LogEntry {
    id: number;
    timestamp: string;
    type: LogType;
    message: string;
}

interface LoggerStore {
    logs: LogEntry[];
    addLog: (message: string, type?: LogType) => void;
    clearLogs: () => void;
}

export const useLogger = create<LoggerStore>((set) => ({
    logs: [],
    addLog: (message, type = 'info') => set((state) => {
        const newLog = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            type,
            message
        };
        // Behalte nur die letzten 50 Logs für Performance
        return { logs: [newLog, ...state.logs].slice(0, 50) };
    }),
    clearLogs: () => set({ logs: [] })
}));

// Globale Helper Funktion, damit wir überall einfach loggen können
export const log = (msg: string, type: LogType = 'info') => {
    useLogger.getState().addLog(msg, type);
};
