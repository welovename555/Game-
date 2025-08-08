import { CONFIG } from '../config.js';

export class Tile {
  constructor(engine, i, j, kind='normal', state=false){
    this.engine = engine; this.i=i; this.j=j; this.kind=kind; this.state=state; // state: on/off
    // mesh
    const geo = new THREE.BoxGeometry(0.9, 0.4, 0.9);
    const matOn = new THREE.MeshStandardMaterial({ color: CONFIG.colors.on, metalness: 0.4, roughness: 0.3 });
    const matOff = new THREE.MeshStandardMaterial({ color: CONFIG.colors.off, metalness: 0.2, roughness: 0.8 });
    this.materials = { on: matOn, off: matOff };
    this.mesh = new THREE.Mesh(geo, this.state?matOn:matOff);
    this.mesh.position.set(i - 0.5, 0, j - 0.5);
    this.mesh.castShadow = true; this.mesh.receiveShadow = true;
    this.mesh.userData.onClick = ()=> this.onClick();
    engine.addIntersectable(this.mesh);
    engine.scene.add(this.mesh);
  }
  setState(on){ this.state = on; this.mesh.material = on?this.materials.on:this.materials.off; }
  pulse(){
    // แอนิเมชันสั้น ๆ
    const s0 = 1, s1 = 1.1; const m = this.mesh; m.scale.setScalar(s1);
    setTimeout(()=> m.scale.setScalar(s0), 120);
  }
  onClick(){ if(this.onPressed) this.onPressed(this); }
  dispose(){ this.engine.scene.remove(this.mesh); this.mesh.geometry.dispose(); }
}
