import { GameObject } from "./gameObject";
import { Vector2 } from "./vector2";

export class Ball extends GameObject {
    
    private _radius: number;

    constructor(position: Vector2, radius: number) {
        super(position);
        if (radius <= 0) {
            throw new Error("Radius must be greater than 0");
        }
        this._radius = radius;
        this._width = radius * 2;
        this._height = radius * 2;
    }

    public get radius(): number {
        return this._radius;
    }

    public draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "white";
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fill();
    }

    public collidesWith(other: GameObject): boolean {
        if (other instanceof Ball) {
            const distance = this.position.distanceTo(other.position);
            return distance < this.radius + other.radius;
        } else {
            return this.position.x + this.radius > other.position.x &&
                this.position.x - this.radius < other.position.x + other.width &&
                this.position.y + this.radius > other.position.y &&
                this.position.y - this.radius < other.position.y + other.height;
        }
    }

    public collisionNormal(other: GameObject): Vector2 {
        if (other instanceof Ball) {
            const normal = this.position.subtract(other.position);
            return normal.normalize();
        }
        const normal = new Vector2(0, 0);
        if (this.position.x < other.position.x) {
            normal.x = -1;
        }
        else if (this.position.x > other.position.x + other.width / 2) {
            normal.x = 1;
        }
        if (this.position.y < other.position.y) {
            normal.y = -1;
        }
        else if (this.position.y > other.position.y + other.height / 2) {
            normal.y = 1;
        }
        return normal;
    }

    public collisionResponse(other: GameObject): void {
        const normal = this.collisionNormal(other);
        this.velocity = Vector2.reflect(this.velocity, normal);
    }

    public update(deltaTime: number): void {
        this.position = this.position.add(this.velocity.scale(deltaTime));
    }
    
}