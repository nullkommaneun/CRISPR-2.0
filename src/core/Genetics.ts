export class Genome {
    weights: number[];

    constructor(inputSize: number, outputSize: number) {
        // Wir brauchen ein Gewicht für jede Verbindung
        const totalWeights = inputSize * outputSize;
        this.weights = new Float32Array(totalWeights) as any; // TypedArray für Performance

        // Initialisiere mit Zufallswerten zwischen -1 und 1
        for (let i = 0; i < totalWeights; i++) {
            this.weights[i] = (Math.random() * 2) - 1;
        }
    }

    // Mutation: Ändert zufällig Gewichte
    mutate(rate: number, strength: number) {
        for (let i = 0; i < this.weights.length; i++) {
            if (Math.random() < rate) {
                this.weights[i] += (Math.random() * 2 - 1) * strength;
                // Begrenzen (Clamping) auf -1 bis 1
                if (this.weights[i] > 1) this.weights[i] = 1;
                if (this.weights[i] < -1) this.weights[i] = -1;
            }
        }
    }
    
    // Kopieren für Vererbung
    clone(): Genome {
        const copy = new Genome(0, 0); // Leeres Genom
        copy.weights = new Float32Array(this.weights);
        return copy;
    }
}

export class Brain {
    inputSize: number;
    outputSize: number;

    constructor(inputSize: number, outputSize: number) {
        this.inputSize = inputSize;
        this.outputSize = outputSize;
    }

    // Das eigentliche "Denken"
    compute(inputs: number[], genome: Genome): number[] {
        const outputs: number[] = [];
        
        for (let out = 0; out < this.outputSize; out++) {
            let sum = 0;
            for (let inp = 0; inp < this.inputSize; inp++) {
                // Index im flachen Gewichts-Array berechnen
                const weightIndex = (out * this.inputSize) + inp;
                sum += inputs[inp] * genome.weights[weightIndex];
            }
            // Aktivierungsfunktion (Tanh für Output zwischen -1 und 1)
            outputs.push(Math.tanh(sum));
        }
        return outputs;
    }
}
