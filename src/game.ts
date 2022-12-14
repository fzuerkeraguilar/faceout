import * as faceapi from 'face-api.js';
import { Vector2 } from './gameObjects/vector2';
import { Ball } from './gameObjects/ball';
import { Paddle } from './gameObjects/paddle';
import { Brick } from './gameObjects/brick';
import { gameFieldBuilder } from './gameFieldBuilder';

const MODEL_URL = '/models'




class Game {
    private constraints = { audio: false, video: true, facingMode: "user" };
    private stopped: boolean = true;
    private paused: boolean = false;
    private facecam!: MediaStream;
    private video!: HTMLVideoElement;
    private gameCanvas: HTMLCanvasElement
    private gameCTX: CanvasRenderingContext2D;

    private startButton: HTMLButtonElement;
    private pauseButton: HTMLButtonElement;
    private stopButton: HTMLButtonElement;
    private livesText: HTMLParagraphElement;
    private scoreText: HTMLParagraphElement;
    private lastFrameTime: DOMHighResTimeStamp = 0;
    private faceDetected: number = 0;
    private faceDetectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

    private Ball: Ball;
    private Paddle: Paddle;
    private wallWidth: number = 10;
    private wallHeight: number = 5;
    private score: number = 0;
    private lives: number = 3;
    private fieldBuilder = new gameFieldBuilder([]);
    private Bricks: Brick[] = [];
    private deathHeight: number = 0;

