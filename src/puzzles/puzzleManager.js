// puzzleManager.js
// Manages puzzle lifecycle, updates, and interactions across different rooms
import * as THREE from 'three';
export class PuzzleManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.activePuzzles = new Map(); // roomId -> puzzle data
    this.currentRoomId = null;
    this.raycaster = new THREE.Raycaster();
    this.setupClickHandler();
  }

  setupClickHandler() {
    const onPointerDown = (event) => {
      // Accept left button or touch/pen (pointerdown may not have button for touch)
      if (typeof event.button === 'number' && event.button !== 0) return;

      const coords = new THREE.Vector2();
      try {
        const canvas = this.renderer && this.renderer.domElement ? this.renderer.domElement : document.body;
        // If pointer is locked to the canvas, use the center of the screen
        if (document.pointerLockElement === canvas) {
          coords.set(0, 0);
        } else {
          const rect = canvas.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          coords.set(x, y);
        }
      } catch (e) {
        // Fallback to center
        coords.set(0, 0);
      }

      this.raycaster.setFromCamera(coords, this.camera);

      const currentPuzzle = this.activePuzzles.get(this.currentRoomId);
      if (!currentPuzzle || !currentPuzzle.models) return;

      // Debug: list models that will be tested by the raycaster
      try {
        const names = currentPuzzle.models.children.map(c => c.name || c.type || c.uuid);
        console.log('PuzzleManager: testing models children', { roomId: this.currentRoomId, childCount: currentPuzzle.models.children.length, names });
      } catch (_) {}

      const intersects = this.raycaster.intersectObjects(currentPuzzle.models.children, true);

      // Debug: show intersects, current room and coords
      try { console.log('PuzzleManager: onPointerDown', { roomId: this.currentRoomId, intersects: intersects.length, coords: coords.toArray() }); } catch (_) {}

      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        try { console.log('PuzzleManager: firstIntersect object', firstIntersect.object && firstIntersect.object.name); } catch (_) {}
        let currentObject = firstIntersect.object;
        let namedParent = null;
        
        // Find the named parent object
        while (currentObject && currentObject !== this.scene) {
          if (currentObject.userData && currentObject.userData.parentName) {
            let searchObj = currentObject;
            while (searchObj && searchObj !== this.scene) {
              if (searchObj.name === currentObject.userData.parentName) {
                namedParent = searchObj;
                break;
              }
              searchObj = searchObj.parent;
            }
            if (namedParent) break;
          }
          
          if (currentObject.name && 
              currentObject.name !== "" && 
              !currentObject.name.includes("material") &&
              !currentObject.name.includes("prim") &&
              !currentObject.name.includes("Object_") &&
              currentObject.name !== "Scene") {
            namedParent = currentObject;
            break;
          }
          currentObject = currentObject.parent;
        }
        
        if (namedParent && namedParent.name && currentPuzzle.handleClick) {
          try { console.log('PuzzleManager: calling handleClick on', namedParent.name); } catch (_) {}
          currentPuzzle.handleClick(namedParent.name, namedParent);
        }
      }
    };
    
    // Use pointer events for better compatibility with pointer lock and touch
    document.addEventListener('pointerdown', onPointerDown);
  }

  // Register a puzzle for a specific room
  registerPuzzle(roomId, puzzleData) {
    this.activePuzzles.set(roomId, puzzleData);
  }

  // Switch to a room's puzzle
  activateRoom(roomId) {
    this.currentRoomId = roomId;
    const puzzle = this.activePuzzles.get(roomId);
    
    if (puzzle && puzzle.onActivate) {
      puzzle.onActivate();
    }
  }

  // Deactivate current room's puzzle
  deactivateRoom(roomId) {
    const puzzle = this.activePuzzles.get(roomId);
    
    if (puzzle && puzzle.onDeactivate) {
      puzzle.onDeactivate();
    }
  }

  // Update current puzzle (called from game loop)
  update(delta) {
    if (!this.currentRoomId) return;
    
    const puzzle = this.activePuzzles.get(this.currentRoomId);
    if (puzzle && puzzle.update) {
      puzzle.update(delta);
    }
  }

  // Get current puzzle state
  getCurrentPuzzle() {
    return this.activePuzzles.get(this.currentRoomId);
  }

  // Check if current puzzle is solved
  isCurrentPuzzleSolved() {
    const puzzle = this.getCurrentPuzzle();
    return puzzle && puzzle.state && puzzle.state.solved;
  }
}