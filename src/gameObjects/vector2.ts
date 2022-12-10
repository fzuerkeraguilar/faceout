
export class Vector2 {

    public x: number;
    public y: number;

    constructor(x: number, y: number) {

        this.x = x;
        this.y = y;

    }

    public add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    public subtract(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    public scale(other: number): Vector2 {
        return new Vector2(this.x * other, this.y * other);
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(): Vector2 {
        return this.scale(1 / this.length());
    }

    public dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    public cross(other: Vector2): number {
        return this.x * other.y - this.y * other.x;
    }

    public angle(): number {
        return Math.atan2(this.y, this.x);
    }

    public angleTo(other: Vector2): number {
        return Math.acos(this.dot(other) / (this.length() * other.length()));
    }

    public distanceTo(other: Vector2): number {
        return this.subtract(other).length();
    }

    public rotate(angle: number): Vector2 {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }

    public lerp(other: Vector2, t: number): Vector2 {
        return this.add(other.subtract(this).scale(t));
    }

    public equals(other: Vector2): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }

    static zero(): Vector2 {
        return new Vector2(0, 0);
    }

    static one(): Vector2 {
        return new Vector2(1, 1);
    }

    static up(): Vector2 {
        return new Vector2(1, 0);
    }

    static down(): Vector2 {
        return new Vector2(-1, 0);
    }

    static left(): Vector2 {
        return new Vector2(0, -1);
    }

    static right(): Vector2 {
        return new Vector2(0, 1);
    }

    static fromAngle(angle: number): Vector2 {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }

    static distance(a: Vector2, b: Vector2): number {
        return a.subtract(b).length();
    }

    static reflect(vector: Vector2, normal: Vector2): Vector2 {
        return vector.subtract(normal.scale(2 * vector.dot(normal)));
    }


}