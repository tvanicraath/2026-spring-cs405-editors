/* ── Config ─────────────────────────────── */
const SHUFFLES = 60;
const GOAL     = Array.from({ length: 16 }, (_, i) => (i + 1) % 16);

/* ── State ──────────────────────────────── */
const S = {
  humanBoard: [],  humanMoves: 0,  humanSolved: false,  humanLast: -1,
  aiBoard:    [],  aiMoves:    0,  aiSolved:    false,  aiLast:    -1,
  gn: 0, hn: 0, fn: 0, totalExplored: 0, optimalLeft: 0,
  started: false, done: false, paused: false, pending: false,
  thinkTimer: null,
};

/* ── Helpers ────────────────────────────── */
const key  = b => b.join(',');
const blank = b => b.indexOf(0);
const solved = b => key(b) === key(GOAL);

function manhattan(b) {
  let d = 0;
  for (let i = 0; i < 16; i++) {
    const v = b[i];
    if (!v) continue;
    const g = v - 1;
    d += Math.abs(~~(i / 4) - ~~(g / 4)) + Math.abs(i % 4 - g % 4);
  }
  return d;
}

function neighbors(b) {
  const bl = blank(b), r = ~~(bl / 4), c = bl % 4, out = [];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr > 3 || nc < 0 || nc > 3) continue;
    const ni = nr * 4 + nc;
    const nb = [...b];
    [nb[bl], nb[ni]] = [nb[ni], nb[bl]];
    out.push({ board: nb, tileIdx: ni });
  }
  return out;
}

function solvable(b) {
  let inv = 0;
  const f = b.filter(x => x);
  for (let i = 0; i < f.length; i++)
    for (let j = i + 1; j < f.length; j++)
      if (f[i] > f[j]) inv++;
  const bf = 4 - ~~(blank(b) / 4);
  return bf % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
}

function generate(n) {
  let b = [...GOAL], last = -1;
  for (let i = 0; i < n; i++) {
    const valid = neighbors(b).filter(x => blank(x.board) !== last);
    const pick = valid[Math.random() * valid.length | 0];
    last = blank(b);
    b = pick.board;
  }
  if (!solvable(b)) {
    const i1 = b[0] === 0 ? 1 : 0, i2 = b[i1 + 1] === 0 ? i1 + 2 : i1 + 1;
    [b[i1], b[i2]] = [b[i2], b[i1]];
  }
  return b;
}

function adj(i, bl) {
  return Math.abs(~~(i / 4) - ~~(bl / 4)) + Math.abs(i % 4 - bl % 4) === 1;
}

/* ── A* ─────────────────────────────────── */
class Heap {
  constructor() { this.d = []; }
  push(n) { this.d.push(n); this._up(this.d.length - 1); }
  pop() {
    const t = this.d[0], l = this.d.pop();
    if (this.d.length) { this.d[0] = l; this._dn(0); }
    return t;
  }
  empty() { return !this.d.length; }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.d[p].f <= this.d[i].f) break;
      [this.d[p], this.d[i]] = [this.d[i], this.d[p]];
      i = p;
    }
  }
  _dn(i) {
    const n = this.d.length;
    for (;;) {
      let m = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.d[l].f < this.d[m].f) m = l;
      if (r < n && this.d[r].f < this.d[m].f) m = r;
      if (m === i) break;
      [this.d[m], this.d[i]] = [this.d[i], this.d[m]];
      i = m;
    }
  }
}

function astar(start) {
  if (solved(start)) return { path: [start], explored: 0 };
  const heap = new Heap();
  heap.push({ board: start, g: 0, h: manhattan(start), f: manhattan(start), parent: null });
  const vis = new Map();
  let exp = 0;
  while (!heap.empty()) {
    const cur = heap.pop();
    const k = key(cur.board);
    if (vis.has(k) && vis.get(k) <= cur.g) continue;
    vis.set(k, cur.g);
    exp++;
    if (solved(cur.board)) {
      const path = []; let n = cur;
      while (n) { path.unshift(n.board); n = n.parent; }
      return { path, explored: exp };
    }
    for (const { board: nb } of neighbors(cur.board)) {
      const nk = key(nb), ng = cur.g + 1, mh = manhattan(nb);
      if (vis.has(nk) && vis.get(nk) <= ng) continue;
      heap.push({ board: nb, g: ng, h: mh, f: ng + mh, parent: cur });
    }
    if (exp > 180000) break;
  }
  return null;
}

