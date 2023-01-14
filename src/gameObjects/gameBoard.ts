import { Brick } from "./brick";
import { Ball } from "./ball";
import { Vector2 } from "../utils/vector2";

export class GameBoard {

    private readonly _board: Brick[][];
    private _padding: number;

    constructor(size_x: number, size_y: number, wallWidth: number, wallHeight: number, side_padding:number = 10, top_padding:number = 10, padding: number = 10) {
        this._padding = padding;
        this._board = new Array(size_x);
        for (let i = 0; i < size_x; i++) {
            this._board[i] = new Array(size_y);
        }
        const brick_width = (wallWidth - (size_x - 1) * this._padding - 2 * side_padding) / size_x;
        const brick_height = (wallHeight - (size_y - 1) * this._padding - top_padding) / size_y;
        for (let i = 0; i < size_x; i++) {
            for (let j = 0; j < size_y; j++) {
                let x = side_padding + i * (brick_width + this._padding);
                let y = top_padding + j * (brick_height + this._padding);
                this._board[i][j] = new Brick(new Vector2(x, y), brick_width, brick_height, "white");
            }
        }  
    }

    public get board(): Brick[][] {
        return this._board;
    }

    public get length(): number {
        return this._board.length * this._board[0].length;
    }

    public collision(ball: Ball): number {
        let collisions = 0;
        for (let i = 0; i < this._board.length; i++) {
            for (let j = 0; j < this._board[i].length; j++) {
                if(this._board[i][j].destroyed) continue;
                if (this._board[i][j].collidesWithBall(ball)) {
                    let normal = this._board[i][j].collisionNormal(ball);
                    ball.collision(normal);
                    this._board[i][j].destroy();
                    collisions++;
                }
            }
        }
        return collisions;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this._board.length; i++) {
            for (let j = 0; j < this._board[i].length; j++) {
                this._board[i][j].draw(ctx);
            }
        }
    }

    public reset(): void {
        for (let i = 0; i < this._board.length; i++) {
            for (let j = 0; j < this._board[i].length; j++) {
                this._board[i][j].reset();
            }
        }
    }

    public resize(wallWidth: number, wallHeight: number, side_padding:number = 10, top_padding:number = 10, padding: number = 10) {
        this._padding = padding;
        let size_x = this._board.length;
        let size_y = this._board[0].length;
        const brick_width = (wallWidth - (size_x - 1) * this._padding - 2 * side_padding) / size_x;
        const brick_height = (wallHeight - (size_y - 1) * this._padding - top_padding) / size_y;
        for (let i = 0; i < size_x; i++) {
            for (let j = 0; j < size_y; j++) {
                let x = side_padding + i * (brick_width + this._padding);
                let y = top_padding + j * (brick_height + this._padding);
                this._board[i][j] = new Brick(new Vector2(x, y), brick_width, brick_height, "white");
            }
        }  
    }
}