import PoseDetector from './PoseDetector.js'
import PoseDrawer from './PoseDrawer.js'
import Stats from 'stats.js';

let poseDetector = new PoseDetector();
let poseDrawer = new PoseDrawer();

let stats = new Stats();
stats.showPanel(0);


async function loop(){
    let poseData =  await poseDetector.poseDetectionFrame();
    poseDrawer.drawFrame(poseData);
    requestAnimationFrame(loop);

}
loop();