export default class PoseDrawer {
    constructor(canvasContext) {
        console.log('boop')

        this.ctx = canvasContext;
        
    }

    drawFrame(){
        this.ctx.clearRect(0, 0, videoWidth, videoHeight);
    
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.translate(-this.videoWidth, 0);
       // this.ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        this.ctx.restore();
    }

    /*
    * Draws a pose skeleton by looking up all adjacent keypoints/joints
    */
    drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {

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
        this.ctx.beginPath();
        this.ctx.arc(keypoints[0].position.x, keypoints[0].position.y, 40, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();

        // Draw Eyes
        this.ctx.beginPath();
        this.ctx.arc(keypoints[11].position.x, keypoints[11].position.y, 10, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(keypoints[12].position.x, keypoints[12].position.y, 10, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();

    }

    /*
     * Draws a line on a canvas, i.e. a joint
     */
    drawSegment([ay, ax], [by, bx], color, scale, ctx) {
        this.ctx.beginPath();
        this.ctx.moveTo(ax * scale, ay * scale);
        this.ctx.lineTo(bx * scale, by * scale);
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

    /*
     * Takes in position object and returns it as array
     */
    toTuple({ y, x }) {
        return [y, x];
    }


}