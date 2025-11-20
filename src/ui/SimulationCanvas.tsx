import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Cell } from '../core/Cell';
import { Food } from '../core/Food';
import { log } from '../utils/logger';

export const SimulationCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const cellsRef = useRef<Cell[]>([]);
    const foodRef = useRef<Food[]>([]); // Unser Speisekammer-Speicher

    useEffect(() => {
        if (appRef.current) return;

        const initSim = async () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            const app = new PIXI.Application();
            await app.init({ 
                width, height, backgroundColor: 0x111111, resizeTo: containerRef.current 
            });
            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Init: 20 Zellen, 40 Essen
            for (let i = 0; i < 20; i++) {
                cellsRef.current.push(new Cell(`c-${i}`, Math.random() * width, Math.random() * height));
            }
            for (let i = 0; i < 40; i++) {
                foodRef.current.push(new Food(width, height));
            }
            
            log("EcoSystem v2 initialized. Food added.", "system");

            const graphics = new PIXI.Graphics();
            app.stage.addChild(graphics);

            // --- GAME LOOP ---
            app.ticker.add((ticker) => {
                const dt = ticker.deltaTime;
                const w = app.screen.width;
                const h = app.screen.height;
                
                graphics.clear();

                // 1. Essen zeichnen
                graphics.fillStyle = 0x00ffff; // Cyan für Nahrung (besser sichtbar)
                foodRef.current.forEach(f => {
                    graphics.circle(f.x, f.y, f.radius);
                    graphics.fill();
                });

                // 2. Zellen Logik & Zeichnen
                // Wir iterieren rückwärts, falls wir Zellen löschen müssten (bei Tod)
                for (let i = cellsRef.current.length - 1; i >= 0; i--) {
                    const cell = cellsRef.current[i];
                    
                    // Zelle denkt und bewegt sich (sieht das Essen)
                    cell.update(dt, { width: w, height: h }, foodRef.current);

                    // Kollision mit Essen checken
                    for (let j = foodRef.current.length - 1; j >= 0; j--) {
                        const food = foodRef.current[j];
                        const dx = cell.x - food.x;
                        const dy = cell.y - food.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);

                        if (dist < cell.radius + food.radius) {
                            // MAMPF!
                            cell.energy += food.energy;
                            // Essen entfernen
                            foodRef.current.splice(j, 1);
                            // Neues Essen woanders spawnen (damit es nicht leer wird)
                            foodRef.current.push(new Food(w, h));
                        }
                    }

                    // Visualisierung: Wenn viel Energie -> Zelle dicker
                    const visualRadius = cell.radius + (cell.energy / 50); 
                    
                    graphics.beginPath(); // Wichtig für sauberes Zeichnen
                    graphics.circle(cell.x, cell.y, visualRadius);
                    graphics.fillStyle = cell.color;
                    graphics.fill();
                    
                    // Kleiner Indikator für Blickrichtung
                    graphics.beginPath();
                    graphics.moveTo(cell.x, cell.y);
                    graphics.lineTo(
                        cell.x + Math.cos(cell.angle) * (visualRadius + 5),
                        cell.y + Math.sin(cell.angle) * (visualRadius + 5)
                    );
                    graphics.strokeStyle = 0xffffff;
                    graphics.stroke();
                }
            });
        };

        initSim();
        return () => {
            if(appRef.current) appRef.current.destroy(true, {children: true});
            appRef.current = null;
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }} />;
};
