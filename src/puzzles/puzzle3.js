// puzzle3.js - sequence puzzle for room3
export const puzzle3 = {
  solved: false,
  sequence: ['doll', 'skull', 'chest', 'cabinet'],
  progress: 0,
  attempt: [],
};

export function resetPuzzle3(p) {
  p.progress = 0;
  p.attempt = [];
  p.solved = false;
}

export function handlePuzzle3Click(name, p) {
  if (p.solved) return 'already';
  if (!name) return false;

  // Normalize incoming name: accept partials like 'doll', 'doll_plate', 'Object_6' when appropriately tagged
  const raw = String(name).trim().toLowerCase();
  function normalize(n) {
    if (!n) return '';
    if (n.includes('doll')) return 'doll';
    if (n.includes('skull')) return 'skull';
    if (n.includes('chest')) return 'chest';
    if (n.includes('cabinet')) return 'cabinet';
    // fallback: return the alphanumeric chunk
    const m = n.match(/[a-z0-9]+/);
    return m ? m[0] : n;
  }

  const clicked = normalize(raw);
  // append to attempt buffer
  p.attempt = p.attempt || [];
  p.attempt.push(clicked);

  // Debug log
  try { console.log('puzzle3: click', { raw: name, clicked, attempt: p.attempt.slice() }); } catch (_) {}

  // If we haven't collected enough presses yet, consider it a correct intermediate press
  if (p.attempt.length < p.sequence.length) {
    return 'correct';
  }

  // Evaluate the 4-press attempt
  const ok = p.attempt.length === p.sequence.length && p.attempt.every((v, i) => v === p.sequence[i]);
  // reset attempt buffer after evaluation
  p.attempt = [];
  if (ok) {
    p.solved = true;
    return 'solved';
  }
  // wrong after full sequence
  return 'incorrect';
}

export function getPuzzle3Clue() {
  return 'From innocence to dust, from greed to memory';
}
