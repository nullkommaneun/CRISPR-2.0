import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Cell } from '../core/Cell';
import { Food } from '../core/Food';
import { log } from '../utils/logger';

export const SimulationCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const cellsRef = useRef<Cell[]>([]);
    const foodRef = useRef<Food[]>([]);
    
    // Zähler für IDs
    const idCounter = useRef(0);

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

            // Initiale Population
            for (let i = 0; i < 20; i++) {
                cellsRef.current.push(new Cell(`gen0-${i}`, Math.random() * width, Math.random() * height));
            }
            // Viel Essen am Anfang
            for (let i = 0; i < 60; i++) {
                foodRef.current.push(new Food(width, height));
            }
            
            log("Evolution started.", "system");

            const graphics = new PIXI.Graphics();
            app.stage.addChild(graphics);

            app.ticker.add((ticker) => {
                const dt = ticker.deltaTime;
                const w = app.screen.width;
                const h = app.screen.height;
                
                // Essen nachfüllen, wenn zu wenig da ist (Simulation am Laufen halten)
                if (foodRef.current.length < 20 && Math.random() < 0.05) {
                     foodRef.current.push(new Food(w, h));
                }

                graphics.clear();

                // Essen zeichnen
                graphics.fillStyle = 0x00ffff; 
                foodRef.current.forEach(f => {
                    graphics.circle(f.x, f.y, f.radius);
                    graphics.fill();
                });

                // --- EVOLUTION LOOP ---
                // Rückwärts iterieren ist wichtig beim Löschen/Hinzufügen während des Loops
                for (let i = cellsRef.current.length - 1; i >= 0; i--) {
                    const cell = cellsRef.current[i];
                    
                    // 1. Update
                    cell.update(dt, { width: w, height: h }, foodRef.current);

                    // 2. Kollision (Fressen)
                    for (let j = foodRef.current.length - 1; j >= 0; j--) {
                        const food = foodRef.current[j];
                        const dx = cell.x - food.x;
                        const dy = cell.y - food.y;
                        
                        // Optimierte Distanzrechnung (Quadrat) für Performance
                        if (dx*dx + dy*dy < (cell.radius + food.radius) ** 2) {
                            cell.energy += food.energy;
                            foodRef.current.splice(j, 1);
                        }
                    }

                    // 3. TOD (Natural Selection)
                    if (cell.energy <= 0) {
                        // Zelle stirbt
                        cellsRef.current.splice(i, 1);
                        // Optional: Leiche wird zu Essen (Kannst du später einbauen)
                        continue; // Nächste Iteration
                    }

                    // 4. GEBURT (Reproduction)
                    if (cell.energy > 200) {
                        idCounter.current++;
                        // Kind erzeugen (vermutlich neben dem Elternteil)
                        const child = cell.reproduce(`gen-${idCounter.current}`);
                        cellsRef.current.push(child);
                        log(`New Life! Total: ${cellsRef.current.length}`, "info");
                    }

                    // 5. Zeichnen
                    const visualRadius = Math.max(2, cell.radius + (cell.energy / 50)); 
                    
                    graphics.beginPath();
                    graphics.circle(cell.x, cell.y, visualRadius);
                    graphics.fillStyle = cell.color;
                    graphics.fill();
                    
                    // Kleines Auge (zeigt Richtung)
                    graphics.beginPath();
                    graphics.moveTo(cell.x, cell.y);
                    graphics.lineTo(
                        cell.x + Math.cos(cell.angle) * (visualRadius + 8),
                        cell.y + Math.sin(cell.angle) * (visualRadius + 8)
                    );
                    graphics.strokeStyle = 0x000000;
                    graphics.stroke();
                }

                // Extinction Event Prevention (Wenn alle sterben, neue Adam & Eva spawnen)
                if (cellsRef.current.length === 0) {
                    log("Extinction Event! Reseeding...", "warn");
                    for (let k = 0; k < 5; k++) {
                        cellsRef.current.push(new Cell(`reseed-${Math.random()}`, Math.random() * w, Math.random() * h));
                    }
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
