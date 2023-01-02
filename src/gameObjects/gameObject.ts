import { Vector2 } from "./vector2";

export abstract class GameObject {

    public position: Vector2;
    public velocity: Vector2;
    public acceleration: Vector2;
    protected _width!: number;
    protected _height!: number;

    constructor(position: Vector2) {
        this.position = position;
        this.velocity = Vector2.zero();
        this.acceleration = Vector2.zero();
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    public update(deltaTime: number): void {
        this.velocity = this.velocity.add(this.acceleration.scale(deltaTime));
        this.position = this.position.add(this.velocity.scale(deltaTime));
    }

    public abstract draw(context: CanvasRenderingContext2D): void;

}