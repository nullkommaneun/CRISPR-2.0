import { Genome, Brain } from './Genetics';
import { Food } from './Food';

export class Cell {
    id: string;
    x: number;
    y: number;
    angle: number; 
    velocity: number;
    maxSpeed: number;
    radius: number;
    energy: number;
    color: number;
    genome: Genome;
    brain: Brain;

    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = 0;
        this.maxSpeed = 3.0;
        this.radius = 5;
        this.energy = 100; // Startenergie

        // Inputs: [Bias, Winkel_zu_Futter, Distanz_zu_Futter]
        // Outputs: [Schub, Lenkung]
        this.brain = new Brain(3, 2);
        this.genome = new Genome(3, 2);
        
        // Farbe basierend auf Genen
        const r = Math.floor(((this.genome.weights[0] + 1) / 2) * 255);
        const g = Math.floor(((this.genome.weights[1] + 1) / 2) * 255);
        this.color = (r << 16) + (g << 8) + 50;
    }

    update(dt: number, bounds: { width: number, height: number }, foods: Food[]) {
        // 1. SENSORIK: Wo ist das nächste Essen?
        let nearestDist = Infinity;
        let nearestFood: Food | null = null;

        // Simpler Loop durch alles Essen (für 50 Stück ok)
        for (const food of foods) {
            const dx = food.x - this.x;
            const dy = food.y - this.y;
            const d2 = dx*dx + dy*dy; // Distanz im Quadrat (schneller)
            if (d2 < nearestDist) {
                nearestDist = d2;
                nearestFood = food;
            }
        }

        let inputAngle = 0;
        let inputDist = 1; // 1 = weit weg/nichts gesehen

        if (nearestFood) {
            // Winkel zum Essen berechnen
            const dx = nearestFood.x - this.x;
            const dy = nearestFood.y - this.y;
            const targetAngle = Math.atan2(dy, dx);
            
            // Relativer Winkel (Wo ist Essen im Vergleich zu meiner Blickrichtung?)
            let relativeAngle = targetAngle - this.angle;
            
            // Normalisieren auf -PI bis PI
            while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
            while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;

            inputAngle = relativeAngle / Math.PI; // Skaliert auf -1 bis 1
            inputDist = Math.sqrt(nearestDist) / Math.max(bounds.width, bounds.height); // 0 bis 1
        }

        // 2. DENKEN
        const inputs = [
            1.0,        // Bias
            inputAngle, // Sensor 1: Wo ist es?
            inputDist   // Sensor 2: Wie weit?
        ];

        const outputs = this.brain.compute(inputs, this.genome);
        const thrust = outputs[0]; 
        const turn = outputs[1];   

        // 3. PHYSIK
        this.angle += turn * 0.3 * dt; // Drehgeschwindigkeit
        this.velocity += thrust * 0.5 * dt;
        
        this.velocity *= 0.9; // Starke Reibung verhindert unendliches Gleiten
        if (this.velocity > this.maxSpeed) this.velocity = this.maxSpeed;
        if (this.velocity < 0) this.velocity = 0; // Kein Rückwärtsgang

        this.x += Math.cos(this.angle) * this.velocity * dt;
        this.y += Math.sin(this.angle) * this.velocity * dt;

        // Wrap-Around
        if (this.x < 0) this.x = bounds.width;
        if (this.x > bounds.width) this.x = 0;
        if (this.y < 0) this.y = bounds.height;
        if (this.y > bounds.height) this.y = 0;

        // Energieverbrauch (Bewegung kostet Kraft!)
        const metabolicRate = 0.05;
        this.energy -= (metabolicRate + Math.abs(thrust) * 0.05) * dt;
    }
}
