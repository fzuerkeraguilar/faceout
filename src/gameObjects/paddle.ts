import { GameObject } from "./gameObject";
import { Ball } from "./ball";
import { Vector2 } from "../utils/vector2";

export class Paddle extends GameObject {
    /**
     * Creates a new paddle.
     * @param position Initial position of the paddle (top left corner)
     * @param width width of the paddle
     * @param height height of the paddle
     */
    constructor(position: Vector2, width: number, height: number) {
        super(position);
        this._width = width;
        this._height = height;
    }

    public draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }

    public collisionNormal(other: Ball): Vector2 {
        let normal = super.collisionNormal(other);
        // If the ball hits the paddle from the top, we want to change the normal
        // so that the ball bounces off at an angle.
        if (other.position.y < this.position.y && normal.length() > 0) {
            const delta = (this.position.x + (this.width / 2) - other.position.x) / (this.width / 2);
            normal.x = -delta * 0.2;
            normal = normal.normalize();
        }
        return normal;
    }
}