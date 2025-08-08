import { CONFIG } from '../config.js';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.composer = null; // for bloom
    this.clock = new THREE.Clock();
    this.resizeHandler = () => this.onResize();
    this.intersectables = []; // clickable meshes
    // Orbit controls แบบง่าย ๆ ด้วยการลาก/หมุนเอง
    this.orbit = { theta: 0.6, phi: 0.8, dist: CONFIG.camera.dist };
  }

  async init() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1020);

    this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, CONFIG.camera.near, CONFIG.camera.far);
    this.camera.position.set(4, 5, 6);

    const hemi = new THREE.HemisphereLight(0xbce0ff, 0x091021, 0.8);
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(4, 6, 3);
    this.scene.add(hemi, dir);

    // floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: 0x0e142f, metalness: 0.2, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // post-processing (bloom)
    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85);
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);

    // input
    window.addEventListener('resize', this.resizeHandler);
    this.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    this.canvas.addEventListener('pointermove', (e) => this.onDrag(e));
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: true });
  }

  addIntersectable(mesh) { this.intersectables.push(mesh); }
  clearIntersectables() { this.intersectables.length = 0; }

  onPointer(e){
    // Raycast หา mesh ที่คลิก
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const ray = new THREE.Raycaster();
    ray.setFromCamera({ x, y }, this.camera);
    const hits = ray.intersectObjects(this.intersectables, false);
    if (hits[0] && hits[0].object.userData.onClick) {
      hits[0].object.userData.onClick();
    }
    this._dragging = true; this._last = { x: e.clientX, y: e.clientY };
  }
  onDrag(e){
    if (!this._dragging) return;
    const dx = e.clientX - this._last.x; const dy = e.clientY - this._last.y; this._last = { x: e.clientX, y: e.clientY };
    this.orbit.theta -= dx * 0.005; this.orbit.phi = Math.min(Math.max(0.2, this.orbit.phi - dy*0.005), 1.3);
  }
  onWheel(e){ this.orbit.dist = Math.min(Math.max(5, this.orbit.dist + e.deltaY * 0.003), 16); }

  onResize(){
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.composer.setSize(w, h);
  }

  animate(){
    requestAnimationFrame(() => this.animate());
    // อัปเดตตำแหน่งกล้อง (orbit)
    const r = this.orbit.dist; const t = this.orbit.theta, p = this.orbit.phi;
    this.camera.position.set(r*Math.sin(p)*Math.cos(t), r*Math.cos(p), r*Math.sin(p)*Math.sin(t));
    this.camera.lookAt(0, 0, 0);

    this.composer.render();
  }
}
