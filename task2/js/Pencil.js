const Pencil = function() {
  this.lines = [];
};

Pencil.prototype.setCursor = function(x, y) {
  this.lines.forEach((line, index) => {
    line.setCursor(x, y);
  });
}

Pencil.prototype.resetCursor = function() {
  this.lines.forEach((line, index) => {
    line.resetCursor();
  });
}

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

Pencil.prototype.move = function(x, y, maxX, maxY) {
  let masterdx;
  let masterdy;
  this.lines.forEach((line, index) => {
    let dx = x - line.getCursor().x;
    let dy = y - line.getCursor().y;
    dx = line.adjustdx(dx, maxX);
    dy = line.adjustdy(dy, maxY);
    if(index === 0 || Math.abs(dx) < Math.abs(masterdx)) {
        masterdx = dx;
    }
    if(index === 0 || Math.abs(dy) < Math.abs(masterdy)) {
        masterdy = dy;
    }
  });
  this.lines.forEach((line, index) => {
    line.moveX(masterdx, maxX);
    line.moveY(masterdy, maxY);
  });
};

/**
 * find the distance of the closest line segment within this pencil to the coordinates
 */
Pencil.prototype.squareDistanceFrom = function(x, y) {
  let minSquareDistance;
  this.lines.forEach((line, index) => {
    let squareDistance = line.squareDistanceFrom(x, y);
    if(index === 0 || squareDistance < minSquareDistance) {
        minSquareDistance = squareDistance;
    }
  });
  return minSquareDistance;
};
