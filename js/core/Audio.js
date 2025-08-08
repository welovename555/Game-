export class AudioMgr {
  constructor(){
    this.ctx = null; this.buffers = new Map();
  }
  async init(){ this.ctx = new (window.AudioContext||window.webkitAudioContext)(); }
  async load(name, url){
    const res = await fetch(url); const arr = await res.arrayBuffer(); const buf = await this.ctx.decodeAudioData(arr); this.buffers.set(name, buf);
  }
  play(name, gain=0.6){
    if(!this.ctx || !this.buffers.has(name)) return;
    const src = this.ctx.createBufferSource(); src.buffer = this.buffers.get(name);
    const g = this.ctx.createGain(); g.gain.value = gain;
    src.connect(g).connect(this.ctx.destination); src.start(0);
  }
}
