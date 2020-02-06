export default class PoseDrawer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.videoWidth = 600;
    this.videoHeight = 500;
  }

  drawFrame(posesOg) {
    let poses = JSON.parse(JSON.stringify(posesOg));

    this.ctx.clearRect(0, 0, 1080, 1920);

    for (let { score, keypoints } of poses) {
      if (score >= 0.2) {
        // Remove hips and shoulders from skeleton,
        // use only center of both for stick-figure look
        let head = keypoints.splice(1, 4);
        let shoulders = keypoints.splice(1, 2);
        let hips = keypoints.splice(5, 2);

        keypoints.push({
          score: (shoulders[0].score + shoulders[1].score) / 2,
          part: 'middleShoulder',
          position: {
            x: (shoulders[0].position.x + shoulders[1].position.x) / 2,
            y: (shoulders[0].position.y + shoulders[1].position.y) / 2,
          },
        });
        keypoints.push({
          score: (hips[0].score + hips[1].score) / 2,
          part: 'middleHip',
          position: {
            x: (hips[0].position.x + hips[1].position.x) / 2,
            y: (hips[0].position.y + hips[1].position.y) / 2,
          },
        });

        keypoints.push(head[0]);
        keypoints.push(head[1]);

        for (let keypoint of keypoints) {
          keypoint.position.x += 100;
          keypoint.position.y += 300;
        }

        this.drawSkeleton(keypoints, 0.15);
      }
    }

    return poses;
  }

  /*
   * Draws a pose skeleton by looking up all adjacent keypoints/joints
   */
  drawSkeleton(keypoints, scale = 1) {
    let color = '#fe53bb';

    // Middle stick
    this.drawSegment(
      this.toTuple(keypoints[9].position),
      this.toTuple(keypoints[10].position),
      color,
      scale,
      this.ctx
    );

    // Left arm
    this.drawSegment(
      this.toTuple(keypoints[1].position),
      this.toTuple(keypoints[3].position),
      color,
      scale,
      this.ctx
    );
    this.drawSegment(
      this.toTuple(keypoints[1].position),
      this.toTuple(keypoints[9].position),
      color,
      scale,
      this.ctx
    );

    // Right Hand
    this.ctx.beginPath();
    this.ctx.arc(keypoints[4].position.x, keypoints[4].position.y, 10, 0, 2 * Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Right arm
    this.drawSegment(
      this.toTuple(keypoints[2].position),
      this.toTuple(keypoints[4].position),
      color,
      scale,
      this.ctx
    );
    this.drawSegment(
      this.toTuple(keypoints[2].position),
      this.toTuple(keypoints[9].position),
      color,
      scale,
      this.ctx
    );

    // Left leg
    this.drawSegment(
      this.toTuple(keypoints[5].position),
      this.toTuple(keypoints[7].position),
      color,
      scale,
      this.ctx
    );
    this.drawSegment(
      this.toTuple(keypoints[5].position),
      this.toTuple(keypoints[10].position),
      color,
      scale,
      this.ctx
    );

    // Right leg
    this.drawSegment(
      this.toTuple(keypoints[6].position),
      this.toTuple(keypoints[8].position),
      color,
      scale,
      this.ctx
    );
    this.drawSegment(
      this.toTuple(keypoints[6].position),
      this.toTuple(keypoints[10].position),
      color,
      scale,
      this.ctx
    );

    // Neck
    let neckX = keypoints[0].position.x;
    let neckY = keypoints[0].position.y + 40;
    this.drawSegment([neckY, neckX], this.toTuple(keypoints[9].position), color, scale, this.ctx);

    // Draw head
    this.ctx.beginPath();
    this.ctx.arc(keypoints[0].position.x, keypoints[0].position.y, 40, 0, 2 * Math.PI);

    this.ctx.strokeStyle = color;
    this.ctx.stroke();

    // Draw Eyes
    this.ctx.beginPath();
    this.ctx.arc(keypoints[11].position.x, keypoints[11].position.y, 10, 0, 2 * Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(keypoints[12].position.x, keypoints[12].position.y, 10, 0, 2 * Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /*
   * Draws a line on a canvas, i.e. a joint
   */
  drawSegment([ay, ax], [by, bx], color, scale) {
    this.ctx.beginPath();
    this.ctx.moveTo(ax, ay);
    this.ctx.lineTo(bx, by);
    this.ctx.lineWidth = 5;
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