    constructor() {
        this.startButton = document.querySelector<HTMLButtonElement>("#start")!;
        this.startButton.onclick = this.start.bind(this);

        this.pauseButton = document.querySelector<HTMLButtonElement>("#pause")!;
        this.pauseButton.onclick = this.pause.bind(this);

        this.stopButton = document.querySelector<HTMLButtonElement>("#stop")!;
        this.stopButton.onclick = this.stop.bind(this);

        this.gameCanvas = document.querySelector<HTMLCanvasElement>("#gameBoard")!;
        this.gameCanvas.width = window.innerWidth;
        this.gameCanvas.height = window.innerHeight;
        this.gameCTX = this.gameCanvas.getContext("2d")!;
        this.livesText = document.querySelector<HTMLParagraphElement>("#lives")!;
        this.scoreText = document.querySelector<HTMLParagraphElement>("#score")!;
        this.livesText.innerText = "Lives: " + this.lives;
        this.scoreText.innerText = "Score: " + this.score;
        this.deathHeight = this.gameCanvas.height * 0.9;

        window.addEventListener("resize", this.resize.bind(this));
        if(!navigator.mediaDevices?.getUserMedia) {
            alert("getUserMedia not supported");
        } else {
            navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
                this.facecam = stream;
                this.video = document.querySelector<HTMLVideoElement>("#video")!;
                this.video.srcObject = this.facecam;
                this.video.play();
            }).catch((err) => {
                let errorMessage = "Error getting video stream: " + err;
                alert(errorMessage);
                throw err;
            });
        }
        this.stopped = true;
        this.Ball = new Ball(Vector2.zero(), 25);
        this.Paddle = new Paddle(Vector2.zero(), 120, 40);
        this.Bricks = this.fieldBuilder.getRectGameField(
            new Vector2(0, 0),
            this.gameCanvas.width - 20,
            this.gameCanvas.height / 4,
            this.wallWidth,
            this.wallHeight,
            10
        );
    }

    start() {
        if (!this.stopped) {
            return;
        }
        console.log("starting");
        this.Ball.velocity = new Vector2(0.3, -0.3);
        this.Ball.position = new Vector2(this.gameCanvas.width/2, this.gameCanvas.height/2);
        this.Paddle.position = new Vector2(this.gameCanvas.width/2, this.gameCanvas.height - 50);
        this.stopped = false;
        window.requestAnimationFrame(this.draw.bind(this));
    }

    pause() {
        if (this.stopped) {
            return;
        }
        console.log("pausing");
        this.paused = !this.paused;
        if (!this.paused) {
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    stop() {
        if (this.stopped) {
            return;
        }
        console.log("stopping");
        this.faceDetected = 0;
        this.lastFrameTime = 0;
        this.gameCTX.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.stopped = true;
        this.paused = false;
        this.score = 0;
        this.lives = 3;
        this.scoreText.innerText = "Score: " + this.score;
        this.livesText.innerText = "Lives: " + this.lives;

        this.Ball = new Ball(Vector2.zero(), 25);
        this.Paddle = new Paddle(Vector2.zero(), 120, 40);
        this.Bricks = this.fieldBuilder.getRectGameField(
            new Vector2(0, 0),
            this.gameCanvas.width - 20,
            this.gameCanvas.height / 4,
            this.wallWidth,
            this.wallHeight,
            10
        );
    }

    draw(timestamp: DOMHighResTimeStamp) {
        if (this.stopped) {
            return;
        }
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = timestamp;
        }
        const deltaTime = timestamp - this.lastFrameTime;
        faceapi.detectSingleFace(this.video, this.faceDetectorOptions).withFaceLandmarks(true).then((result) => {
            if (!result) {
                return result;
            }
            const mouth = result.landmarks.getMouth();
            const rMouth = new Vector2(mouth[0].x, mouth[0].y);
            const lMouth = new Vector2(mouth[6].x, mouth[6].y);
            const mouthCenter = rMouth.lerp(lMouth, 0.5);
            this.Paddle.position = this.translatePosition(mouthCenter);
            if (this.faceDetected < 3) {
                this.faceDetected++;
            }
            return result;
        }).catch((err) => {console.log(err)})

        if (this.faceDetected > 2 && !this.paused) {
            this.Ball.update(deltaTime)
            if (this.Ball.position.y > this.deathHeight) {
                this.lives--;
                this.livesText.innerText = "Lives: " + this.lives;
                this.Ball.position = new Vector2(this.gameCanvas.width/2, this.gameCanvas.height/2);
                this.Ball.velocity = new Vector2(0.3, -0.3);
            }
            if (this.lives <= 0) {
                this.stop();
                window.alert("Game Over");
                return;
            }
            this.score += this.Ball.collisionCheck(this.gameCanvas, this.Bricks, this.Paddle);
            if (this.score >= this.Bricks.length ) {
                this.stop();
                window.alert("You Win!");
                return;
            }
        }

        this.gameCTX.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.Paddle.draw(this.gameCTX);
        this.Paddle.draw(this.gameCTX);
        this.Ball.draw(this.gameCTX);
        for (let brick of this.Bricks) {
            if (brick.destroyed) {
                continue;
            }
            brick.draw(this.gameCTX);
        }

        this.gameCTX.strokeStyle = "red";
        this.gameCTX.beginPath();
        this.gameCTX.moveTo(0, this.deathHeight);
        this.gameCTX.lineTo(this.gameCanvas.width, this.deathHeight);
        this.gameCTX.stroke();

        this.livesText.innerText = "Lives: " + this.lives;
        this.scoreText.innerText = "Score: " + this.score;

        this.lastFrameTime = timestamp;
        window.requestAnimationFrame(this.draw.bind(this));
    }

    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        this.gameCanvas.width = windowWidth;
        this.gameCanvas.height = windowHeight
        const brickHeight = (this.gameCanvas.height/ 4) / this.wallHeight;
        const brickWidth = (this.gameCanvas.width) / this.wallWidth;
        const padding = 10;
        for (let i = 0; i < this.wallWidth; i++) {
            for (let j = 0; j < this.wallHeight; j++) {
                this.Bricks[i * this.wallHeight + j].position = new Vector2(i * brickWidth + brickWidth / 2, j * brickHeight + brickHeight / 2);
                this.Bricks[i * this.wallHeight + j].resize(brickWidth - padding, brickHeight - padding);
            }
        }
        this.deathHeight = this.gameCanvas.height * 0.9;
    }

    translatePosition(position: Vector2): Vector2 {
        //TODO: make this work for when window is wider than video
        const scalar = this.video.videoHeight / this.gameCanvas.height;
        const top_left_x = this.video.videoWidth / 2 - this.gameCanvas.width * scalar / 2;
        const top_left_y = 0;
        const bottom_right_x = this.video.videoWidth / 2 + this.gameCanvas.width * scalar / 2;
        const bottom_right_y = this.video.videoHeight;
        const x = (position.x - top_left_x) / (bottom_right_x - top_left_x) * this.gameCanvas.width;
        const y = (position.y - top_left_y) / (bottom_right_y - top_left_y) * this.gameCanvas.height;
        return new Vector2(x, y);
    }

    async loadModels() {
        await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
        await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)
    }
}

export {Game}