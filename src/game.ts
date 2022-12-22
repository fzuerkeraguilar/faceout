import * as faceapi from 'face-api.js';
import { Vector2 } from './gameObjects/vector2';
import { Ball } from './gameObjects/ball';
import { Paddle } from './gameObjects/paddle';
import { Brick } from './gameObjects/brick';
import { gameFieldBuilder } from './gameFieldBuilder';

const MODEL_URL = '/models'

//await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
await faceapi.loadFaceLandmarkModel(MODEL_URL)
await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)


class Game {
    private constraints = { audio: false, video: true, facingMode: "user" };
    private stopped: boolean = true;
    private facecam!: MediaStream;
    private video!: HTMLVideoElement;
    private faceCanvas: HTMLCanvasElement
    private gameCanvas: HTMLCanvasElement
    private faceCTX: CanvasRenderingContext2D;
    private gameCTX: CanvasRenderingContext2D;

    private startButton: HTMLButtonElement;
    private stopButton: HTMLButtonElement;
    private faceDetector = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

    private Ball: Ball;
    private Paddle: Paddle;
    private wallWidth: number = 10;
    private wallHeight: number = 5;
    private score: number = 0;
    private lives: number = 3;
    private fieldBuilder = new gameFieldBuilder([]);
    private Bricks: Brick[] = [];

    constructor() {
        this.startButton = document.querySelector<HTMLButtonElement>("#start")!;
        this.startButton.onclick = this.start.bind(this);

        this.stopButton = document.querySelector<HTMLButtonElement>("#stop")!;
        this.stopButton.onclick = this.stop.bind(this);

        this.faceCanvas = document.querySelector<HTMLCanvasElement>("#overlay")!;
        this.gameCanvas = document.querySelector<HTMLCanvasElement>("#gameBoard")!;
        this.faceCanvas.width = window.innerWidth;
        this.faceCanvas.height = window.innerHeight;
        this.faceCTX = this.faceCanvas.getContext("2d")!;

        this.gameCanvas.width = window.innerWidth;
        this.gameCanvas.height = window.innerHeight;
        this.gameCTX = this.gameCanvas.getContext("2d")!;

        this.Ball = new Ball(new Vector2(this.gameCanvas.width/2, this.gameCanvas.height/2), 25);
        this.Paddle = new Paddle(new Vector2(this.faceCanvas.width/2, this.faceCanvas.height - 50), 100, 25);
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
        if(!navigator.mediaDevices?.getUserMedia) {
            alert("getUserMedia not supported");
            return;
        }
        window.addEventListener("resize", this.resize.bind(this));
        navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
            this.facecam = stream;
            this.video = document.querySelector<HTMLVideoElement>("#video")!;
            this.video.srcObject = this.facecam;
            this.video.play();
            this.stopped = false;
            this.draw();
        }).catch((err) => {
            let errorMessage = "Error getting video stream: " + err;
            alert(errorMessage);
            throw err;
        });

    }

    stop() {
        console.log("stopping");
        if (this.facecam) {
            this.facecam.getTracks().forEach((track) => {
                track.stop();
            });
        }
        this.faceCTX.clearRect(0, 0, this.faceCanvas.width, this.faceCanvas.height);
        this.stopped = true;
    }

    draw() {
        if (this.stopped) {
            this.faceCTX.clearRect(0, 0, this.faceCanvas.width, this.faceCanvas.height);
            return;
        }
        faceapi.detectSingleFace(this.video, this.faceDetector).withFaceLandmarks(true).then((result) => {
            if (!result) {
                return result;
            }
            const dims = faceapi.matchDimensions(this.faceCanvas, this.video, true);
            const resizedResult = faceapi.resizeResults(result, dims);
            const landmarks = resizedResult.landmarks;
            const mouth = landmarks.getMouth();

            const rMouth = new Vector2(mouth[0].x, mouth[0].y);
            const lMouth = new Vector2(mouth[6].x, mouth[6].y);
            const mouthCenter = rMouth.lerp(lMouth, 0.5);
            this.Paddle.position = mouthCenter;
            this.Paddle.draw(this.faceCTX);
            this.Ball.draw(this.gameCTX);
            for (let brick of this.Bricks) {
                brick.draw(this.gameCTX);
            }

            return result;
        }).catch((err) => {
            console.log(err);
        });
        window.requestAnimationFrame(this.draw.bind(this));
    }

    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        this.faceCanvas.width = windowWidth;
        this.faceCanvas.height = windowHeight
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
    }

}

export {Game}