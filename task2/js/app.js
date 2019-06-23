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
  selectedObject: null,
  selectedObjectIndex: -1,
  pendingRender: 0,
  
  init: function() {
    if(this.initDone) {
      return;
    }
    this.bindToolbarEvents();
    this.bindDrawAreaEvents();
    this.initDone = true;

    setInterval(() => {
      this.render();
    }, 20);
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
    if(this.selectedObject) {
      this.lines.splice(this.selectedObjectIndex, 1);
      this.resetSelectedObject();
      this.pendingRender = 10;
    }
  },

  select: function (x, y) {
    if(this.selectedObject) {
      this.resetSelectedObject();
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
        this.setSelectedObject(this.lines[closestIndex], closestIndex)
      }
      this.pendingRender = 10;
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
      this.pendingRender = 10;
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
      this.pendingRender = 10;
    }
  },

  pencilEnd: function() {
    /**
     * if pencil is empty then remove from list
     * this can happen if the mousedown and mouseup event happen at the same coordinates
     */
    if(this.pencil && this.pencil.isEmpty()) {
      this.lines.splice(-1, 1);
      this.pendingRender = 10;
    }
    this.pencil = null;
    this.pos = null;
  },

  moveBegin: function(x, y) {
    // select the object being moved
    this.select(x, y);
    if(this.selectedObject) {
      // save move start position
      this.pos = [ x, y ];
      this.selectedObject.setCursor(x, y);
    }
  },

  moveMove: function(x, y, maxX, maxY) {
    if(this.pos && (this.pos[0] !== x || this.pos[1] !== y)) {
      this.selectedObject.move(x, y, maxX, maxY);
      this.pendingRender = 10;
      this.pos = [ x, y ];
    }
  },

  moveEnd: function() {
    if(this.selectedObject) {
      this.selectedObject.resetCursor();
      this.resetSelectedObject();
      this.pendingRender = 10;
      this.pos = null;
    }
  },

  setSelectedObject: function(object, index) {
    this.selectedObject = object;
    this.selectedObjectIndex = index;
  },

  resetSelectedObject: function() {
    this.selectedObject = null;
    this.selectedObjectIndex = -1;
  },
  
  render: function() {
    if(this.pendingRender > 0) {
      this.pendingRender--;
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.lines.forEach((line) => line.draw(ctx));
      if(this.selectedObject) {
        this.selectedObject.drawEnds(ctx);
      }
    }
  },
};
