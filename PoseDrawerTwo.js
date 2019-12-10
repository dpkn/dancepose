export default class PoseDrawerTwo {
    constructor(two) {

        this.two = two;
        this.videoWidth = 5120;
        this.videoHeight = 2880;
    
    }

    drawFrame(posesOg,two){

        two.clear();

        let poses = JSON.parse(JSON.stringify(posesOg))

         poses.forEach(({score, keypoints}) => {
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
    
              for(let i )
              this.drawSkeleton(keypoints, 0.15);
          }
        });
    }

    /*
    * Draws a pose skeleton by looking up all adjacent keypoints/joints
    */
    drawSkeleton(keypoints, scale = 1) {
        let color = '#fff';

        // Middle stick
        this.drawSegment(this.toTuple(keypoints[9].position), this.toTuple(keypoints[10].position));

        // Left arm
        this.drawSegment(this.toTuple(keypoints[1].position), this.toTuple(keypoints[3].position));
        this.drawSegment(this.toTuple(keypoints[1].position), this.toTuple(keypoints[9].position));

        // Right arm
        this.drawSegment(this.toTuple(keypoints[2].position), this.toTuple(keypoints[4].position));
        this.drawSegment(this.toTuple(keypoints[2].position), this.toTuple(keypoints[9].position));

        // Left leg
        this.drawSegment(this.toTuple(keypoints[5].position), this.toTuple(keypoints[7].position));
        this.drawSegment(this.toTuple(keypoints[5].position), this.toTuple(keypoints[10].position));

        // Right leg
        this.drawSegment(this.toTuple(keypoints[6].position), this.toTuple(keypoints[8].position));
        this.drawSegment(this.toTuple(keypoints[6].position), this.toTuple(keypoints[10].position));

        // Neck
        let neckX = keypoints[0].position.x;
        let neckY = keypoints[0].position.y+40;
        this.drawSegment([neckY,neckX], this.toTuple(keypoints[9].position));

        this.two.makeCircle(keypoints[0].position.x, keypoints[0].position.y, 40);
        // // Draw head
        // this.ctx.beginPath();
        // this.ctx.arc(keypoints[0].position.x, keypoints[0].position.y, 40, 0, 2 * Math.PI);

        // this.ctx.strokeStyle = color;
        // this.ctx.stroke();

        // // Draw Eyes
        // this.ctx.beginPath();
        // this.ctx.arc(keypoints[11].position.x, keypoints[11].position.y, 10, 0, 2 * Math.PI);
        // this.ctx.fillStyle = color;
        // this.ctx.fill();

        // this.ctx.beginPath();
        // this.ctx.arc(keypoints[12].position.x, keypoints[12].position.y, 10, 0, 2 * Math.PI);
        // this.ctx.fillStyle = color;
        // this.ctx.fill();

    }

    /*
     * Draws a line on a canvas, i.e. a joint
     */
    drawSegment([ay, ax], [by, bx]) {
        // this.ctx.beginPath();
        // this.ctx.moveTo(ax, ay);
        // this.ctx.lineTo(bx, by);
        // this.ctx.lineWidth = 10;
        // this.ctx.strokeStyle = color;
        // this.ctx.stroke();
      
        let line = this.two.makeLine(ax,ay,bx,by);
        line.stroke = 'orangered'; // Accepts all valid css color
        line.linewidth = 5;


    }

    /*
     * Takes in position object and returns it as array
     */
    toTuple({ y, x }) {
        return [y, x];
    }


}