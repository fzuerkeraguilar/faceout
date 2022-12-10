import * as faceapi from 'face-api.js';
import { Vector2 } from './gameObjects/vector2';
import { Ball } from './gameObjects/ball';
import { Paddle } from './gameObjects/paddle';

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
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private startButton!: HTMLButtonElement;
    private stopButton!: HTMLButtonElement;
    private faceDetector = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

    private Ball: Ball;
    private Paddle: Paddle;

    constructor() {
        this.startButton = document.querySelector<HTMLButtonElement>("#start")!;
        this.startButton.onclick = this.start.bind(this);

        this.stopButton = document.querySelector<HTMLButtonElement>("#stop")!;
        this.stopButton.onclick = this.stop.bind(this);

        this.canvas = document.querySelector<HTMLCanvasElement>("#overlay")!;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d")!;

        this.Ball = new Ball(new Vector2(this.canvas.width/2, 100), 25);
        this.Paddle = new Paddle(new Vector2(this.canvas.width/2, this.canvas.height - 50), 100, 25);
    }

    start() {
        if(!navigator.mediaDevices?.getUserMedia) {
            alert("getUserMedia not supported");
            return;
        }

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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stopped = true;
    }

    draw() {
        if (this.stopped) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        faceapi.detectSingleFace(this.video, this.faceDetector).withFaceLandmarks(true).then((result) => {
            if (!result) {
                return result;
            }
            const dims = faceapi.matchDimensions(this.canvas, this.video, true);
            const resizedResult = faceapi.resizeResults(result, dims);
            const landmarks = resizedResult.landmarks;
            const mouth = landmarks.getMouth();

            const rMouth = new Vector2(mouth[0].x, mouth[0].y);
            const lMouth = new Vector2(mouth[6].x, mouth[6].y);
            const mouthCenter = rMouth.lerp(lMouth, 0.5);
            this.Paddle.position = mouthCenter;
            this.Paddle.draw(this.ctx);
            this.Ball.draw(this.ctx);

            return result;
        }).catch((err) => {
            console.log(err);
        });
        window.requestAnimationFrame(this.draw.bind(this));
    }

}

export {Game}