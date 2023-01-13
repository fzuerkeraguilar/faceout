import { GameObject } from "./gameObject";
import { Vector2 } from "../utils/vector2";

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
        context.strokeStyle = "black";
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.fill();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.stroke();
    }

    public collidesWithBall(ball: Ball): boolean {
        const distance = this.position.distanceTo(ball.position);
        return distance < this.radius + ball.radius;
    }

    public collisionNormal(other: Ball): Vector2 {
        const normal = this.position.subtract(other.position);
        return normal.normalize();
    }

    public collision(normal: Vector2): void {
        this.velocity = this.velocity.reflect(normal);
    }

    /**
     * Update the ball's position and velocity. If the ball goes off the bottom of the screen, return true.
     * The ball bounces off the sides of the screen.
     * @param deltaTime Time since the last frame
     * @param canvasWidth The width of the canvas
     * @param canvasHeight The height of the canvas
     * @param deathHeight How far  the ball can go down the canvas before it is considered dead
     * @returns 
     */
    public update(deltaTime: number, canvasWidth:number, canvasHeight:number, deathHeight:number): boolean {
        if (this.position.x + this.radius > canvasWidth) {
            this.position.x = canvasWidth - this.radius;
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.y + this.radius > canvasHeight) {
            this.position.y = canvasHeight - this.radius;
            this.velocity.y = -this.velocity.y;
        }
        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.velocity.y = -this.velocity.y;
        }
        this.position = this.position.add(this.velocity.scale(deltaTime));
        return this.position.y > deathHeight;
    }
    
}