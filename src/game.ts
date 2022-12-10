import * as faceapi from 'face-api.js';
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

    constructor() {
        this.startButton = document.querySelector<HTMLButtonElement>("#start")!;
        this.startButton.onclick = this.start.bind(this);

        this.stopButton = document.querySelector<HTMLButtonElement>("#stop")!;
        this.stopButton.onclick = this.stop.bind(this);

        this.canvas = document.querySelector<HTMLCanvasElement>("#overlay")!;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d")!;
    }

    start() {
        console.log("Starting game");

        if(!navigator.mediaDevices?.getUserMedia) {
            alert("getUserMedia not supported");
            return;
        }

        navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
            this.facecam = stream;
            this.video = document.querySelector<HTMLVideoElement>("#video")!;
            this.video.srcObject = this.facecam;
            this.video.onplay = this.draw.bind(this);
            this.video.play();
        }).catch((err) => {
            let errorMessage = "Error getting video stream: " + err;
            alert(errorMessage);
            throw err;
        });
        this.stopped = false;
    }

    stop() {
        this.facecam.getTracks().forEach((track) => {
            track.stop();
        });
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stopped = true;
    }

    draw() {
        if (this.stopped) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        faceapi.detectSingleFace(this.video, new faceapi.TinyFaceDetectorOptions({inputSize: 320})).withFaceLandmarks(true).then((result) => {
            if (!result) {
                return;
            }
            const dims = faceapi.matchDimensions(this.canvas, this.video, true);
            const resizedResult = faceapi.resizeResults(result, dims);
            faceapi.draw.drawFaceLandmarks(this.canvas, resizedResult);
            return result;
        }).catch((err) => {
            console.log(err);
        });

        setTimeout(() => this.draw());
    }

}

export {Game}