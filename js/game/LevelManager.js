import { Grid } from './Grid.js';
import { CONFIG } from '../config.js';

export class LevelManager {
  constructor(engine, save, ui){
    this.engine = engine; this.save = save; this.ui = ui;
    this.levels = []; this.current = null; this.grid = null;
    this.movesLeft = -1; this.timeLeft = -1; this._timerId = null;
  }

  async loadManifest(url){
    const res = await fetch(url); this.levels = await res.json();
  }

  start(id){
    const lv = this.levels.find(l=>l.id===id) || this.levels[0];
    this.current = lv; this.ui.updateHUD({ level: lv.id });

    // สร้างสถานะเริ่มจาก seed/depth หรือใช้ grid ที่ให้มา
    const initial = this.generateInitial(lv);

    // สร้างกริด
    this.grid?.destroy();
    this.grid = new Grid(this.engine, lv.size, lv.pattern, lv.specials||{});
    this.grid.onGridChanged = ()=> this.onAfterMove();
    this.grid.build(initial);

    // กำหนด moves / time
    this.movesLeft = lv.moves ?? -1; this.timeLeft = lv.time ?? -1; this.updateHUD();
    if(this.timeLeft>0){ clearInterval(this._timerId); this._timerId = setInterval(()=>{ this.timeLeft--; this.updateHUD(); if(this.timeLeft<=0) this.lose(); }, 1000); }
  }

  restart(){ if(this.current) this.start(this.current.id); }

  onAfterMove(){
    if(this.movesLeft>0){ this.movesLeft--; this.updateHUD(); if(this.movesLeft<=0 && !this.grid.isSolved()) return this.lose(); }
    else this.updateHUD();

    if(this.grid.isSolved()) this.win();
  }

  updateHUD(){ this.ui.updateHUD({ level: this.current?.id, moves: this.movesLeft, time: this.timeLeft }); }

  next(){ const nextId = Math.min(50, (this.current?.id||1)+1); this.start(nextId); }

  win(){
    clearInterval(this._timerId);
    this.save.unlock(Math.min(50, this.current.id+1));
    this.save.setBest(this.current.id, { movesLeft: this.movesLeft, timeLeft: this.timeLeft });
    this.ui.toast('เยี่ยม! ผ่านด่าน');
    setTimeout(()=> this.next(), 800);
  }
  lose(){ clearInterval(this._timerId); this.ui.toast('พลาด! ลองใหม่อีกครั้ง'); }

  generateInitial(lv){
    const size = lv.size; const grid = Array.from({length:size},()=>Array(size).fill(true)); // เป้าหมายคือ true ทั้งกระดาน
    // สุ่มยำจาก seed/depth เพื่อสร้างโจทย์ที่แก้ได้แน่นอน
    const rng = mulberry32(lv.seed||1234);
    const steps = lv.depth || size*2;
    for(let k=0;k<steps;k++){
      const i = Math.floor(rng()*size), j = Math.floor(rng()*size);
      // เลียนแบบการกด 1 ครั้ง (เพื่อสร้างสถานะเริ่มต้น)
      const idx = [[i,j], ...neighbors(i,j,size,lv.pattern||'plus')];
      for(const [x,y] of idx){ grid[y][x] = !grid[y][x]; }
    }
    return grid;

    function neighbors(i,j,size,pattern){
      const n=[]; const add=(x,y)=>{ if(x>=0&&y>=0&&x<size&&y<size) n.push([x,y]); };
      if(pattern==='plus'||pattern==='full'){ add(i+1,j); add(i-1,j); add(i,j+1); add(i,j-1); }
      if(pattern==='diag'||pattern==='full'){ add(i+1,j+1); add(i-1,j-1); add(i+1,j-1); add(i-1,j+1); }
      return n;
    }
    function mulberry32(a){ return function(){ var t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; } }
  }
}
