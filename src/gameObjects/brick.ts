import { GameObject } from "./gameObject";
import { Vector2 } from "../utils/vector2";

export class Brick extends GameObject {

    private color: string;
    private _destroyed: boolean;

    /**
     * Creates an instance of Brick.
     * @param position Initial position of the brick (top left corner)
     * @param width width of the brick
     * @param height height of the brick
     * @param color color of the brick
     */
    constructor(position: Vector2, width: number, height: number, color: string) {
        super(position);
        this.color = color;
        this._width = width;
        this._height = height;
        this._destroyed = false;
    }

    public get destroyed(): boolean {
        return this._destroyed;
    }

    public destroy() {
        this._destroyed = true;
    }

    public reset(): void {
        this._destroyed = false;
    }

    public draw(context: CanvasRenderingContext2D): void {
        if (this._destroyed) {
            return;
        }
        context.fillStyle = this.color;
        context.strokeStyle = "black";
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
    
    public resize(width: number, height: number) {
        this._height = height;
        this._width = width;
    }
}