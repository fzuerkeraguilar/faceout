import * as faceapi from 'face-api.js';
const MODEL_URL = '/models'

await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
await faceapi.loadFaceLandmarkModel(MODEL_URL)


class Game {
    private facecam!: MediaStream;
    public video!: HTMLVideoElement;
    private canvas!: HTMLCanvasElement;

    constructor() {

        let constraints = { audio: false, video: true, facingMode: "user"}
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            console.log(devices);
        });
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.facecam = stream;
            this.video = document.querySelector<HTMLVideoElement>("#video")!;
            this.video.srcObject = this.facecam;
            this.video.onplay = this.draw.bind(this);
            this.video.play();
        }).catch((err) => {
            throw err;
        });
        this.canvas = document.querySelector<HTMLCanvasElement>("#overlay")!;
    }

    async start() {
        console.log("Starting game");
    }

    async draw() {
        faceapi.detectSingleFace(this.video).withFaceLandmarks().then((result) => {
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