function aiStep() {
  const r = astar(S.aiBoard);
  if (!r || r.path.length < 2) return null;
  return { next: r.path[1], explored: r.explored, left: r.path.length - 2 };
}

/* ── Render ─────────────────────────────── */
function renderBoard(el, board, lastMoved, showMovable, blankIdx) {
  el.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const v = board[i];
    const d = document.createElement('div');
    let cls = 't';
    if (!v) cls += ' blank';
    else if (GOAL[i] === v) cls += ' ok';
    if (i === lastMoved && v) cls += ' pop';
    if (showMovable && v && adj(i, blankIdx)) cls += ' go';
    d.className = cls;
    d.textContent = v || '';
    if (cls.includes('go')) d.addEventListener('click', () => humanMove(i));
    el.appendChild(d);
  }
}

function render() {
  const hBl = blank(S.humanBoard);
  const aBl = blank(S.aiBoard);
  renderBoard(
    document.getElementById('human-board'),
    S.humanBoard, S.humanLast,
    S.started && !S.humanSolved && !S.paused, hBl
  );
  renderBoard(
    document.getElementById('ai-board'),
    S.aiBoard, S.aiLast,
    false, aBl
  );
  document.getElementById('human-moves').textContent = S.humanMoves + ' move' + (S.humanMoves !== 1 ? 's' : '');
  document.getElementById('ai-moves').textContent    = S.aiMoves + ' move' + (S.aiMoves !== 1 ? 's' : '');
  document.getElementById('ai-gn').textContent   = S.gn;
  document.getElementById('ai-fn').textContent   = S.fn;
  document.getElementById('ai-total').textContent = S.totalExplored.toLocaleString();
  document.getElementById('ai-left').textContent  = S.optimalLeft;
}

/* ── Human move ─────────────────────────── */
function humanMove(idx) {
  if (!S.started || S.humanSolved || S.done || S.paused) return;
  const bl = blank(S.humanBoard);
  if (!adj(idx, bl)) return;

  const nb = [...S.humanBoard];
  [nb[bl], nb[idx]] = [nb[idx], nb[bl]];
  S.humanBoard = nb;
  S.humanMoves++;
  S.humanLast = bl;
  render();

  if (solved(S.humanBoard)) { humanWin(); return; }
  if (!S.aiSolved) scheduleAI();
}

/* ── AI step ────────────────────────────── */
function scheduleAI() {
  clearTimeout(S.thinkTimer);
  if (S.paused) { S.pending = true; return; }
  S.thinkTimer = setTimeout(doAI, 300);
}

function doAI() {
  if (!S.started || S.aiSolved || S.done) return;
  const r = aiStep();
  if (!r) return;

  const oldBlank = blank(S.aiBoard);
  S.aiBoard = r.next;
  S.aiMoves++;
  S.gn = S.aiMoves;
  S.hn = manhattan(S.aiBoard);
  S.fn = S.gn + S.hn;
  S.totalExplored += r.explored;
  S.optimalLeft = r.left;
  S.aiLast = oldBlank;
  render();

  setTimeout(() => { S.aiLast = -1; render(); }, 400);

  if (solved(S.aiBoard)) aiWin();
}

/* ── Win ────────────────────────────────── */
function humanWin() {
  S.humanSolved = true;
  document.getElementById('human-hint').textContent = 'You solved it!';
  markSolved('human-board');
  if (!S.done) { S.done = true; clearTimeout(S.thinkTimer); S.aiSolved = true; modal('human'); }
}

function aiWin() {
  S.aiSolved = true;
  markSolved('ai-board');
  if (!S.done) { S.done = true; modal('ai'); }
}

