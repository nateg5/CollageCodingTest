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

Pencil.prototype.move = function(dx, dy, maxX, maxY) {
  let canMoveX = true;
  let canMoveY = true;
  this.lines.forEach((line, index) => {
    if(!line.canMoveX(dx, maxX)) {
        canMoveX = false;
    }
    if(!line.canMoveY(dy, maxY)) {
        canMoveY = false;
    }
  });
  if(canMoveX) {
    this.lines.forEach((line, index) => {
        line.moveX(dx, maxX);
    });
  }
  if(canMoveY) {
    this.lines.forEach((line, index) => {
        line.moveY(dy, maxY);
    });
  }
};

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

Pencil.prototype.select = function() {
  this.selected = true;
};

Pencil.prototype.unselect = function() {
  this.selected = false;
};

Pencil.prototype.isSelected = function() {
  return this.selected;
}
