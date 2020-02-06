export default class Button {
  constructor(x, y, label, callback, radius = 70) {
    this.position = { x, y };
    this.label = label;
    this.timerStarted = false;
    this.buttonPressed = false;
    this.counter = 0.0;
    this.radius = radius;
    this.callback = callback;
  }

  drawFrame(ctx, keypoints) {
    if (keypoints.position.x > this.position.x - this.radius
      && keypoints.position.x < this.position.x + this.radius
      && keypoints.position.y > this.position.y - this.radius
      && keypoints.position.y < this.position.y + this.radius) {
      this.buttonPressed = true;
    } else {
      this.buttonPressed = false;
    }

    // Draw UI
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#fff';
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();

    if (this.buttonPressed && !this.timerStarted) {
      this.timerStarted = true;
    } else if (this.timerStarted && this.buttonPressed && !this.on) {
      ctx.beginPath();
      ctx.lineWidth = 20;
      ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI * this.counter);
      ctx.stroke();

      if (this.counter >= 1) {
        this.on = true;
        this.callback();
      } else {
        this.counter += 0.05;
      }
    } else if (this.timerStarted && !this.buttonPressed) {
      this.counter = 0;
      this.timerStarted = false;
    }

    if (this.on) {
      ctx.beginPath();

      ctx.lineWidth = 0;
      ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(this.label, this.position.x, this.position.y + this.radius * 2);
  }
}


