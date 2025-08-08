import { Tile } from './Tile.js';

export class Grid {
  constructor(engine, size, pattern='plus', specials={}){
    this.engine = engine; this.size=size; this.pattern=pattern; this.specials=specials; // { locked:["i,j"], heavy:[...], bomb:[...] }
    this.tiles = [];
  }
  build(initialState){
    // ล้างของเก่า
    this.destroy(); this.engine.clearIntersectables();
    for (let j=0;j<this.size;j++){
      const row=[]; this.tiles.push(row);
      for (let i=0;i<this.size;i++){
        const key=`${i},${j}`;
        let kind='normal';
        if (this.specials.locked?.includes(key)) kind='locked';
        else if (this.specials.heavy?.includes(key)) kind='heavy';
        else if (this.specials.bomb?.includes(key)) kind='bomb';
        const t = new Tile(this.engine,i,j,kind, initialState?.[j]?.[i]||false);
        t.onPressed = (tile)=> this.press(tile);
        row.push(t);
      }
    }
  }
  destroy(){ this.tiles.flat().forEach(t=>t.dispose()); this.tiles = []; }

  neighbors(i,j){
    const n=[]; const add=(x,y)=>{ if(x>=0&&y>=0&&x<this.size&&y<this.size) n.push([x,y]); };
    if(this.pattern==='plus'||this.pattern==='full'){ add(i+1,j); add(i-1,j); add(i,j+1); add(i,j-1); }
    if(this.pattern==='diag'||this.pattern==='full'){ add(i+1,j+1); add(i-1,j-1); add(i+1,j-1); add(i-1,j+1); }
    return n;
  }
  toggle(i,j){ const t=this.tiles[j][i]; t.setState(!t.state); t.pulse(); }

  press(tile){
    const {i,j,kind} = tile;
    if(kind==='locked') return; // แตะไม่ได้
    // heavy ต้องกด 2 ครั้งถึงจะสลับตัวเอง (อย่างง่าย: ใช้ flag temp)
    if(kind==='heavy' && !tile._half){ tile._half=true; tile.pulse(); return; } else if (kind==='heavy'){ tile._half=false; }

    // สลับตัวเอง
    this.toggle(i,j);
    // bomb สลับบริเวณกว้าง
    if(kind==='bomb'){
      for(let y=j-1;y<=j+1;y++) for(let x=i-1;x<=i+1;x++) if(x>=0&&y>=0&&x<this.size&&y<this.size) this.toggle(x,y);
    } else {
      // เพื่อนบ้าน
      for(const [x,y] of this.neighbors(i,j)) this.toggle(x,y);
    }

    if(this.onGridChanged) this.onGridChanged();
  }

  isSolved(){
    // ชนะเมื่อทุกบล็อกเป็น true (เปิด) — เลือกเกณฑ์เดียวเพื่อความชัดเจน
    for(let row of this.tiles) for(let t of row) if(!t.state) return false; return true;
  }
}
