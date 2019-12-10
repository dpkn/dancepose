import PoseDetector from './PoseDetector.js'
import PoseDrawer from './PoseDrawer.js'
import Stats from 'stats.js';
import { inTopKAsync } from '@tensorflow/tfjs-core';

let poseDetector = new PoseDetector(loop);

const canvas = document.getElementById('output');
canvas.width = 600;
canvas.height = 500;

let poseDrawer = new PoseDrawer(canvas);

let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let recording = false;
let replaying = false;
let replayFrameNo = 0;
let recordings = [];

async function loop() {
    stats.begin();
    
    let poseData;

    if(replaying){

        let currentRecording = recordings[recordings.length - 1];
        poseData = currentRecording.frames[replayFrameNo];

        if(replayFrameNo > currentRecording.frames.length-2)
        replayFrameNo = 1;

        replayFrameNo++;
  
    }else{
  
        poseData = await poseDetector.poseDetectionFrame();
       
        if(recording){
           let currentRecording = recordings[recordings.length - 1];
           currentRecording.frames.push(poseData);

           if(currentRecording.frames.length > 100){
             recording = false;
             replaying = true;
             console.log('recording finished')
             document.getElementById('record-button').disabled = false;
             console.log(recordings);
             console.log(JSON.stringify(recordings));
           }
        }
    }


    if (poseData)
        poseDrawer.drawFrame(poseData);

    stats.end();
    requestAnimationFrame(loop);
}

/*
* Callbacks
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

    if(replaying){
        replayFrameNo = 0;
        document.getElementById('record-button').disabled = false;
        document.getElementById('record-button').innerHTML = 'Start Recording';
        document.getElementById('replay-button').innerHTML = 'Replay';
    }else{
        replayFrameNo = 0;
        document.getElementById('record-button').disabled = true;
        document.getElementById('record-button').innerHTML = 'Replaying...';
        document.getElementById('replay-button').innerHTML = 'Stop replaying';
    }

    replaying = !replaying;
   

  }
  