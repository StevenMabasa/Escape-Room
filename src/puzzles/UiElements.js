// uiElements.js - Updated with 8-puzzle UI

export function createCrosshair() {
  const crosshair = document.createElement('div');
  crosshair.style.position = 'absolute';
  crosshair.style.top = '50%';
  crosshair.style.left = '50%';
  crosshair.style.transform = 'translate(-50%, -50%)';
  crosshair.style.width = '4px';
  crosshair.style.height = '4px';
  crosshair.style.backgroundColor = 'white';
  crosshair.style.borderRadius = '50%';
  crosshair.style.pointerEvents = 'none';
  crosshair.style.zIndex = '1000';
  crosshair.style.boxShadow = '0 0 3px black';
  document.body.appendChild(crosshair);
  return crosshair;
}

export function createInfoDisplay() {
  const infoDisplay = document.createElement('div');
  infoDisplay.style.position = 'absolute';
  infoDisplay.style.top = '10px';
  infoDisplay.style.left = '10px';
  infoDisplay.style.color = 'white';
  infoDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  infoDisplay.style.padding = '10px';
  infoDisplay.style.fontFamily = 'monospace';
  infoDisplay.style.fontSize = '14px';
  infoDisplay.style.borderRadius = '5px';
  infoDisplay.style.pointerEvents = 'none';
  infoDisplay.style.zIndex = '1000';
  infoDisplay.textContent = 'Click on objects to interact';
  document.body.appendChild(infoDisplay);
  return infoDisplay;
}




export function updateInfoDisplay(infoDisplay, message, temporary = true) {
  infoDisplay.textContent = message;
  
  if (temporary) {
    setTimeout(() => {
      infoDisplay.textContent = `🔑 Keys: ${window.numOfKeys || 0}`;
    }, 3000);
  }
}

export function showKeyCollected(infoDisplay) {
  updateInfoDisplay(infoDisplay, '🔑 Key added to inventory!', true);
}


export function showHintDisplay(hintDisplay) {
  if (!hintDisplay) return;
  hintDisplay.style.display = 'block';
}

export function hideHintDisplay(hintDisplay) {
  if (!hintDisplay) return;
  hintDisplay.style.display = 'none';
}



// 8-Puzzle UI
let puzzleUI = null;

export function show8PuzzleUI(puzzleState) {
  if (!puzzleUI) {
    puzzleUI = document.createElement('div');
    puzzleUI.id = 'puzzle-ui';
    puzzleUI.style.position = 'absolute';
    puzzleUI.style.top = '50%';
    puzzleUI.style.right = '20px';
    puzzleUI.style.transform = 'translateY(-50%)';
    puzzleUI.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    puzzleUI.style.padding = '20px';
    puzzleUI.style.borderRadius = '10px';
    puzzleUI.style.fontFamily = 'monospace';
    puzzleUI.style.color = 'white';
    puzzleUI.style.zIndex = '999';
    puzzleUI.style.border = '2px solid #4CAF50';
    puzzleUI.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.5)';
    puzzleUI.style.minWidth = '200px';
    document.body.appendChild(puzzleUI);
  }

  
  
  
  // Update content
  const board = puzzleState.board;
  let boardHTML = '<div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center; color: #4CAF50;">🧩 8-PUZZLE</div>';
  boardHTML += '<div style="display: grid; grid-template-columns: repeat(3, 50px); grid-gap: 5px; margin-bottom: 15px; justify-content: center;">';
  
  for (let i = 0; i < 9; i++) {
    const value = board[i];
    if (value === -1) {
      boardHTML += '<div style="width: 50px; height: 50px; background: rgba(255,255,255,0.1); border: 2px dashed #666; border-radius: 5px;"></div>';
    } else {
      const isCorrect = (i < 8 && value === i + 1);
      const bgColor = isCorrect ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)';
      const borderColor = isCorrect ? '#4CAF50' : '#fff';
      boardHTML += `<div style="width: 50px; height: 50px; background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: white;">${value}</div>`;
    }
  }
  
  boardHTML += '</div>';
  boardHTML += `<div style="text-align: center; font-size: 14px;">`;
  boardHTML += `<div style="margin-bottom: 5px;">Moves: <span style="color: #4CAF50; font-weight: bold;">${puzzleState.moves}</span></div>`;
  boardHTML += `<div style="font-size: 12px; color: #aaa; margin-top: 10px;">Click tiles to move them</div>`;
  boardHTML += `<div style="font-size: 12px; color: #aaa;">Goal: 1-2-3-4-5-6-7-8</div>`;
  boardHTML += `</div>`;
  
  puzzleUI.innerHTML = boardHTML;
  puzzleUI.style.display = 'block';
}

export function hide8PuzzleUI() {
  if (puzzleUI) {
    puzzleUI.style.display = 'none';
  }
}