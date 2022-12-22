import { Brick } from "./gameObjects/brick";
import { Vector2 } from "./gameObjects/vector2";

export class gameFieldBuilder {
    colorPalette: string[] = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "brown", "grey", "black"];
    constructor(colorPalette: string[]) {
        if (colorPalette.length > 0) {
            this.colorPalette = colorPalette;
        }
    }

    public getRectGameField(topLeft:Vector2, wallWidth: number, wallHeigth: number, widthNum: number, heightNum:number, gap:number): Brick[] {
        let bricks: Brick[] = [];
        let brickWidth = wallWidth / widthNum;
        let brickHeight = wallHeigth / heightNum;
        let colorIndex = 0;
        for (let i = 0; i < widthNum; i++) {
            for (let j = 0; j < heightNum; j++) {
                colorIndex = (colorIndex + 1) % this.colorPalette.length;
                bricks.push(new Brick(
                    new Vector2(topLeft.x + i * brickWidth + brickWidth / 2,
                        topLeft.y + j * brickHeight + brickHeight / 2),
                    brickWidth - gap, brickHeight - gap,
                    this.colorPalette[colorIndex]));
            }
        }
        return bricks;
    }

}