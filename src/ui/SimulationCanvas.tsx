import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Cell } from '../core/Cell';
import { log } from '../utils/logger';

export const SimulationCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const cellsRef = useRef<Cell[]>([]);

    useEffect(() => {
        // Verhindert doppeltes Initialisieren (React Strict Mode Problem)
        if (appRef.current) return;

        const initSim = async () => {
            if (!containerRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            // 1. Pixi App erstellen
            const app = new PIXI.Application();
            await app.init({ 
                width, 
                height, 
                backgroundColor: 0x1a1a1a,
                resizeTo: containerRef.current 
            });
            
            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            log(`Engine started. Canvas: ${width}x${height}`, "system");

            // 2. Test-Zellen spawnen
            for (let i = 0; i < 50; i++) {
                cellsRef.current.push(
                    new Cell(`c-${i}`, Math.random() * width, Math.random() * height)
                );
            }
            log(`${cellsRef.current.length} Cells spawned`, "info");

            // 3. Ein Grafik-Objekt für alle Zellen (schneller als viele Sprites)
            const graphics = new PIXI.Graphics();
            app.stage.addChild(graphics);

            // 4. Der Game Loop (läuft 60x pro Sekunde)
            app.ticker.add((ticker) => {
                const dt = ticker.deltaTime; // Zeit seit letztem Frame
                
                // Bildschirm leeren für neuen Frame
                graphics.clear();

                // Alle Zellen updaten und zeichnen
                cellsRef.current.forEach(cell => {
                    // Logik Update
                    cell.update(dt, { width: app.screen.width, height: app.screen.height });

                    // Zeichnen
                    graphics.circle(cell.x, cell.y, cell.radius);
                    graphics.fill(cell.color);
                });
            });
        };

        initSim();

        // Cleanup beim Verlassen
        return () => {
            if (appRef.current) {
                appRef.current.destroy(true, { children: true });
                appRef.current = null;
            }
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }} />;
};
