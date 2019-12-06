import * as posenet from '@tensorflow-models/posenet';
import Stats from 'stats.js';

const color = 'black'
let stats;
let recording = false;
let replaying = false;
let replayFrameNo = 0;
let recordings = [];

/*
* BLIEPBLIEPBLOOP
*/
document.getElementById('record-button').onclick = function startRecord() {
  console.log('start recording')
  document.getElementById('record-button').disabled = true;
  recordings.push({
    name:'Cool1',
    frames:[]
  })
  recording = true;
}
document.getElementById('replay-button').onclick = function startReplay() {
  replaying = true;
  replayFrameNo = 0;
  document.getElementById('record-button').disabled = true;
  document.getElementById('record-button').innerHTML = 'Replaying...';
}

const videoWidth = 600;
const videoHeight = 500;
/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: videoWidth,
      height: videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

/*
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  // since images are being fed from a webcam, we want to feed in the
  // original image and then just flip the keypoints' x coordinates. If instead
  // we flip the image, then correcting left-right keypoint pairs requires a
  // permutation on all the keypoints.
  const flipPoseHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {

    // Begin monitoring code for frames per second
    stats.begin();

    let poses = [];

    if(replaying){
      let currentRecording = recordings[recordings.length - 1];
      poses = currentRecording.frames[replayFrameNo];
      replayFrameNo++;

    }else{

      let all_poses = await net.estimatePoses(video, {
        flipHorizontal: flipPoseHorizontal,
        decodingMethod: 'multi-person',
        maxDetections: 2,
        scoreThreshold: 0.1,
        nmsRadius: 30
      });
  
      poses = poses.concat(all_poses);
  
     if(recording){
       let currentRecording = recordings[recordings.length - 1];
      
      currentRecording.frames.push(Object.create(poses));
      if(currentRecording.frames.length > 40){
        recording = false;
        console.log('recording finished')
        document.getElementById('record-button').disabled = false;
        console.log(recordings);
      }
     }

    }

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
   // ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();
  

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores
    let posesCopy = [...poses];
    posesCopy.forEach(({score, keypoints}) => {
      if (score >= 0.2) {
        
          // Remove hips and shoulders from skeleton,
          // use only center of both for stick-figure look
          let head = keypoints.splice(1,4);
          let shoulders = keypoints.splice(1,2);
          let hips = keypoints.splice(5,2);

          keypoints.push({
            score: ( shoulders[0].score + shoulders[1].score )/ 2,
            part: "middleShoulder",
            position:{
              x: ( shoulders[0].position.x + shoulders[1].position.x )/ 2,
              y: ( shoulders[0].position.y + shoulders[1].position.y )/ 2,
            }
          })
          keypoints.push({
            score: ( hips[0].score + hips[1].score )/ 2,
            part: "middleHip",
            position:{
              x: ( hips[0].position.x + hips[1].position.x )/ 2,
              y: ( hips[0].position.y + hips[1].position.y )/ 2,
            }
          })
       
          keypoints.push(head[0]);
          keypoints.push(head[1]);

         // console.log(keypoints)
          drawKeypoints(keypoints, 0.1, ctx);

          drawSkeleton(keypoints, 0.15, ctx);
      }
    });

    // End monitoring code for frames per second
    stats.end();

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {

  const net = await posenet.load({
   architecture: 'ResNet50',
    outputStride: 32,
    inputResolution: { width: 257, height: 200 },
    quantBytes: 2
    // architecture: 'MobileNetV1',
    // outputStride: 16,
    // inputResolution: { width: 640, height: 480 },
    // multiplier: 0.75
  });

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  stats = new Stats();
  stats.showPanel(0);
  document.getElementById('main').appendChild(stats.dom);
  detectPoseInRealTime(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// kick off the demo
bindPage();

/*
* Draws a pose skeleton by looking up all adjacent keypoints/joints
*/
 function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {

 //const adjacentKeyPoints =
   //  posenet.getAdjacentKeyPoints(keypoints, minConfidence);

//  keypoints.forEach((keypointes) => {
//    console.log(keypointes)
//    drawSegment(
//        toTuple(keypoints[0].position), toTuple(keypoints[1].position), color,
//        scale, ctx);
//  });

  // Middle stick
  drawSegment(toTuple(keypoints[9].position), toTuple(keypoints[10].position), color, scale, ctx);

  // Left arm
  drawSegment(toTuple(keypoints[1].position), toTuple(keypoints[3].position), color, scale, ctx);
  drawSegment(toTuple(keypoints[1].position), toTuple(keypoints[9].position), color, scale, ctx);

  // Right arm
  drawSegment(toTuple(keypoints[2].position), toTuple(keypoints[4].position), color, scale, ctx);
  drawSegment(toTuple(keypoints[2].position), toTuple(keypoints[9].position), color, scale, ctx);

  // Left leg
  drawSegment(toTuple(keypoints[5].position), toTuple(keypoints[7].position), color, scale, ctx);
  drawSegment(toTuple(keypoints[5].position), toTuple(keypoints[10].position), color, scale, ctx);

  // Right leg
  drawSegment(toTuple(keypoints[6].position), toTuple(keypoints[8].position), color, scale, ctx);
  drawSegment(toTuple(keypoints[6].position), toTuple(keypoints[10].position), color, scale, ctx);
  
   //Neck
   drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[9].position), color, scale, ctx);

  // Draw head
  ctx.beginPath();
  ctx.arc(keypoints[0].position.x, keypoints[0].position.y, 40, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();

  // Draw Eyes
  ctx.beginPath();
  ctx.arc(keypoints[11].position.x, keypoints[11].position.y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#000';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(keypoints[12].position.x, keypoints[12].position.y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#000';
  ctx.fill();
 
}

/**
* Draw pose keypoints onto a canvas
*/
function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
 for (let i = 0; i < keypoints.length; i++) {
   const keypoint = keypoints[i];

   if (keypoint.score < minConfidence) {
     continue;
   }

   const {y, x} = keypoint.position;
   drawPoint(ctx, y * scale, x * scale, 3, color);
 }
}

function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}
/**
 * Draws a line on a canvas, i.e. a joint
 */
function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = 10;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function toTuple({y, x}) {
  return [y, x];
}
