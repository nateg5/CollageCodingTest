const MODE = {
  LINE: 'line',
  ERASE: 'erase',
  SELECT: 'select',
  PENCIL: 'pencil'
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
    document.getElementById('btn-pencil').addEventListener('click', () => {
      this.mode = MODE.PENCIL;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-select').addEventListener('click', () => {
      this.mode = MODE.SELECT;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-erase').addEventListener('click', () => {
      this.erase();
    });
    document.getElementById('btn-line').addEventListener('click', () => {
      this.mode = MODE.LINE;
      this.pos = null;
      this.updateToolbarState();
    });
  },
  
  updateToolbarState: function() {
    document.getElementById('btn-pencil').className = this.mode === MODE.PENCIL ? 'active' : '';
    document.getElementById('btn-select').className = this.mode === MODE.SELECT ? 'active' : '';
    document.getElementById('btn-erase').className = this.mode === MODE.ERASE ? 'active' : '';
    document.getElementById('btn-line').className = this.mode === MODE.LINE ? 'active' : '';
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
        } else if(this.pos[0] !== x || this.pos[1] !== y) {
          this.lineEnd(x, y);
        }
      }
      this.render();
    });
    canvas.addEventListener('mousedown', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if(this.mode === MODE.PENCIL) {
        this.pencilBegin(x, y);
      }
      this.render();
    });
    canvas.addEventListener('mousemove', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if(this.mode === MODE.PENCIL) {
        this.pencilMove(x, y);
      }
      this.render();
    });
    canvas.addEventListener('mouseup', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if(this.mode === MODE.PENCIL) {
        this.pencilEnd();
      }
      this.render();
    });
    canvas.addEventListener('mouseout', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if(this.mode === MODE.PENCIL) {
        this.pencilEnd();
      }
      this.render();
    });
  },

  erase: function() {
    if (this.lines.length > 0) {
      this.lines.forEach((line, index) => {
        if(line.isSelected()) {
          this.lines.splice(index, 1);
          this.render();
        }
      });
    }
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
      const length = Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
      const line = new Line(x0, y0, x, y, length);
      this.lines.push(line);
      this.pos = null;
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
    if(this.pencil && (this.pos[0] !== x || this.pos[1] !== y)) {
      // create the line and add to the list
      const x0 = this.pos[0], y0 = this.pos[1];
      const length = Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
      const line = new Line(x0, y0, x, y, length);
      this.pencil.addLine(line);
      this.pos = [ x, y ];
    }
  },

  pencilEnd: function() {
    if(this.pencil && this.pencil.isEmpty()) {
      this.lines.splice(-1, 1);
    }
    this.pencil = null;
    this.pos = null;
  },
  
  render: function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.lines.forEach((line) => line.draw(ctx));
  },
};
