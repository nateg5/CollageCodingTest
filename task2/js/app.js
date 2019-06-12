const MODE = {
  LINE: 'line',
  ERASE: 'erase',
  SELECT: 'select'
}
const app = {
  initDone: false,
  mode: MODE.LINE,
  lines: [],
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
    document.getElementById('btn-select').addEventListener('click', () => {
      this.mode = MODE.SELECT;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-erase').addEventListener('click', () => {
      if (this.lines.length > 0) {
        let selectedIndex = -1;
        this.lines.forEach((line, index) => {
          if(line.isSelected()) {
            selectedIndex = index;
          }
        });
        if(selectedIndex >= 0) {
          this.lines.splice(selectedIndex, 1);
          this.render();
        }
      }
    });
    document.getElementById('btn-line').addEventListener('click', () => {
      this.mode = MODE.LINE;
      this.pos = null;
      this.updateToolbarState();
    });
  },
  
  updateToolbarState: function() {
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
      } else if(this.mode === MODE.LINE) {
        if(!this.pos) {
          // save first click of the line
          this.pos = [ x, y ];
        } else {
          // create the line and add to the list
          const x0 = this.pos[0], y0 = this.pos[1];
          const length = Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
          const line = new Line(x0, y0, x, y, length);
          this.lines.push(line);
          this.pos = null;
        }
      } else {
        console.error("ERROR: Unknow mode", this.mode);
      }
      this.render();
    });
  },
  
  render: function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.lines.forEach((line) => line.draw(ctx));
  },
};
