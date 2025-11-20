export class Food {
    x: number;
    y: number;
    energy: number;
    radius: number;

    constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.energy = 20; // So viel Energie gibt ein Stück
        this.radius = 3;
    }
}
