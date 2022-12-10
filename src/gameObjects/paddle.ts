import { GameObject } from "./gameObject";
import { Vector2 } from "./vector2";

export class Paddle extends GameObject {


    constructor(position: Vector2, width: number, height: number) {
        super(position);
        this._width = width;
        this._height = height;
    }

    public draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "white";
        context.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
    }

}