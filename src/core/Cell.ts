import { Genome, Brain } from './Genetics';

export class Cell {
    id: string;
    x: number;
    y: number;
    angle: number; // Blickrichtung in Bogenmaß
    
    // Physik
    velocity: number;
    maxSpeed: number;
    
    // Biologie
    radius: number;
    energy: number;
    color: number;
    
    // Das Gehirn
    genome: Genome;
    brain: Brain;

    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        
        this.velocity = 0;
        this.maxSpeed = 2.0; // Pixel pro Frame
        this.radius = 5;
        this.energy = 100;
        
        // Genetik-Setup
        // 3 Inputs: [Bias, Random1, Random2] (Später: Nahrungssensoren)
        // 2 Outputs: [Schub, Lenkung]
        this.brain = new Brain(3, 2);
        this.genome = new Genome(3, 2);
        
        // Farbe basierend auf dem ersten Gen (visualisiert "Verwandtschaft")
        const r = Math.floor(((this.genome.weights[0] + 1) / 2) * 255);
        const g = Math.floor(((this.genome.weights[1] + 1) / 2) * 255);
        const b = 150;
        this.color = (r << 16) + (g << 8) + b;
    }

    update(dt: number, bounds: { width: number, height: number }) {
        // 1. WAHRNEHMEN (Inputs sammeln)
        const inputs = [
            1.0,                 // Bias (hilft dem Netz, aktiv zu sein)
            Math.random() * 2 - 1, // Rauschen (Simuliert "Nervosität")
            Math.sin(this.angle) // Orientierungssinn
        ];

        // 2. DENKEN (Outputs berechnen)
        const outputs = this.brain.compute(inputs, this.genome);
        const thrust = outputs[0]; // Beschleunigung (-1 bis 1)
        const turn = outputs[1];   // Lenkung (-1 bis 1)

        // 3. HANDELN (Physik anwenden)
        // Lenken
        this.angle += turn * 0.2 * dt;

        // Beschleunigen (nur vorwärts macht Sinn, aber Rückwärtsgang erlauben wir mal minimal)
        this.velocity += thrust * 0.1 * dt;
        
        // Physik-Grenzen (Reibung & Max Speed)
        this.velocity *= 0.95; // Reibung
        if (this.velocity > this.maxSpeed) this.velocity = this.maxSpeed;
        if (this.velocity < -this.maxSpeed * 0.5) this.velocity = -this.maxSpeed * 0.5;

        // Position updaten (Vektor-Mathe)
        this.x += Math.cos(this.angle) * this.velocity * dt;
        this.y += Math.sin(this.angle) * this.velocity * dt;

        // Welt-Grenzen (Wrap-Around)
        if (this.x < 0) this.x = bounds.width;
        if (this.x > bounds.width) this.x = 0;
        if (this.y < 0) this.y = bounds.height;
        if (this.y > bounds.height) this.y = 0;

        this.energy -= 0.01 * dt;
    }
}
 
