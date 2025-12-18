// puzzle2Integration.js - Connects 8-puzzle to the puzzle system

import { 
  puzzle2, 
  checkPuzzle2, 
  handlePuzzle2Click,
  updateTilePositions,
  shufflePuzzle,
  updateKeyAnimation,
  hideKey
} from './puzzle2.js';
import { showKeyCollected, updateInfoDisplay, show8PuzzleUI, hide8PuzzleUI } from './UiElements.js';

export function createPuzzle2Integration(puzz2Models, infoDisplay) {
  let uiShown = false;
  
  return {
    models: puzz2Models,
    state: puzzle2,
    
    onActivate: () => {
      console.log('8-Puzzle activated');
      
      // Initialize key position (starts at ground level like key1)
      puzz2Models.traverse(obj => {
        if (obj.name === 'key2') {
          obj.position.y = puzzle2.keyCurrentY; // Starts at 0 (ground level)
          obj.visible = true;
        }
      });
      
      // Shuffle puzzle on first activation
      if (puzzle2.moves === 0 && !puzzle2.solved) {
        shufflePuzzle(puzzle2, 50);
      }
      
      // Update tile positions to match board state
      updateTilePositions(puzz2Models, puzzle2);
      
      // Show 8-puzzle UI
      if (!uiShown && !puzzle2.solved) {
        show8PuzzleUI(puzzle2);
        uiShown = true;
      }
    },
    
    onDeactivate: () => {
      console.log('8-Puzzle deactivated');
      hide8PuzzleUI();
      uiShown = false;
    },
    
    update: (delta) => {
      // Update tile positions based on board state
      updateTilePositions(puzz2Models, puzzle2);
      
      // Update key animation if puzzle is solved
      updateKeyAnimation(puzz2Models, puzzle2, delta);
      
      // Update UI
      if (uiShown && !puzzle2.solved) {
        show8PuzzleUI(puzzle2);
      } else if (puzzle2.solved && uiShown) {
        hide8PuzzleUI();
        uiShown = false;
      }
    },
    
    handleClick: (objectName, object) => {
      const result = handlePuzzle2Click(objectName, puzzle2);
      
      if (result === 'key_collected') {
        showKeyCollected(infoDisplay);
        hideKey(puzz2Models);
        hide8PuzzleUI();
        window.numOfKeys = (window.numOfKeys || 0) + 1;
        console.log('🎉 8-Puzzle completed! Key collected!');
        updateInfoDisplay(infoDisplay, `🔑 Keys: ${window.numOfKeys}`, false);
      } else if (result === 'hint') {
        updateInfoDisplay(infoDisplay, '💡 Arrange tiles 1-8 in order!', true);
      } else if (result) {
        // Tile was moved
        updateTilePositions(puzz2Models, puzzle2);
        checkPuzzle2(puzzle2);
      }
    }
  };
}