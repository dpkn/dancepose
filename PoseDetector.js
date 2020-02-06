import * as posenet from '@tensorflow-models/posenet';

export default class PoseDetector {
  constructor(callback) {
    this.videoWidth = 600;
    this.videoHeight = 500;
    this.asyncSetup();

    this.callback = callback;
  }

  async asyncSetup() {
    this.net = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 32,
      multiplier: 1,
      inputResolution: { width: 257, height: 200 },
      quantBytes: 2,
      // architecture: 'MobileNetV1',
      // outputStride: 16,
      // inputResolution: { width: 640, height: 480 },
      // multiplier: 0.75,
    });

    console.log('Model loaded');

    try {
      this.video = await this.setupCamera();
      this.video.play();
      console.log('video started playing');
      this.callback();
    } catch (e) {
      throw e;
    }
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.getElementById('video');
    video.width = this.videoWidth;
    video.height = this.videoHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: this.videoWidth,
        height: this.videoHeight,
      },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }

  async poseDetectionFrame() {
    if (!this.net) {
      return false;
    }

    let poses = [];

    let allPoses = await this.net.estimatePoses(video, {
      flipHorizontal: true,
      decodingMethod: 'multi-person',
      maxDetections: 3,
      scoreThreshold: 0.1,
      nmsRadius: 30,
    });

    poses = poses.concat(allPoses);

    return poses;
  }
}
