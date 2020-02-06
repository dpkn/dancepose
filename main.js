import PoseDetector from './PoseDetector.js';
import PoseDrawer from './PoseDrawer.js';
import Button from './Button';
import Stats from 'stats.js';

let poseDetector = new PoseDetector(loop);

const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
canvas.width = 1080;
canvas.height = 1920;

let poseDrawer = new PoseDrawer(canvas);

let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let recording = false;
let replaying = false;
let replayFrameNo = 0;
let recordings = [];

let buttons = [new Button(500, 200, 'Start', () => {
  buttons = [];
  record();
})];

let frameNo = 0;
async function loop() {
  stats.begin();

  let poseData;

  if (replaying) {
    let currentRecording = recordings[recordings.length - 1];
    poseData = currentRecording.frames[replayFrameNo];

    if (replayFrameNo > currentRecording.frames.length - 2) {
      replayFrameNo = 1;
    }

    if (frameNo % 2 === 0) {
      replayFrameNo++;
    }

    document.getElementById('count-down').innerHTML = 'Happy with the result?';
    buttons = [new Button(200, 300, 'Yes', () => {
      record();
    }),
    new Button(800, 300, 'No', () => {
      buttons = [];
      record();
    })];
  } else {
    poseData = await poseDetector.poseDetectionFrame();

    if (recording) {
      let currentRecording = recordings[recordings.length - 1];
      currentRecording.frames.push(poseData);

      if (currentRecording.frames.length > 150) {
        recording = false;
        replaying = true;
        console.log('recording finished');
        document.getElementById('record-button').disabled = false;
        console.log(recordings);
        console.log(JSON.stringify(recordings));
      }
    }
  }

  let blop;

  if (poseData) {
    blop = poseDrawer.drawFrame(poseData);
  }

  for (let button of buttons) {
    button.drawFrame(ctx, blop[0].keypoints[4]);
  }


  stats.end();
  requestAnimationFrame(loop);
  frameNo++;
}

/*
* Callbacks
*/
document.getElementById('record-button').onclick = function startRecord() {
  record();
};

document.getElementById('replay-button').onclick = function startReplay() {
  if (replaying) {
    replayFrameNo = 0;
    document.getElementById('record-button').disabled = false;
    document.getElementById('record-button').innerHTML = 'Start Recording';
    document.getElementById('replay-button').innerHTML = 'Replay';
  } else {
    replayFrameNo = 0;
    document.getElementById('record-button').disabled = true;
    document.getElementById('record-button').innerHTML = 'Replaying...';
    document.getElementById('replay-button').innerHTML = 'Stop replaying';
  }

  replaying = !replaying;
};

function record() {
  console.log('start recording');

  let countDownFrom = 3;
  document.getElementById('count-down').innerHTML = 'Ready?';

  let countDown = setInterval(() => {
    document.getElementById('count-down').innerHTML = countDownFrom;

    if (countDownFrom < 1) {
      document.getElementById('count-down').innerHTML = 'dance!!';
      clearInterval(countDown);
    }

    countDownFrom--;
  }, 1000);


  setTimeout(() => {
    document.getElementById('record-button').disabled = true;
    recordings.push({
      name: 'yeatoionka',
      frames: [],
    });
    recording = true;
  }, 3500);
}

