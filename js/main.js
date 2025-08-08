import { Engine } from './core/Engine.js';
import { SaveSystem } from './core/SaveSystem.js';
import { UI } from './core/UI.js';
import { LevelManager } from './game/LevelManager.js';
import { CONFIG } from './config.js';

const canvas = document.getElementById('game');
const engine = new Engine(canvas);
const save = new SaveSystem(CONFIG.storageKey);
const ui = new UI(save);
const levels = new LevelManager(engine, save, ui);

// Wire up basic UI buttons
document.getElementById('btn-menu').onclick = () => ui.openMenu(levels);
document.getElementById('btn-levels').onclick = () => ui.openLevelSelect(levels);
document.getElementById('btn-settings').onclick = () => ui.openSettings(engine, save);
document.getElementById('btn-restart').onclick = () => levels.restart();

// Start
(async function init() {
  await engine.init();
  await levels.loadManifest('./assets/levels.json');
  levels.start(save.progress.unlocked || 1);
  engine.animate();
})();
