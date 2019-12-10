import Two from 'two.js';
import recordings from './test.json'
import PoseDrawerTwo from './PoseDrawerTwo.js'

import Stats from 'stats.js'
let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let frameNo = 0;

let canvas = document.getElementById('canvas-container');
let two = new Two({
    type:Two.Types.svg,
    width: 5120,
    height: 2880
}).appendTo(canvas);
let poseDrawer = new PoseDrawerTwo(two);

two.bind('update', function(frameCount) {
    stats.begin();

    let currentRecording = recordings[recordings.length - 1];
    let poseData = currentRecording.frames[frameNo];

    if(frameNo > currentRecording.frames.length-2)
    frameNo = 1;

    frameNo++;

    poseDrawer.drawFrame(poseData,two);
    stats.end();

}).play();  // Finally, start the animation loop