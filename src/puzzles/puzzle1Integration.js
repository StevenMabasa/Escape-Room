// puzzle1Integration.js
// Wrapper to integrate puzzle1 with the puzzle manager system

import { 
  puzzle1, 
  changeLightColor, 
  handlePuzzleButtonClick, 
  updateKeyAnimation, 
  hideKey 
} from './puzzle1.js';
import { showKeyCollected } from './UiElements.js';
import { key } from '../UI/HUD.js';

export function createPuzzle1Integration(puzz1Models, infoDisplay) {
  return {
    // Reference to the puzzle models
    models: puzz1Models,
    
    // Puzzle state
    state: puzzle1,
    
    // Called when puzzle is activated (room enters)
    onActivate: () => {
      console.log('Puzzle 1 activated');
      changeLightColor(puzz1Models, puzzle1);
    },
    
    // Called when puzzle is deactivated (room exits)
    onDeactivate: () => {
      console.log('Puzzle 1 deactivated');
    },
    
    // Called every frame
    update: (delta) => {
      changeLightColor(puzz1Models, puzzle1);
      updateKeyAnimation(puzz1Models, puzzle1, delta);
    },
    
    // Handle click interactions
    handleClick: (objectName, object) => {
      const result = handlePuzzleButtonClick(objectName, puzzle1);
      
      if (result === 'key_collected') {
        window.numOfKeys += 1;
        key();
        showKeyCollected(infoDisplay);
        hideKey(puzz1Models);
        console.log('🎉 Puzzle 1 completed! Key collected!');
      } else if (result) {
        // Button was clicked, update lights
        changeLightColor(puzz1Models, puzzle1);
      }
    }
  };
}