const MODE = {
  LINE: 'line',
  PENCIL: 'pencil',
  MOVE: 'move',
  SELECT: 'select',
  ERASE: 'erase'
}
const app = {
  initDone: false,
  mode: MODE.LINE,
  lines: [],
  pencil: null,
  pos: null,
  selectedObjectIndex: -1,
  
  init: function() {
    if(this.initDone) {
      return;
    }
    this.bindToolbarEvents();
    this.bindDrawAreaEvents();
    this.initDone = true;
  },
  
  bindToolbarEvents: function() {
    const canvas = document.getElementById('canvas');
    document.getElementById('btn-line').addEventListener('click', () => {
      canvas.style.cursor = "crosshair";
      this.mode = MODE.LINE;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-pencil').addEventListener('click', () => {
      canvas.style.cursor = "crosshair";
      this.mode = MODE.PENCIL;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-move').addEventListener('click', () => {
      canvas.style.cursor = "move";
      this.mode = MODE.MOVE;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-select').addEventListener('click', () => {
      canvas.style.cursor = "default";
      this.mode = MODE.SELECT;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-erase').addEventListener('click', () => {
      this.erase();
    });
  },
  
  updateToolbarState: function() {
    document.getElementById('btn-line').className = this.mode === MODE.LINE ? 'active' : '';
    document.getElementById('btn-pencil').className = this.mode === MODE.PENCIL ? 'active' : '';
    document.getElementById('btn-move').className = this.mode === MODE.MOVE ? 'active' : '';
    document.getElementById('btn-select').className = this.mode === MODE.SELECT ? 'active' : '';
  },
  
  bindDrawAreaEvents: function() {
    const canvas = document.getElementById('canvas');
    canvas.addEventListener('click', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if(this.mode === MODE.SELECT) {
        this.select(x, y);
      } else if(this.mode === MODE.LINE) {
        if(!this.pos) {
          this.lineBegin(x, y);
        } else {
          this.lineEnd(x, y);
        }
      }
    });
    canvas.addEventListener('mousedown', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if(this.mode === MODE.PENCIL) {
        this.pencilBegin(x, y);
      } else if(this.mode === MODE.MOVE) {
        this.moveBegin(x, y);
      }
    });
    canvas.addEventListener('mousemove', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if(this.mode === MODE.PENCIL) {
        this.pencilMove(x, y);
      } else if(this.mode === MODE.MOVE) {
        this.moveMove(x, y, canvas.width, canvas.height);
      }
    });
    canvas.addEventListener('mouseup', (e) => {
      if(this.mode === MODE.PENCIL) {
        this.pencilEnd();
      }
    });
    canvas.addEventListener('mouseout', (e) => {
      if(this.mode === MODE.PENCIL) {
        this.pencilEnd();
      }
    });
    /**
     * only end move action when user releases the mouse 
     * if the user drags outside of the canvas and then back on to the canvas the move action will still be active
     */
    document.addEventListener('mouseup', (e) => {
      if(this.mode === MODE.MOVE) {
        this.moveEnd();
      }
    });
  },

  erase: function() {
    if(this.selectedObjectIndex >= 0) {
      this.lines[this.selectedObjectIndex].unselect();
      this.lines.splice(this.selectedObjectIndex, 1);
      this.selectedObjectIndex = -1;
      this.render();
    }
  },

  select: function (x, y) {
    if(this.selectedObjectIndex >= 0) {
      this.lines[this.selectedObjectIndex].unselect();
      this.selectedObjectIndex = -1;
    }
    if (this.lines.length > 0) {
      let minSquareDistance = 100;
      let closestIndex = -1;
      this.lines.forEach((line, index) => {
        const squareDistance = line.squareDistanceFrom(x, y);
        if(squareDistance <= minSquareDistance) {
          minSquareDistance = squareDistance;
          closestIndex = index;
        }
      });
      if(closestIndex >= 0) {
        this.lines[closestIndex].select();
        this.selectedObjectIndex = closestIndex;
      }
      this.render();
    }
  },

  lineBegin: function(x, y) {
    // save first click of the line
    this.pos = [ x, y ];
  },

  lineEnd: function(x, y) {
    if(this.pos[0] !== x || this.pos[1] !== y) {
      // create the line and add to the list
      const x0 = this.pos[0], y0 = this.pos[1];
      const line = new Line(x0, y0, x, y);
      this.lines.push(line);
      this.pos = null;
      this.render();
    }
  },

  pencilBegin: function(x, y) {
    // save pencil start position
    this.pos = [ x, y ];
    // create the pencil and add to the list
    this.pencil = new Pencil();
    this.lines.push(this.pencil);
  },

  pencilMove: function(x, y) {
    if(this.pos && (this.pos[0] !== x || this.pos[1] !== y)) {
      // create the line and add to the pencil
      const x0 = this.pos[0], y0 = this.pos[1];
      const line = new Line(x0, y0, x, y);
      this.pencil.addLine(line);
      this.pos = [ x, y ];
      this.render();
    }
  },

  pencilEnd: function() {
    /**
     * if pencil is empty then remove from list
     * this can happen if the mousedown and mouseup event happen at the same coordinates
     */
    if(this.pencil && this.pencil.isEmpty()) {
      this.lines.splice(-1, 1);
      this.render();
    }
    this.pencil = null;
    this.pos = null;
  },

  moveBegin: function(x, y) {
    // select the object being moved
    this.select(x, y);
    if(this.selectedObjectIndex >= 0) {
      // save move start position
      this.pos = [ x, y ];
      this.lines[this.selectedObjectIndex].setCursor(x, y);
    }
  },

  moveMove: function(x, y, maxX, maxY) {
    if(this.pos && (this.pos[0] !== x || this.pos[1] !== y)) {
      this.lines[this.selectedObjectIndex].move(x, y, maxX, maxY);
      this.render();
      this.pos = [ x, y ];
    }
  },

  moveEnd: function() {
    if(this.selectedObjectIndex >= 0) {
      this.lines[this.selectedObjectIndex].resetCursor();
      this.lines[this.selectedObjectIndex].unselect();
      this.selectedObjectIndex = -1;
      this.render();
      this.pos = null;
    }
  },
  
  render: function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.lines.forEach((line) => line.draw(ctx));
  },
};
