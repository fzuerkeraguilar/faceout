import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { Vector2 } from './utils/vector2';
import { Ball } from './gameObjects/ball';
import { Paddle } from './gameObjects/paddle';
import { GameBoard } from './gameObjects/gameBoard';

export class Game {
    private constraints = { audio: false, video: true, facingMode: "user" };
    private stopped: boolean = true;
    private paused: boolean = false;
    private video!: HTMLVideoElement;
    private gameCanvas: HTMLCanvasElement
    private readonly gameCTX: CanvasRenderingContext2D;
    private livesText: HTMLParagraphElement;
    private scoreText: HTMLParagraphElement;
    private lastFrameTime: DOMHighResTimeStamp = 0;

    private model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    private detectorConfig = {
    runtime: 'mediapipe' as 'mediapipe',
    solutionPath: 'node_modules/@mediapipe/face_mesh',
    refineLandmarks: false,
    maxFaces: 1
    };
    private detector!: faceLandmarksDetection.FaceLandmarksDetector;
    private windowRatio: number = 0;
    private webcamRatio: number = 0;
    private flipHorizontal: boolean = false;

    private Ball: Ball;
    private Paddle: Paddle;
    private wallWidth: number = 10;
    private wallHeight: number = 5;
    private score: number = 0;
    private lives: number = 3;
    private gameBoard: GameBoard;
    private deathHeight: number = 0;
    private countdown: boolean = false;

