const Line = function(x1, y1, x2, y2, length) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.length = Geometry.squareDistance(x1, y1, x2, y2);
  this.selected = false;
};

Line.prototype.draw = function(ctx) {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(this.x1, this.y1);
  ctx.lineTo(this.x2, this.y2);
  ctx.stroke();
  if(this.selected) {
    this.drawEnds(ctx);
  }
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

Line.prototype.move = function(dx, dy, maxX, maxY) {
  this.moveX(dx, maxX);
  this.moveY(dy, maxY);
};

Line.prototype.moveX = function(dx, maxX) {
  if(this.canMoveX(dx, maxX)) {
    this.x1 += dx;
    this.x2 += dx;
  }
};

Line.prototype.moveY = function(dy, maxY) {
  if(this.canMoveY(dy, maxY)) {
    this.y1 += dy;
    this.y2 += dy;
  }
};

Line.prototype.canMoveX = function(dx, maxX) {
  if(this.x1 + dx < 0 || this.x1 + dx > maxX) return false;
  if(this.x2 + dx < 0 || this.x2 + dx > maxX) return false;

  return true;
}

Line.prototype.canMoveY = function(dy, maxY) {
  if(this.y1 + dy < 0 || this.y1 + dy > maxY) return false;
  if(this.y2 + dy < 0 || this.y2 + dy > maxY) return false;

  return true;
}

Line.prototype.squareDistanceFrom = function(x, y) {
  const { x1, y1, x2, y2 } = this;
  return Geometry.squareDistanceToSegment(x, y, x1, y1, x2, y2);
};

Line.prototype.select = function() {
  this.selected = true;
};

Line.prototype.unselect = function() {
  this.selected = false;
};

Line.prototype.isSelected = function() {
  return this.selected;
}
