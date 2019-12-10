import * as posenet from '@tensorflow-models/posenet';


export default class PoseDetector{

    constructor(callback){
        this.videoWidth = 600;
        this.videoHeight = 500;
        this.asyncSetup();

        this.callback = callback;
    }

    async asyncSetup() {
      
      this.net = await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: { width: 257, height: 200 },
        quantBytes: 2
        // architecture: 'MobileNetV1',
        // outputStride: 16,
        // inputResolution: { width: 640, height: 480 },
        // multiplier: 0.75
      });
    
      console.log('Model loaded');

      try {
        this.video = await this.setupCamera();
        this.video.play();
        console.log('video started playing');
        this.callback();
      } catch (e) {
        let info = document.getElementById('info');
        info.textContent = 'this browser does not support video capture,' +
            'or this device does not have a camera';
        info.style.display = 'block';
        throw e;
      }

    }      

    async setupCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
              'Browser API navigator.mediaDevices.getUserMedia not available');
        }
      
        const video = document.getElementById('video');
        video.width = this.videoWidth;
        video.height = this.videoHeight;
      
        const stream = await navigator.mediaDevices.getUserMedia({
          'audio': false,
          'video': {
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

        if(!this.net)
        return false;

        let poses = [];
    
        // if(replaying){
        //   let currentRecording = recordings[recordings.length - 1];
        //   poses = currentRecording.frames[replayFrameNo];
        //   replayFrameNo++;
    
        // }else{
    
          let all_poses = await this.net.estimatePoses(video, {
            flipHorizontal: true,
            decodingMethod: 'multi-person',
            maxDetections: 2,
            scoreThreshold: 0.1,
            nmsRadius: 30
          });
      
          poses = poses.concat(all_poses);
      
      //  /  if(recording){
      //      let currentRecording = recordings[recordings.length - 1];
          
      //     currentRecording.frames.push(Object.create(poses));
      //     if(currentRecording.frames.length > 40){
      //       recording = false;
      //       console.log('recording finished')
      //       document.getElementById('record-button').disabled = false;
      //       console.log(recordings);
      //     }
      //    }
    
      //  }
    
      
    
        // // For each pose (i.e. person) detected in an image, loop through the poses
        // // and draw the resulting skeleton and keypoints if over certain confidence
        // // scores
        // let posesCopy = [...poses];
        // posesCopy.forEach(({score, keypoints}) => {
        //   if (score >= 0.2) {
            
        //       // Remove hips and shoulders from skeleton,
        //       // use only center of both for stick-figure look
        //       let head = keypoints.splice(1,4);
        //       let shoulders = keypoints.splice(1,2);
        //       let hips = keypoints.splice(5,2);
    
        //       keypoints.push({
        //         score: ( shoulders[0].score + shoulders[1].score )/ 2,
        //         part: "middleShoulder",
        //         position:{
        //           x: ( shoulders[0].position.x + shoulders[1].position.x )/ 2,
        //           y: ( shoulders[0].position.y + shoulders[1].position.y )/ 2,
        //         }
        //       })
        //       keypoints.push({
        //         score: ( hips[0].score + hips[1].score )/ 2,
        //         part: "middleHip",
        //         position:{
        //           x: ( hips[0].position.x + hips[1].position.x )/ 2,
        //           y: ( hips[0].position.y + hips[1].position.y )/ 2,
        //         }
        //       })
           
        //       keypoints.push(head[0]);
        //       keypoints.push(head[1]);
    
        //      // console.log(keypoints)
        //       drawKeypoints(keypoints, 0.1, ctx);
    
        //       drawSkeleton(keypoints, 0.15, ctx);
        //   }
        // });

        return poses;
    
        // End monitoring code for frames per second
  
      }

};