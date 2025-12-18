// puzzle2.js - 8-Puzzle sliding puzzle logic

export const puzzle2 = {
  solved: false,
  board: [1, 2, 3, 4, 5, 6, 7, 8, -1], // -1 represents empty space (position 8)
  emptyIndex: 8,
  moves: 0,
  keyCollected: false,
  keyAnimating: false,
  keyTargetY: 6,
  keyCurrentY: 0, // Start at ground level like key1
  keyRotation: 0,
};

// Map tile names to their numbers
const tileNameMap = {
  '8puzz1': 1,
  '8puzz2': 2,
  '8puzz3': 3,
  '8puzz4': 4,
  '8puzz5': 5,
  '8puzz6': 6,
  '8puzz7': 7,
  '8puzz8': 8,
};

// Check if puzzle is solved
export function checkPuzzle2(puzzle) {
  // Winning configuration: [1,2,3,4,5,6,7,8,-1]
  for (let i = 0; i < 8; i++) {
    if (puzzle.board[i] !== i + 1) {
      return false;
    }
  }
  
  if (!puzzle.solved) {
    puzzle.solved = true;
    puzzle.keyAnimating = true;
    console.log("🎉 8-Puzzle solved! Key is rising...");
  }
  return true;
}

// Get valid moves (tiles that can slide into empty space)
function getValidMoves(emptyIndex) {
  const validMoves = [];
  const row = Math.floor(emptyIndex / 3);
  const col = emptyIndex % 3;
  
  // Up
  if (row > 0) validMoves.push(emptyIndex - 3);
  // Down
  if (row < 2) validMoves.push(emptyIndex + 3);
  // Left
  if (col > 0) validMoves.push(emptyIndex - 1);
  // Right
  if (col < 2) validMoves.push(emptyIndex + 1);
  
  return validMoves;
}

// Handle tile clicks
export function handlePuzzle2Click(objectName, puzzle) {
  // Check if it's a tile
  const tileNumber = tileNameMap[objectName];
  
  if (tileNumber !== undefined) {
    // Find the position of clicked tile
    const tileIndex = puzzle.board.indexOf(tileNumber);
    
    // Check if this tile can move (is adjacent to empty space)
    const validMoves = getValidMoves(puzzle.emptyIndex);
    
    if (validMoves.includes(tileIndex)) {
      // Swap tile with empty space
      puzzle.board[puzzle.emptyIndex] = puzzle.board[tileIndex];
      puzzle.board[tileIndex] = -1;
      puzzle.emptyIndex = tileIndex;
      puzzle.moves++;
      
      console.log(`Moved tile ${tileNumber}. Moves: ${puzzle.moves}`);
      console.log('Board:', puzzle.board);
      
      checkPuzzle2(puzzle);
      return true;
    } else {
      console.log(`Tile ${tileNumber} cannot move from position ${tileIndex}`);
      return false;
    }
  }
  
  // Check if clicking key2
  if (objectName === 'key2') {
    if (puzzle.solved && !puzzle.keyCollected) {
      puzzle.keyCollected = true;
      return 'key_collected';
    }
  }
  
  // Check if clicking tablet (show hint)
  if (objectName === 'room2tablet') {
    console.log('💡 Hint: Arrange tiles 1-8 in order!');
    return 'hint';
  }
  
  return false;
}

// Update tile positions based on board state
export function updateTilePositions(puzzleModels, puzzle) {
  if (!puzzleModels) return;
  
  // Grid positions (3x3 layout)
  const positions = [
  { x: -21.4, y: 5.8 },
  { x: -20.5, y: 5.8 },
  { x: -19.6, y: 5.8 },
  { x: -21.4, y: 4.9 },
  { x: -20.5, y: 4.9 },
  { x: -19.6, y: 4.9 },
  { x: -21.4, y: 4.0 },
  { x: -20.5, y: 4.0 },
  { x: -19.6, y: 4.0 }
];

  
  puzzleModels.traverse(obj => {
    const tileNumber = tileNameMap[obj.name];
    
    if (tileNumber !== undefined) {
      // Find where this tile should be
      const boardIndex = puzzle.board.indexOf(tileNumber);
      
      if (boardIndex !== -1) {
        const targetPos = positions[boardIndex];
        
        // Smoothly animate to target position
        const speed = 0.1; // Animation speed
        obj.position.x += (targetPos.x - obj.position.x) * speed;
        obj.position.y += (targetPos.y - obj.position.y) * speed;
      }
    }
  });
}

// Shuffle the puzzle
export function shufflePuzzle(puzzle, moves = 50) {
  console.log('Shuffling puzzle...');
  
  for (let i = 0; i < moves; i++) {
    const validMoves = getValidMoves(puzzle.emptyIndex);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    // Swap
    puzzle.board[puzzle.emptyIndex] = puzzle.board[randomMove];
    puzzle.board[randomMove] = -1;
    puzzle.emptyIndex = randomMove;
  }
  
  puzzle.moves = 0;
  puzzle.solved = false;
  console.log('Puzzle shuffled! Start solving:', puzzle.board);
}

// Update key animation (when puzzle is solved) - matches key1 behavior
export function updateKeyAnimation(puzzleModels, puzzle, delta) {
  if (!puzzle.keyAnimating || puzzle.keyCollected) return;
  
  puzzleModels.traverse(obj => {
    if (obj.name === 'key2') {
      // Animate Y position upward (same as key1)
      if (puzzle.keyCurrentY < puzzle.keyTargetY) {
        puzzle.keyCurrentY += delta * 2; // Speed: 2 units per second
        if (puzzle.keyCurrentY > puzzle.keyTargetY) {
          puzzle.keyCurrentY = puzzle.keyTargetY;
        }
        obj.position.y = puzzle.keyCurrentY;
      }
      
      // Rotate around Y axis (same as key1)
      puzzle.keyRotation += delta * Math.PI; // Rotate 180 degrees per second
      obj.rotation.y = puzzle.keyRotation;
    }
  });
}

// Hide key when collected
export function hideKey(puzzleModels) {
  let keyFound = false;
  puzzleModels.traverse(obj => {
    if (obj.name === 'key2') {
      keyFound = true;
      obj.visible = false;
      obj.traverse(child => {
        child.visible = false;
      });
      console.log("🔑 Key2 hidden from scene");
    }
  });
  
  if (!keyFound) {
    console.error("❌ Key2 not found when trying to hide!");
  }
}