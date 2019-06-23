const Line = function(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.cursor = null;
};

Line.prototype.setCursor = function(x, y) {
  this.cursor = {
    x: x,
    y: y
  };
}

Line.prototype.resetCursor = function() {
  this.cursor = null;
}

Line.prototype.draw = function(ctx) {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(this.x1, this.y1);
  ctx.lineTo(this.x2, this.y2);
  ctx.stroke();
};

Line.prototype.drawEnds = function(ctx) {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  const drawEnd = (x, y) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };
  drawEnd(this.x1, this.y1);
  drawEnd(this.x2, this.y2);
};

Line.prototype.move = function(x, y, maxX, maxY) {
  /**
   * move x and y independently
   * this is necessary when the object starts to hit the edge of the canvas
   */
  this.moveX(x - this.cursor.x, maxX);
  this.moveY(y - this.cursor.y, maxY);
};

Line.prototype.moveX = function(dx, maxX) {
  dx = this.adjustdx(dx, maxX);
  this.x1 += dx;
  this.x2 += dx;
  if(this.cursor) {
    this.cursor.x += dx;
  }
};

Line.prototype.moveY = function(dy, maxY) {
  dy = this.adjustdy(dy, maxY);
  this.y1 += dy;
  this.y2 += dy;
  if(this.cursor) {
    this.cursor.y += dy;
  }
};

Line.prototype.adjustdx = function(dx, maxX) {
  if(this.x1 + dx < 0) {
    dx = 0 - this.x1;
  } else if(this.x1 + dx > maxX) {
    dx = maxX - this.x1;
  }
  if(this.x2 + dx < 0) {
    dx = 0 - this.x2;
  } else if(this.x2 + dx > maxX) {
    dx = maxX - this.x2;
  }
  return dx;
};

Line.prototype.adjustdy = function(dy, maxY) {
  if(this.y1 + dy < 0) {
    dy = 0 - this.y1;
  } else if(this.y1 + dy > maxY) {
    dy = maxY - this.y1;
  }
  if(this.y2 + dy < 0) {
    dy = 0 - this.y2;
  } else if(this.y2 + dy > maxY) {
    dy = maxY - this.y2;
  }
  return dy;
};

Line.prototype.squareDistanceFrom = function(x, y) {
  const { x1, y1, x2, y2 } = this;
  return Geometry.squareDistanceToSegment(x, y, x1, y1, x2, y2);
};

Line.prototype.getBounds = function() {
  return {
    x1: this.x1 < this.x2 ? this.x1 : this.x2,
    y1: this.y1 < this.y2 ? this.y1 : this.y2,
    x2: this.x1 < this.x2 ? this.x2 : this.x1,
    y2: this.y1 < this.y2 ? this.y2 : this.y1
  };
}