export function pointWithin(
  px: number,
  py: number,
  rlft: number,
  rtop: number,
  rrgt: number,
  rbtm: number,
) {
  return px >= rlft && px <= rrgt && py >= rtop && py <= rbtm;
}

const MAX_OBJECTS = 10;
const MAX_LEVELS = 4;

export class Quadtree {
  x: number;
  y: number;
  w: number;
  h: number;
  l: number;
  o: Quadtree[] = [];
  q: Quadtree[];

  sidx: number;
  didx: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    left?: number,
  ) {
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
    this.l = left || 0;
  }

  split = () => {
    const { x, y, w: _w, h: _h, l: _l } = this;
    const w = _w / 2;
    const h = _h / 2;
    const l = _l + 1;

    this.q = [
      // top right
      new Quadtree(x + w, y, w, h, l),
      // top left
      new Quadtree(x, y, w, h, l),
      // bottom left
      new Quadtree(x, y + h, w, h, l),
      // bottom right
      new Quadtree(x + w, y + h, w, h, l),
    ];
  };

  // invokes callback with index of each overlapping quad
  quads(x: number, y: number, w: number, h: number, cb: (d: Quadtree) => void) {
    const q = this.q;
    const hzMid = this.x + this.w / 2;
    const vtMid = this.y + this.h / 2;
    const startIsNorth = y < vtMid;
    const startIsWest = x < hzMid;
    const endIsEast = x + w > hzMid;
    const endIsSouth = y + h > vtMid;

    // top-right quad
    startIsNorth && endIsEast && cb(q[0]);
    // top-left quad
    startIsWest && startIsNorth && cb(q[1]);
    // bottom-left quad
    startIsWest && endIsSouth && cb(q[2]);
    // bottom-right quad
    endIsEast && endIsSouth && cb(q[3]);
  }

  add(o: {
    x: number;
    y: number;
    w: number;
    h: number;
    sidx: number;
    didx: number;
  }) {
    if (this.q != null) {
      this.quads(o.x, o.y, o.w, o.h, q => {
        q.add(o);
      });
    } else {
      const os = this.o;

      os.push(o as Quadtree);

      if (os.length > MAX_OBJECTS && this.l < MAX_LEVELS) {
        this.split();

        for (const oi of os) {
          this.quads(oi.x, oi.y, oi.w, oi.h, q => {
            q.add(oi);
          });
        }

        this.o.length = 0;
      }
    }
  }

  getQ(
    x: number,
    y: number,
    w: number,
    h: number,
    cb: (value: Quadtree) => void,
  ) {
    const os = this.o;

    for (const o of os) cb(o);

    if (this.q != null) {
      this.quads(x, y, w, h, q => {
        q.getQ(x, y, w, h, cb);
      });
    }
  }

  clear() {
    this.o.length = 0;
    this.q = null;
  }
}
