import { Brick } from "./brick";
import { GameObject } from "./gameObject";
import { Paddle } from "./paddle";
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
        const canvasWidth = context.canvas.width;
        const canvasHeight = context.canvas.height;
        if (this.position.x + this.radius > canvasWidth) {
            this.position.x = canvasWidth - this.radius;
        }
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
        }
        if (this.position.y + this.radius > canvasHeight) {
            this.position.y = canvasHeight - this.radius;
        }
        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
        }

        context.fillStyle = "white";
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }

    public collidesWith(other: GameObject): boolean {
        if (other instanceof Ball) {
            const distance = this.position.distanceTo(other.position);
            return distance < this.radius + other.radius;
        } else {
            return this.position.x + this.radius > other.position.x - other.width / 2 &&
                this.position.x - this.radius < other.position.x + other.width / 2 &&
                this.position.y + this.radius > other.position.y - other.height / 2 &&
                this.position.y - this.radius < other.position.y + other.height / 2;
        }
    }

    public collisionCheck(canvas: HTMLCanvasElement, bricks: Brick[], paddle: Paddle): number {
        let destroyed = 0;
        bricks.forEach((brick) => {
            if(brick.destroyed){
                return
            }
            if (this.collidesWith(brick)) {
                this.collisionResponse(brick)
                brick.destroy();
                destroyed++;
            }
        });
        if (this.collidesWith(paddle)) {
            this.collisionResponse(paddle);
        }
        if (this.position.y + this.radius > canvas.height) {
            this.velocity.y = -this.velocity.y;
        }
        if (this.position.x + this.radius > canvas.width) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.x - this.radius < 0) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.y - this.radius < 0) {
            this.velocity.y = -this.velocity.y;
        }
        return destroyed;
    }

    public collisionNormal(other: GameObject): Vector2 {
        if (other instanceof Ball) {
            const normal = this.position.subtract(other.position);
            return normal.normalize();
        }
        const normal = new Vector2(0, 0);
        if (this.position.x < other.position.x - other.width / 2) {
            normal.x = -1;
        }
        else if (this.position.x > other.position.x + other.width / 2) {
            normal.x = 1;
        }
        if (this.position.y < other.position.y - other.height / 2) {
            normal.y = -1;
        }
        else if (this.position.y > other.position.y + other.height / 2) {
            normal.y = 1;
        }
        return normal.normalize();
    }

    public collisionResponse(other: GameObject): void {
        const normal = this.collisionNormal(other);
        this.velocity = Vector2.reflect(this.velocity, normal);
    }

    public update(deltaTime: number): void {
        this.position = this.position.add(this.velocity.scale(deltaTime));
    }
    
}