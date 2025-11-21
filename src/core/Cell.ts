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
    age: number; // Neu: Um den Puls zu berechnen

    constructor(id: string, x: number, y: number, genome?: Genome) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = 0;
        this.maxSpeed = 3.0;
        this.radius = 5;
        this.energy = 100;
        this.age = 0;

        // INPUTS: 4 [Bias, Winkel, Distanz, Puls(Zeit)]
        // OUTPUTS: 2 [Schub, Lenkung]
        this.brain = new Brain(4, 2);
        
        if (genome) {
            this.genome = genome;
        } else {
            this.genome = new Genome(4, 2);
        }
        
        this.updateColor();
    }

    updateColor() {
        // Visualisiert die ersten 3 Gewichte als RGB
        // So sehen verwandte Zellen ähnlich aus
        const r = Math.floor(((Math.tanh(this.genome.weights[0]) + 1) / 2) * 255);
        const g = Math.floor(((Math.tanh(this.genome.weights[1]) + 1) / 2) * 255);
        const b = Math.floor(((Math.tanh(this.genome.weights[2]) + 1) / 2) * 255);
        this.color = (r << 16) + (g << 8) + b;
    }

    // Die Zell-Teilung
    reproduce(newId: string): Cell {
        // Kind bekommt Kopie des Genoms
        const childGenome = this.genome.clone();
        // Mutation! Rate: 10%, Stärke: 0.3
        childGenome.mutate(0.1, 0.3);
        
        const child = new Cell(newId, this.x, this.y, childGenome);
        
        // Energie-Transfer: Elternteil gibt 50% ab
        child.energy = this.energy / 2;
        this.energy = this.energy / 2;

        return child;
    }

    update(dt: number, bounds: { width: number, height: number }, foods: Food[]) {
        this.age += dt;

        // 1. SENSORIK
        let nearestDist = Infinity;
        let nearestFood: Food | null = null;

        // Suche optimieren: Nur checken, was halbwegs nah ist (simple Box-Check wäre noch schneller)
        for (const food of foods) {
            const dx = food.x - this.x;
            const dy = food.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < nearestDist) {
                nearestDist = d2;
                nearestFood = food;
            }
        }

        let inputAngle = 0;
        let inputDist = 1;

        if (nearestFood) {
            const dx = nearestFood.x - this.x;
            const dy = nearestFood.y - this.y;
            const targetAngle = Math.atan2(dy, dx);
            let relativeAngle = targetAngle - this.angle;
            while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
            while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
            inputAngle = relativeAngle / Math.PI; 
            
            // Distanz normalisieren (0 = nah, 1 = fern)
            // Wir begrenzen die Sichtweite auf 200px für realistischeres Verhalten
            inputDist = Math.min(Math.sqrt(nearestDist), 200) / 200;
        }

        // Der "Anti-Loop" Puls: Ein Sinus-Wert, der sich langsam ändert
        const pulse = Math.sin(this.age * 0.1);

        // 2. DENKEN
        const inputs = [
            1.0,        // Bias
            inputAngle, // Wo ist Essen?
            inputDist,  // Wie weit? (1 = weit weg)
            pulse       // Zeitgefühl (verhindert statisches Drehen)
        ];

        const outputs = this.brain.compute(inputs, this.genome);
        const thrust = outputs[0]; 
        const turn = outputs[1];   

        // 3. PHYSIK
        this.angle += turn * 0.4 * dt; // Agileres Drehen
        this.velocity += thrust * 0.8 * dt; // Schnelleres Beschleunigen
        
        this.velocity *= 0.9; 
        if (this.velocity > this.maxSpeed) this.velocity = this.maxSpeed;
        if (this.velocity < 0) this.velocity = 0; 

        this.x += Math.cos(this.angle) * this.velocity * dt;
        this.y += Math.sin(this.angle) * this.velocity * dt;

        if (this.x < 0) this.x = bounds.width;
        if (this.x > bounds.width) this.x = 0;
        if (this.y < 0) this.y = bounds.height;
        if (this.y > bounds.height) this.y = 0;

        // Energieverbrauch: Grundumsatz + Bewegungskosten + Gehirn-Anstrengung
        this.energy -= (0.03 + Math.abs(thrust) * 0.05) * dt;
    }
}
