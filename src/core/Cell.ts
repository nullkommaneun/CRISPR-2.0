export class Cell {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    energy: number;
    color: number;

    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        // Zufällige Geschwindigkeit für den Start
        this.vx = (Math.random() - 0.5) * 2; 
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = 5;
        this.energy = 100;
        this.color = 0x00FF00; // Standard Grün
    }

    update(dt: number, bounds: { width: number, height: number }) {
        // Bewegung berechnen
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Welt-Grenzen (Wrap-Around: links raus -> rechts rein)
        if (this.x < 0) this.x = bounds.width;
        if (this.x > bounds.width) this.x = 0;
        if (this.y < 0) this.y = bounds.height;
        if (this.y > bounds.height) this.y = 0;

        // Langsamer Energieverlust (für späteres Sterben)
        this.energy -= 0.01 * dt;
    }
}
