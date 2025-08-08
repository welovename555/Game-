export class UI {
  constructor(save){
    this.save = save;
    this.overlay = document.getElementById('overlay');
    this.hud = { level: document.getElementById('hud-level'), moves: document.getElementById('hud-moves'), time: document.getElementById('hud-time') };
  }

  updateHUD({ level, moves, time }){
    if (level) this.hud.level.textContent = `Lv ${level}`;
    if (moves !== undefined) this.hud.moves.textContent = moves >= 0 ? moves : '∞';
    if (time !== undefined) this.hud.time.textContent = time >= 0 ? time : '∞';
  }

  _openModal(title, contentNode){
    this.overlay.classList.remove('hidden');
    this.overlay.innerHTML = '';
    const modal = document.createElement('div'); modal.className = 'modal';
    modal.innerHTML = `<h2>${title}</h2>`;
    modal.appendChild(contentNode);
    this.overlay.appendChild(modal);
    this.overlay.onclick = (e)=>{ if(e.target===this.overlay) this.close(); };
  }

  close(){ this.overlay.classList.add('hidden'); this.overlay.innerHTML=''; }

  openMenu(levels){
    const box = document.createElement('div');
    box.innerHTML = `<p>ด่านที่ปลดล็อคสูงสุด: <b>${this.save.progress.unlocked}</b></p>`;
    const play = document.createElement('button'); play.textContent = 'เล่นต่อ'; play.onclick = ()=>{ this.close(); levels.start(this.save.progress.unlocked); };
    const choose = document.createElement('button'); choose.textContent = 'เลือกด่าน'; choose.onclick = ()=> this.openLevelSelect(levels);
    box.append(play, document.createElement('br'), choose);
    this._openModal('เมนู', box);
  }

  openSettings(engine, save){
    const box = document.createElement('div');
    const label = document.createElement('label');
    const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = save.progress.settings.bloom; chk.onchange = ()=> save.setSetting('bloom', chk.checked);
    label.append(chk, document.createTextNode(' เปิดเอฟเฟกต์ Bloom'));
    box.append(label);
    this._openModal('ตั้งค่า', box);
  }

  openLevelSelect(levels){
    const grid = document.createElement('div'); grid.className = 'level-grid';
    for(let i=1;i<=50;i++){
      const cell = document.createElement('div'); cell.className = 'level'; cell.textContent = i;
      if (i > this.save.progress.unlocked + 1) { cell.classList.add('locked'); }
      else { cell.onclick = ()=>{ this.close(); levels.start(i); }; }
      grid.appendChild(cell);
    }
    this._openModal('เลือกด่าน', grid);
  }

  toast(msg){
    const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t);
    setTimeout(()=> t.remove(), 1800);
  }
}
