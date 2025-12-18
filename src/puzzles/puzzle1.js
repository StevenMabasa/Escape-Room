// Logic of the puzzle1 will be coded here, and of course you can add more files if we want to more puzzles
// puzzleLogic.js

export const puzzle1 = {
  solved: false,
  light1index: 0,
  light2index: 0,
  light3index: 0,
  keyAnimating: false,
  keyTargetY: 5,
  keyCurrentY: 0,
  keyRotation: 0,
  keyCollected: false,
};

export function checkPuzzle(puzzle) {
  if (puzzle.light1index === 1 && puzzle.light2index === 3 && puzzle.light3index === 2) {
    if (!puzzle.solved) {
      puzzle.solved = true;
      puzzle.keyAnimating = true;
      console.log("🎉 Puzzle solved! Key is rising...");
    }
  }
}

const red = 0xFF0000;
const blue = 0x0000FF;
const green = 0x00FF00;
const white = 0xfff2cc;
const colors = [white, red, green, blue];

export function changeLightColor(puzzleModels, puzz) {
  puzzleModels.traverse(obj => {
    switch(obj.name) {
      case 'Light1':
        obj.color.setHex(colors[puzz.light1index]);
        checkPuzzle(puzz);
        break;
      case 'Light2':
        obj.color.setHex(colors[puzz.light2index]);
        checkPuzzle(puzz);
        break;
      case 'Light3':
        obj.color.setHex(colors[puzz.light3index]);
        checkPuzzle(puzz);
        break;
    }
  });
}

// puzzleLogic.js

export function handlePuzzleButtonClick(buttonName, puzzle) {
  // 🔊 Play button click sound
  const buttonSound = new Audio('assets/foot_switch.mp3');
  buttonSound.volume = 0.9;
  buttonSound.currentTime = 0;
  buttonSound.play().catch(err => console.log("Button click sound error:", err));
  
  switch(buttonName) { 
    case 'button2':
      puzzle.light2index = (puzzle.light2index + 1) % 4;
      break;
    case 'button1':
      puzzle.light1index = (puzzle.light1index + 1) % 4;
      break;
    case 'button3':
      puzzle.light3index = (puzzle.light3index + 1) % 4;
      break;
    case 'key1':
      if (puzzle.solved && !puzzle.keyCollected) {
        puzzle.keyCollected = true;
        return 'key_collected';
      }
      return false;
    default:
      return false;
  }
  return true;
}


export function updateKeyAnimation(puzzleModels, puzzle, delta) {
  if (!puzzle.keyAnimating || puzzle.keyCollected) return;
  
  puzzleModels.traverse(obj => {
    if (obj.name === 'key1') {
      // Animate Y position upward
      if (puzzle.keyCurrentY < puzzle.keyTargetY) {
        puzzle.keyCurrentY += delta * 2; // Speed: 2 units per second
        if (puzzle.keyCurrentY > puzzle.keyTargetY) {
          puzzle.keyCurrentY = puzzle.keyTargetY;
        }
        obj.position.y = puzzle.keyCurrentY;
      }
      
      // Rotate around X axis
      puzzle.keyRotation += delta * Math.PI; // Rotate 180 degrees per second
      obj.rotation.y = puzzle.keyRotation;
    }
  });
}

export function hideKey(puzzleModels) {
  let keyFound = false;
  puzzleModels.traverse(obj => {
    if (obj.name === 'key1') {
      keyFound = true;
      obj.visible = false;
      // Also hide all children
      obj.traverse(child => {
        child.visible = false;
      });
      console.log("🔑 Key hidden from scene");
    }
  });
  
  if (!keyFound) {
    console.error("❌ Key not found when trying to hide!");
  }
}