function markSolved(id) {
  document.querySelectorAll('#' + id + ' .t:not(.blank)').forEach(t => t.classList.add('done'));
}

function modal(who) {
  const emoji = document.getElementById('d-emoji');
  const title = document.getElementById('d-title');
  const sub   = document.getElementById('d-sub');
  const stats = document.getElementById('d-stats');

  if (who === 'human') {
    emoji.textContent = '🏆';
    title.textContent = 'You Win!';
    title.style.color = 'var(--gold)';
    sub.textContent = 'You beat the AI!';
  } else {
    emoji.textContent = '🤖';
    title.textContent = 'AI Wins!';
    title.style.color = 'var(--ai)';
    sub.textContent = 'A* found the optimal path.';
  }

  stats.innerHTML = `
    <div class="dc ${who === 'human' ? 'win' : 'lose'}">
      <div style="color:var(--human);font-weight:600;font-size:.7rem;margin-bottom:3px">Human</div>
      Moves: <strong>${S.humanMoves}</strong>
    </div>
    <div class="dc ${who === 'ai' ? 'win' : 'lose'}">
      <div style="color:var(--ai);font-weight:600;font-size:.7rem;margin-bottom:3px">AI</div>
      Moves: <strong>${S.aiMoves}</strong><br>Explored: <strong>${S.totalExplored.toLocaleString()}</strong>
    </div>`;

  document.getElementById('overlay').classList.add('open');
}

/* ── Controls ───────────────────────────── */
function init() {
  clearTimeout(S.thinkTimer);
  const b = generate(SHUFFLES);
  S.humanBoard = [...b]; S.humanMoves = 0; S.humanSolved = false; S.humanLast = -1;
  S.aiBoard    = [...b]; S.aiMoves    = 0; S.aiSolved    = false; S.aiLast    = -1;
  S.gn = 0; S.hn = manhattan(b); S.fn = S.hn;
  S.totalExplored = 0; S.optimalLeft = 0;
  S.started = false; S.done = false; S.paused = false; S.pending = false;
  document.getElementById('human-hint').textContent = 'Use arrow keys or click a tile next to the empty space.';
  document.getElementById('btn-start').disabled = false;
  document.getElementById('btn-pause').disabled = true;
  document.getElementById('btn-pause').textContent = 'Pause';
  document.getElementById('overlay').classList.remove('open');
  render();
}

function startGame() {
  S.started = true; S.done = false; S.paused = false;
  document.getElementById('btn-start').disabled = true;
  document.getElementById('btn-pause').disabled = false;
  render();
}

function togglePause() {
  if (!S.started || S.done) return;
  const btn = document.getElementById('btn-pause');
  if (!S.paused) {
    S.paused = true;
    clearTimeout(S.thinkTimer);
    btn.textContent = 'Resume';
  } else {
    S.paused = false;
    btn.textContent = 'Pause';
    if (S.pending) { S.pending = false; scheduleAI(); }
  }
  render();
}

/* ── Keyboard ───────────────────────────── */
window.addEventListener('keydown', e => {
  if (!S.started || S.humanSolved || S.done || S.paused) return;

  const bl = blank(S.humanBoard);
  const br = Math.floor(bl / 4);
  const bc = bl % 4;
  let target = -1;

  if (e.code === 'ArrowUp')    { e.preventDefault(); if (br > 0) target = bl - 4; }
  if (e.code === 'ArrowDown')  { e.preventDefault(); if (br < 3) target = bl + 4; }
  if (e.code === 'ArrowLeft')  { e.preventDefault(); if (bc > 0) target = bl - 1; }
  if (e.code === 'ArrowRight') { e.preventDefault(); if (bc < 3) target = bl + 1; }

  if (target >= 0) humanMove(target);
});

/* ── Boot ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-reset').addEventListener('click', init);
  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-again').addEventListener('click', init);
  document.getElementById('btn-close').addEventListener('click', () => {
    document.getElementById('overlay').classList.remove('open');
  });
  init();
});
