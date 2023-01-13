import { Ball } from "./ball";
import { Vector2 } from "../utils/vector2";

export abstract class GameObject {

    public position: Vector2;
    public velocity: Vector2;
    protected _width!: number;
    protected _height!: number;

    /**
     * Base class for all game objects
     * @param position The top left corner of the game object
     */
    protected constructor(position: Vector2) {
        this.position = position;
        this.velocity = Vector2.zero();
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    /**
     * Checks if the rectangle collides with a ball
     * @param ball The ball to check collision with
     * @returns If the ball collides with the game object
     */
    public collidesWithBall(ball: Ball): boolean {
        const x = Math.abs(ball.position.x - this.position.x - this.width / 2);
        const y = Math.abs(ball.position.y - this.position.y - this.height / 2);

        if (x > (this.width / 2 + ball.radius)) { return false; }
        if (y > (this.height / 2 + ball.radius)) { return false; }

        if (x <= (this.width / 2)) { return true; }
        if (y <= (this.height / 2)) { return true; }

        const dx = x - this.width / 2;
        const dy = y - this.height / 2;
        return (dx * dx + dy * dy <= (ball.radius * ball.radius));
    }

    /**
     * Calculates the normal of the collision between a rectangle and a ball
     * @param other The other ball to check collision with
     * @returns The normal of the collision
     */
    public collisionNormal(other: Ball): Vector2 {
        const nearestX = Math.max(this.position.x, Math.min(other.position.x, this.position.x + this.width));
        const nearestY = Math.max(this.position.y, Math.min(other.position.y, this.position.y + this.height));

        const dist = new Vector2(other.position.x - nearestX, other.position.y - nearestY);
        if(other.velocity.dot(dist) < 0) {
            return dist.normalize();
        }
        return Vector2.zero();
    }

    /**
     * Abstract method to draw the game object
     * @param context The canvas context to draw on
     */
    public abstract draw(context: CanvasRenderingContext2D): void;

}