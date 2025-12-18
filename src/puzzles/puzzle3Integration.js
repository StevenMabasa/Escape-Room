import * as THREE from 'three';
import { puzzle3, handlePuzzle3Click, getPuzzle3Clue } from './puzzle3.js';
import { updateInfoDisplay, showKeyCollected } from './UiElements.js';
import { key as hudKey } from '../UI/HUD.js';
import { loadModel } from '../../utils/loader.js';

export function createPuzzle3Integration(modelsGroup, infoDisplay, room) {
  const integration = {
    models: modelsGroup,
    state: puzzle3,
    onActivate: () => {},
    onDeactivate: () => {},
    // flags and animation state
    _finished: false,
    _pressed: {},

    update: (delta) => {
      try {
        if (integration._finished) return;
        const cc = window._characterControls;
        if (!cc || !cc.model) return;
        const playerPos = cc.model.position;
        // iterate plates in modelsGroup (children may include other models)
        integration.models.children.forEach(child => {
          try {
            if (!child.userData || !child.userData.isPressurePlate) return;
            const name = child.name || child.userData.parentName || null;
            if (!name) return;
            const wp = new THREE.Vector3(); child.getWorldPosition(wp);
            const dist = playerPos.distanceTo(wp);
            const last = plateCooldown.get(name) || 0;
            const now = performance.now();
            if (dist <= TRIGGER_RADIUS && now - last > 700) {
              plateCooldown.set(name, now);
              tryTriggerPlateByName(name, child);
            }
          } catch(_) {}
        });

        // update plate press animations
        try {
          const now = performance.now();
          for (const [name, anim] of Object.entries(integration._pressed)) {
            try {
              const elapsed = now - anim.start;
              const t = Math.min(1, elapsed / anim.duration);
              let localY = 0;
              if (t < 0.5) {
                const p = t / 0.5; localY = -anim.depth * p;
              } else {
                const p = (t - 0.5) / 0.5; localY = -anim.depth * (1 - p);
              }
              if (anim.obj && anim.obj.position) anim.obj.position.y = anim.baseY + localY;
              if (t >= 1) {
                if (anim.obj && anim.obj.position) anim.obj.position.y = anim.baseY;
                delete integration._pressed[name];
              }
            } catch(_) {}
          }
        } catch(_) {}
      } catch(_) {}
    },

    handleClick: (objectName, object) => {
      if (integration._finished) return null;

      // Only respond to clicks that are on a pressure plate (or a child of one)
      let plateObj = null;
      try {
        let o = object;
        while (o) {
          if (o.userData && o.userData.isPressurePlate) { plateObj = o; break; }
          o = o.parent;
        }
      } catch(_) { plateObj = null; }

      if (!plateObj) {
        // not a pressure-plate click — ignore for this puzzle
        try { console.log('puzzle3Integration: click ignored (not a plate)', { objectName }); } catch(_){}
        return null;
      }

      // Start plate press animation on the actual plate object
      try {
        const nm = plateObj.name || plateObj.userData.parentName || ('plate_' + Math.random().toString(36).slice(2,8));
        integration._pressed[nm] = {
          obj: plateObj,
          start: performance.now(),
          duration: 400,
          depth: 0.06,
          baseY: plateObj.position.y
        };
        try { updateInfoDisplay(infoDisplay, 'pressure plate pressed', true); } catch(_){ }
      } catch(_){}

      try { console.log('puzzle3Integration: handleClick', { objectName }); } catch(_){ }

      // determine canonical name to pass into puzzle logic (use plate object data)
      let nameToUse = plateObj.userData && plateObj.userData.parentName ? plateObj.userData.parentName : (plateObj.name || objectName);
      const result = handlePuzzle3Click(nameToUse, puzzle3);
      try { console.log('puzzle3Integration: result', { result, progress: puzzle3.progress }); } catch(_){}
      if (result === 'correct') {
        updateInfoDisplay(infoDisplay, 'pressure plate pressed', true);
      } else if (result === 'incorrect') {
        updateInfoDisplay(infoDisplay, 'wrong sequence restart', true);
      } else if (result === 'solved') {
        try { console.log('puzzle3Integration: solved - celebration'); } catch(_){}
        try { updateInfoDisplay(infoDisplay, 'game over you beat the game', true); } catch(_){}
        // celebratory animation: spin the door (if present) and flash lights + emissive on puzzle models
        try {
          integration._finished = true;
          // door spin
          const door = room.children.find(c => c.userData && c.userData.isDoor) || room.children.find(c => c.name && c.name.toLowerCase().includes('door'));
          if (door) {
            const startY = door.rotation.y;
            const targetY = startY - Math.PI * 2; // full spin
            const duration = 1000;
            const t0 = performance.now();
            (function animate(time){
              const elapsed = time - t0;
              const t = Math.min(1, elapsed / duration);
              door.rotation.y = THREE.MathUtils.lerp(startY, targetY, t);
              if (t < 1) requestAnimationFrame(animate);
            })(t0);
          }

          // ambient flash: find ambient lights in the room and pulse intensity
          const ambLights = [];
          room.traverse(o => { if (o.isAmbientLight) ambLights.push(o); });
          ambLights.forEach(l => {
            const orig = l.intensity || 0.15;
            const dur = 600;
            const t0b = performance.now();
            (function pulse(time){
              const elapsed = time - t0b;
              const p = Math.min(1, elapsed / dur);
              // simple ease-out pulse
              l.intensity = orig + (1.0 - orig) * (1 - Math.pow(1 - p, 2));
              if (p < 1) requestAnimationFrame(pulse); else l.intensity = orig;
            })(t0b);
          });

          // emissive flash on puzzle models group
          try {
            integration.models.traverse(c => {
              if (c.isMesh && c.material) {
                const oldEm = c.material.emissive ? c.material.emissive.clone() : new THREE.Color(0x000000);
                const oldEi = c.material.emissiveIntensity || 0;
                try { c.material.emissive = new THREE.Color(0xaaaa66); c.material.emissiveIntensity = 1.5; } catch(_){}
                setTimeout(() => { try { if (c.material) { c.material.emissive = oldEm; c.material.emissiveIntensity = oldEi; } } catch(_){} }, 700);
              }
            });
          } catch(_){}

          // simple confetti sprites (temporary visual flair)
          try {
            const confetti = new THREE.Group();
            for (let i=0;i<24;i++){
              const s = new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.08), new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(),Math.random(),Math.random())}));
              s.position.set((Math.random()-0.5)*4, 2 + Math.random()*1.5, (Math.random()-0.5)*4);
              s.rotation.x = -Math.PI/2 * Math.random();
              s.userData._confetti = true;
              confetti.add(s);
            }
            try { room.add(confetti); } catch(_) { try { integration.models.add(confetti); } catch(_){} }
            // animate confetti fall & fade
            const t0c = performance.now();
            const durc = 1500;
            (function fall(time){
              const e = time - t0c; const p = Math.min(1, e / durc);
              confetti.children.forEach((s, idx) => {
                s.position.y -= 0.01 + idx*0.0005;
                s.rotation.z += 0.05 + idx*0.01;
                if (s.material && s.material.opacity === undefined) s.material.transparent = true;
                if (s.material) s.material.opacity = 1 - p;
              });
              if (p < 1) requestAnimationFrame(fall); else try { if (confetti.parent) confetti.parent.remove(confetti); } catch(_){}
            })(t0c);
          } catch(_){}
        } catch(_){}
          // show the win UI after a short delay so the celebration can play
          try { setTimeout(()=>{ if (window && window.showWinUI) window.showWinUI(); }, 900); } catch(_){}
      }

      return result;
    }
  };

  return integration;
}