    constructor() {
        document.querySelector<HTMLButtonElement>("#start")!.onclick = this.start.bind(this);
        document.querySelector<HTMLButtonElement>("#pause")!.onclick = this.pause.bind(this);
        document.querySelector<HTMLButtonElement>("#stop")!.onclick = this.reset.bind(this);
        document.querySelector<HTMLButtonElement>("#flip")!.onclick = this.flipVideo.bind(this);
        window.addEventListener("resize", this.resize.bind(this));

        this.gameCanvas = document.querySelector<HTMLCanvasElement>("#gameBoard")!;
        this.gameCanvas.width = window.innerWidth;
        this.gameCanvas.height = window.innerHeight;
        this.gameCTX = this.gameCanvas.getContext("2d")!;
        this.livesText = document.querySelector<HTMLParagraphElement>("#lives")!;
        this.scoreText = document.querySelector<HTMLParagraphElement>("#score")!;
        this.livesText.innerText = "Lives: " + this.lives;
        this.scoreText.innerText = "Score: " + this.score;

        if(!navigator.mediaDevices?.getUserMedia) {
            alert("getUserMedia not supported");
        } else {
            navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
                this.video = document.querySelector<HTMLVideoElement>("#video")!;
                this.video.srcObject = stream;
                this.video.play();    
            }).catch((err) => {
                alert("Error getting video stream: " + err);
                throw err;
            });
        }
        faceLandmarksDetection.createDetector(this.model, this.detectorConfig).then((detector) => {
            this.detector = detector;
        });

        this.Ball = new Ball(Vector2.zero(), 25);
        this.Paddle = new Paddle(Vector2.zero(), 130, 40);
        this.gameBoard = new GameBoard(this.wallWidth, this.wallHeight, this.gameCanvas.width, this.gameCanvas.height/4);
        this.resize();
    }

    async start() {
        if (!this.stopped) {
            return;
        }
        while(!this.detector) {
            await new Promise(r => setTimeout(r, 100));
        }
        console.log("starting");
        this.Ball.velocity = Vector2.left().scale(-0.4);
        this.Ball.position = new Vector2(this.gameCanvas.width/2, this.gameCanvas.height/2);
        this.webcamRatio = this.video.videoWidth / this.video.videoHeight;

        this.stopped = false;
        this.paused = false;
        this.countdown = true;
        window.requestAnimationFrame(this.draw.bind(this));
    }

    pause() {
        if (this.stopped) {
            return;
        }
        console.log(this.stopped ? "unpausing" : "pausing");
        this.paused = !this.paused;
        if (!this.paused) {
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    reset() {
        if (this.stopped) {
            return;
        }
        console.log("stopping");
        this.lastFrameTime = 0;
        this.gameCTX.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.stopped = true;
        this.paused = false;
        this.score = 0;
        this.lives = 3;
        this.scoreText.innerText = "Score: " + this.score;
        this.livesText.innerText = "Lives: " + this.lives;

        this.Ball = new Ball(Vector2.zero(), 25);
        this.Paddle = new Paddle(Vector2.zero(), 130, 40);
        this.gameBoard.reset();
    }

    async draw(timestamp: DOMHighResTimeStamp) {
        if (this.stopped) {
            return;
        }
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = timestamp;
        }
        const deltaTime = timestamp - this.lastFrameTime;
        this.detector.estimateFaces(this.video, {flipHorizontal: false}).then((results) => {
            if (results) {
                const result = results[0];
                const keypoints = result.keypoints;
                const rMouth = new Vector2(keypoints[76].x, keypoints[76].y);
                const lMouth = new Vector2(keypoints[306].x, keypoints[306].y);
                const mouthCenter = rMouth.lerp(lMouth, 0.5);
                this.Paddle.position = this.translatePosition(mouthCenter).subtract(new Vector2(this.Paddle.width/2, this.Paddle.height/2));
            }
        }).catch((err) => {console.log(err)})

        if(this.countdown) {
            await this.drawCountdown(3);
            window.requestAnimationFrame(this.draw.bind(this));
            return;
        }

        if (!this.paused) {
            if (this.Ball.update(deltaTime, this.gameCanvas.width, this.gameCanvas.height, this.deathHeight)) {
                this.lives--;
                this.Ball.position = new Vector2(this.gameCanvas.width/2, this.gameCanvas.height/2);
            }
            this.score += this.gameBoard.collision(this.Ball);
            if (this.Paddle.collidesWithBall(this.Ball)) {
                this.Ball.collision(this.Paddle.collisionNormal(this.Ball));
            }
        }

        this.gameCTX.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.Paddle.draw(this.gameCTX);
        this.Paddle.draw(this.gameCTX);
        this.Ball.draw(this.gameCTX);
        this.gameBoard.draw(this.gameCTX);

        this.gameCTX.strokeStyle = "red";
        this.gameCTX.beginPath();
        this.gameCTX.moveTo(0, this.deathHeight);
        this.gameCTX.lineTo(this.gameCanvas.width, this.deathHeight);
        this.gameCTX.stroke();

        this.livesText.innerText = "Lives: " + this.lives;
        this.scoreText.innerText = "Score: " + this.score;

        if (this.lives <= 0) {
            this.reset();
            window.alert("Game Over");
            return;
        }

        if (this.score >= this.gameBoard.length) {
            this.reset();
            window.alert("You Win!");
            return;
        }

        this.lastFrameTime = timestamp;
        window.requestAnimationFrame(this.draw.bind(this));
    }

    async drawCountdown(seconds: number) {
        for (let i = 0; i < seconds; i++) {
            this.gameCTX.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
            this.gameCTX.font = "100px Arial";
            this.gameCTX.fillStyle = "red";
            this.gameCTX.textAlign = "center";
            this.gameCTX.fillText((seconds - i).toString(), this.gameCanvas.width / 2, this.gameCanvas.height / 2);
            await new Promise(r => setTimeout(r, 1000));
        }
        this.countdown = false;
    }

    resize() {
        this.gameCanvas.width = window.innerWidth;
        this.gameCanvas.height =  window.innerHeight
        this.gameBoard.resize(this.gameCanvas.width, this.gameCanvas.height/3);
        this.deathHeight = this.gameCanvas.height * 0.9;
        this.windowRatio = window.innerWidth /  window.innerHeight;
    }

    translatePosition(position: Vector2): Vector2 {
        if (this.flipHorizontal) {
            position.x = this.video.videoWidth - position.x;
        }
        if(this.windowRatio < this.webcamRatio) {
            const scalar = this.video.videoHeight / this.gameCanvas.height;
            const top_left_x = this.video.videoWidth / 2 - this.gameCanvas.width * scalar / 2;
            const top_left_y = 0;
            const bottom_right_x = this.video.videoWidth / 2 + this.gameCanvas.width * scalar / 2;
            const bottom_right_y = this.video.videoHeight;
            const x = (position.x - top_left_x) / (bottom_right_x - top_left_x) * this.gameCanvas.width;
            const y = (position.y - top_left_y) / (bottom_right_y - top_left_y) * this.gameCanvas.height;
            return new Vector2(x, y);
        } else {
            const scalar = this.video.videoWidth / this.gameCanvas.width;
            const top_left_x = 0;
            const top_left_y = this.video.videoHeight / 2 - this.gameCanvas.height * scalar / 2;   
            const bottom_right_x = this.video.videoWidth;
            const bottom_right_y = this.video.videoHeight / 2 + this.gameCanvas.height * scalar / 2;
            const x = (position.x - top_left_x) / (bottom_right_x - top_left_x) * this.gameCanvas.width;
            const y = (position.y - top_left_y) / (bottom_right_y - top_left_y) * this.gameCanvas.height;
            return new Vector2(x, y);
        }
    }

    flipVideo() {
        this.flipHorizontal = !this.flipHorizontal;
        this.video.style.transform = this.flipHorizontal ? "scaleX(-1) translate(50%,-50%)" : "";
    }
}