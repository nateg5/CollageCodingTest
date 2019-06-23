const Pencil = function(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.cursor = null;
  this.lines = [];
};

Pencil.prototype.setCursor = function(x, y) {
  this.cursor = {
    x: x,
    y: y
  };
}

Pencil.prototype.resetCursor = function() {
  this.cursor = null;
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
  let dx = this.adjustdx(x - this.cursor.x, maxX);
  this.x1 += dx;
  this.x2 += dx;
  this.cursor.x += dx;

  let dy = this.adjustdy(y - this.cursor.y, maxY);
  this.y1 += dy;
  this.y2 += dy;
  this.cursor.y += dy;

  if(dx !== 0 || dy !== 0) {
    this.lines.forEach((line, index) => {
      line.moveX(dx, maxX);
      line.moveY(dy, maxY);
    });
  }
};

Pencil.prototype.adjustdx = function(dx, maxX) {
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

Pencil.prototype.adjustdy = function(dy, maxY) {
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

Pencil.prototype.calculateBounds = function(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.lines.forEach((line, index) => {
    let bounds = line.getBounds();
    if(bounds.x1 < this.x1) {
      this.x1 = bounds.x1;
    }
    if(bounds.y1 < this.y1) {
      this.y1 = bounds.y1;
    }
    if(bounds.x2 > this.x2) {
      this.x2 = bounds.x2;
    }
    if(bounds.y2 > this.y2) {
      this.y2 = bounds.y2;
    }
  });
}
