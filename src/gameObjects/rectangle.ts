import { Vector2 } from "./vector2";

export class Rectangle{
    public position: Vector2;
    public width: number;
    public height: number;

    constructor(position: Vector2, width: number, height: number) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    public intersects(other: Rectangle): boolean {
        return this.position.x < other.position.x + other.width &&
            this.position.x + this.width > other.position.x &&
            this.position.y < other.position.y + other.height &&
            this.position.y + this.height > other.position.y;
    }

}
