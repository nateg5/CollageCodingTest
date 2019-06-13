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
    document.addEventListener('mouseup', (e) => {
      if(this.mode === MODE.MOVE) {
        this.moveEnd();
      }
    });
  },

  erase: function() {
    this.lines.forEach((line, index) => {
      if(line.isSelected()) {
        this.lines.splice(index, 1);
        this.render();
      }
    });
  },

  select: function (x, y) {
    if (this.lines.length > 0) {
      let minSquareDistance = 100;
      let closestIndex = -1;
      this.lines.forEach((line, index) => {
        const squareDistance = line.squareDistanceFrom(x, y);
        if(squareDistance <= minSquareDistance) {
          minSquareDistance = squareDistance;
          closestIndex = index;
        }
        if(line.isSelected()) {
          line.unselect();
        }
      });
      if(closestIndex >= 0) {
        this.lines[closestIndex].select();
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
      // create the line and add to the list
      const x0 = this.pos[0], y0 = this.pos[1];
      const line = new Line(x0, y0, x, y);
      this.pencil.addLine(line);
      this.pos = [ x, y ];
      this.render();
    }
  },

  pencilEnd: function() {
    if(this.pencil && this.pencil.isEmpty()) {
      this.lines.splice(-1, 1);
      this.render();
    }
    this.pencil = null;
    this.pos = null;
  },

  moveBegin: function(x, y) {
    this.select(x, y);
    // save move start position
    this.pos = [ x, y ];
  },

  moveMove: function(x, y, maxX, maxY) {
    if(this.pos && (this.pos[0] !== x || this.pos[1] !== y)) {
      const x0 = this.pos[0], y0 = this.pos[1];
      this.lines.forEach((line, index) => {
        if(line.isSelected()) {
          line.move(x - x0, y - y0, maxX, maxY);
          this.render();
        }
      });
      this.pos = [ x, y ];
    }
  },

  moveEnd: function() {
    this.lines.forEach((line, index) => {
      if(line.isSelected()) {
        line.unselect();
        this.render();
      }
    });
    this.pos = null;
  },
  
  render: function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.lines.forEach((line) => line.draw(ctx));
  },
};
