export class SaveSystem {
  constructor(key){
    this.key = key;
    this.progress = this._load() || { unlocked: 1, best: {}, settings: { bloom: true, sfx: 0.7, music: 0.25 } };
  }
  _load(){
    try { return JSON.parse(localStorage.getItem(this.key)); } catch(e){ return null; }
  }
  _save(){ localStorage.setItem(this.key, JSON.stringify(this.progress)); }

  unlock(levelId){
    if (levelId > (this.progress.unlocked||1)) { this.progress.unlocked = levelId; this._save(); }
  }
  setBest(levelId, data){
    const prev = this.progress.best[levelId];
    const better = !prev || (data.movesLeft > (prev.movesLeft||-1)) || (data.timeLeft > (prev.timeLeft||-1));
    if (better) { this.progress.best[levelId] = data; this._save(); }
  }
  setSetting(k, v){ this.progress.settings[k] = v; this._save(); }
}
