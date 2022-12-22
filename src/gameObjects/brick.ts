import { GameObject } from "./gameObject";
import { Vector2 } from "./vector2";

export class Brick extends GameObject {

    private color: string;
    private _destroyed: boolean;

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

    public draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = this.color;
        context.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
    }
    
    public resize(width: number, height: number) {
        this._height = height;
        this._width = width;
    }
}