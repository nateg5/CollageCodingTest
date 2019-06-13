const Pencil = function() {
  this.lines = [];
  this.selected = false;
};

Pencil.prototype.addLine = function(line) {
  this.lines.push(line);
}

Pencil.prototype.isEmpty = function() {
  return this.lines.length === 0;
}

Pencil.prototype.draw = function(ctx) {
  this.lines.forEach((line, index) => {
    line.draw(ctx);
  });
  if(this.selected) {
    this.drawEnds(ctx);
  }
};

Pencil.prototype.drawEnds = function(ctx) {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  const drawEnd = (x, y) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };
  drawEnd(this.lines[0].x1, this.lines[0].y1);
  drawEnd(this.lines[this.lines.length-1].x2, this.lines[this.lines.length-1].y2);
};

Pencil.prototype.move = function(dx, dy) {
  this.x1 += dx;
  this.y1 += dy;
  this.x2 += dx;
  this.y2 += dy;
};

Pencil.prototype.squareDistanceFrom = function(x, y) {
  let minSquareDistance;
  this.lines.forEach((line, index) => {
    const { x1, y1, x2, y2 } = line;
    let squareDistance = Geometry.squareDistanceToSegment(x, y, x1, y1, x2, y2);
    if(index === 0 || squareDistance < minSquareDistance) {
        minSquareDistance = squareDistance;
    }
  });
  return minSquareDistance;
};

Pencil.prototype.select = function() {
  this.selected = true;
};

Pencil.prototype.unselect = function() {
  this.selected = false;
};

Pencil.prototype.isSelected = function() {
  return this.selected;
}
