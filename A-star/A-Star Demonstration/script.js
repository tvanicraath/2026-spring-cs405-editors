/**
 * ============================================================
 *  PATHFINDING VISUALIZER — script.js
 *  Supports A* and Dijkstra's algorithm
 * ============================================================
 */

'use strict';

/* ============================================================
   1. CONFIGURATION & CONSTANTS
   ============================================================ */

const CFG = {
  WALL_DENSITY: 0.27,
  MIN_DELAY_MS: 25,
  MAX_DELAY_MS: 1100,
  MAX_CLOSED_DISPLAY: 80,
};

const DIR_4 = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

const DIR_8 = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];

/* ============================================================
   2. NODE CLASS
   ============================================================ */

class Node {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.g = Infinity;
    this.h = 0;
    this.f = Infinity;
    this.parent = null;
    this.isWall = false;
  }

  get key() { return `${this.row},${this.col}`; }
}

/* ============================================================
   3. SEEDED RANDOM NUMBER GENERATOR
   ============================================================ */

function createSeededRandom(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
}

/* ============================================================
   4. HEURISTIC FUNCTIONS
   ============================================================ */

const HEURISTICS = {
  manhattan(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  },

  diagonal(a, b) {
    return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
  },

  euclidean(a, b) {
    const dr = a.row - b.row;
    const dc = a.col - b.col;
    return Math.sqrt(dr * dr + dc * dc);
  },
};

/* ============================================================
   5. GRID GENERATION
   ============================================================ */

function generateGrid(size, seed) {
  const rand = createSeededRandom(seed);
  const nodes = [];
  const nodeMap = {};

  for (let r = 0; r < size; r++) {
    nodes[r] = [];
    for (let c = 0; c < size; c++) {
      const node = new Node(r, c);

      const isStart = (r === 0 && c === 0);
      const isGoal = (r === size - 1 && c === size - 1);

      if (!isStart && !isGoal) {
        node.isWall = rand() < CFG.WALL_DENSITY;
      }

      nodes[r][c] = node;
      nodeMap[node.key] = node;
    }
  }

  return { nodes, nodeMap };
}

/* ============================================================
   6. NEIGHBOR UTILITIES
   ============================================================ */

function getNeighbors(node, nodeMap, size, directions) {
  const result = [];

  for (const [dr, dc] of directions) {
    const nr = node.row + dr;
    const nc = node.col + dc;

    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;

    const neighbor = nodeMap[`${nr},${nc}`];
    if (!neighbor || neighbor.isWall) continue;

    const cost = (dr !== 0 && dc !== 0) ? Math.SQRT2 : 1;
    result.push({ node: neighbor, cost });
  }

  return result;
}

/* ============================================================
   7. A* ALGORITHM — Generator Function
   ============================================================ */

function* aStarGenerator(nodeMap, startNode, goalNode, heuristicFn, directions, size) {

  for (const key in nodeMap) {
    const n = nodeMap[key];
    n.g = Infinity;
    n.h = 0;
    n.f = Infinity;
    n.parent = null;
  }

  startNode.g = 0;
  startNode.h = heuristicFn(startNode, goalNode);
  startNode.f = startNode.h;

  const openSet = [startNode];
  const closedSet = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => (a.f - b.f) || (a.h - b.h));
    const current = openSet.shift();

    yield {
      phase: 'select',
      current,
      openSet: [...openSet],
      closedSet: new Set(closedSet),
      exploringNeighbor: null,
      pathKeys: null,
    };

    if (current === goalNode) {
      const path = [];
      let node = current;
      while (node) {
        path.unshift(node);
        node = node.parent;
      }

      const pathKeys = new Set([startNode.key, goalNode.key]);
      for (let i = 1; i < path.length - 1; i++) {
        pathKeys.add(path[i].key);

        yield {
          phase: 'path',
          current: null,
          openSet: [],
          closedSet: new Set(closedSet),
          exploringNeighbor: null,
          pathKeys: new Set(pathKeys),
          path,
        };
      }

      yield {
        phase: 'done',
        current: null,
        openSet: [],
        closedSet: new Set(closedSet),
        exploringNeighbor: null,
        pathKeys: new Set(pathKeys),
        path,
      };
      return;
    }

    closedSet.add(current.key);

    for (const { node: neighbor, cost } of getNeighbors(current, nodeMap, size, directions)) {
      if (closedSet.has(neighbor.key)) continue;

      const tentativeG = current.g + cost;

      if (tentativeG < neighbor.g) {
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = heuristicFn(neighbor, goalNode);
        neighbor.f = neighbor.g + neighbor.h;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }

      yield {
        phase: 'explore',
        current,
        openSet: [...openSet],
        closedSet: new Set(closedSet),
        exploringNeighbor: neighbor,
        pathKeys: null,
      };
    }
  }

  yield {
    phase: 'no_path',
    current: null,
    openSet: [],
    closedSet: new Set(closedSet),
    exploringNeighbor: null,
    pathKeys: null,
  };
}

/* ============================================================
   8. DIJKSTRA'S ALGORITHM — Generator Function
   ============================================================ */

function* dijkstraGenerator(nodeMap, startNode, goalNode, directions, size) {

  for (const key in nodeMap) {
    const n = nodeMap[key];
    n.g = Infinity;
    n.h = 0;
    n.f = Infinity;
    n.parent = null;
  }

  startNode.g = 0;

  const openSet = [startNode];
  const closedSet = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.g - b.g);
    const current = openSet.shift();

    yield {
      phase: 'select',
      current,
      openSet: [...openSet],
      closedSet: new Set(closedSet),
      exploringNeighbor: null,
      pathKeys: null,
    };

    if (current === goalNode) {
      const path = [];
      let node = current;
      while (node) {
        path.unshift(node);
        node = node.parent;
      }

      const pathKeys = new Set([startNode.key, goalNode.key]);
      for (let i = 1; i < path.length - 1; i++) {
        pathKeys.add(path[i].key);

        yield {
          phase: 'path',
          current: null,
          openSet: [],
          closedSet: new Set(closedSet),
          exploringNeighbor: null,
          pathKeys: new Set(pathKeys),
          path,
        };
      }

      yield {
        phase: 'done',
        current: null,
        openSet: [],
        closedSet: new Set(closedSet),
        exploringNeighbor: null,
        pathKeys: new Set(pathKeys),
        path,
      };
      return;
    }

    closedSet.add(current.key);

    for (const { node: neighbor, cost } of getNeighbors(current, nodeMap, size, directions)) {
      if (closedSet.has(neighbor.key)) continue;

      const tentativeG = current.g + cost;

      if (tentativeG < neighbor.g) {
        neighbor.parent = current;
        neighbor.g = tentativeG;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }

      yield {
        phase: 'explore',
        current,
        openSet: [...openSet],
        closedSet: new Set(closedSet),
        exploringNeighbor: neighbor,
        pathKeys: null,
      };
    }
  }

  yield {
    phase: 'no_path',
    current: null,
    openSet: [],
    closedSet: new Set(closedSet),
    exploringNeighbor: null,
    pathKeys: null,
  };
}

/* ============================================================
   9. CELL VISUAL STATE TRACKER
   ============================================================ */

const CellVS = {
  map: {},

  set(key, stateClass) {
    if (this.map[key] === stateClass) return;

    const el = App.cellElements[key];
    if (!el) return;

    const prev = this.map[key];
    if (prev) el.classList.remove(prev);
    if (stateClass) el.classList.add(stateClass);

    this.map[key] = stateClass || null;
  },

  restore(key) {
    if (!key) return;
    const isProtected = (key === App.startNode.key || key === App.goalNode.key);
    if (isProtected) return;

    if (App.pathKeys.has(key))       this.set(key, 'path');
    else if (App.closedSetKeys.has(key)) this.set(key, 'closed');
    else if (App.openSetKeys.has(key))   this.set(key, 'open');
    else                              this.set(key, null);
  },

  reset() {
    for (const key in this.map) {
      const el = App.cellElements[key];
      if (el && this.map[key]) el.classList.remove(this.map[key]);
    }
    this.map = {};
  },
};

/* ============================================================
   10. APPLICATION STATE
   ============================================================ */

const App = {
  gridSize: 12,
  algorithm: 'astar',
  heuristic: 'manhattan',
  seed: 42,
  speed: 5,

  nodes: null,
  nodeMap: null,
  startNode: null,
  goalNode: null,

  cellElements: {},

  generator: null,

  animTimer: null,
  isRunning: false,
  isPaused: false,
  stepCount: 0,

  openSetKeys: new Set(),
  closedSetKeys: new Set(),
  pathKeys: new Set(),

  _prevCurrentKey: null,
  _prevExploringKey: null,
};

/* ============================================================
   11. DELAY CALCULATOR
   ============================================================ */

function calcDelay(speed) {
  const t = (speed - 1) / 9;
  const max = CFG.MAX_DELAY_MS;
  const min = CFG.MIN_DELAY_MS;
  return Math.round(max * Math.pow(min / max, t));
}

/* ============================================================
   12. DOM: GRID BUILDER
   ============================================================ */

function buildGridDOM() {
  const container = document.getElementById('grid-container');
  container.innerHTML = '';
  App.cellElements = {};
  CellVS.reset();

  const { nodes, gridSize, startNode, goalNode } = App;

  const area = document.getElementById('grid-area');
  const availW = area.clientWidth - 40;
  const availH = area.clientHeight - 64;
  const maxPx = Math.min(availW, availH);
  const cellPx = Math.max(18, Math.floor(maxPx / gridSize) - 2);

  const showCoords = cellPx >= 32;
  const fontSize = showCoords ? 8 : 7;

  container.style.gridTemplateColumns = `repeat(${gridSize}, ${cellPx}px)`;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const node = nodes[r][c];
      const el = document.createElement('div');

      el.className = 'cell';
      el.style.cssText = `width:${cellPx}px;height:${cellPx}px;font-size:${fontSize}px;`;
      el.dataset.key = node.key;

      if (node === startNode) {
        el.textContent = 'S';
      } else if (node === goalNode) {
        el.textContent = 'G';
      } else if (showCoords && !node.isWall) {
        el.textContent = `${r},${c}`;
      }

      let initState = null;
      if (node.isWall) initState = 'wall';
      else if (node === startNode) initState = 'start';
      else if (node === goalNode) initState = 'goal';

      if (initState) el.classList.add(initState);
      CellVS.map[node.key] = initState;

      el.addEventListener('mouseenter', (e) => showTooltip(e, node));
      el.addEventListener('mousemove', moveTooltip);
      el.addEventListener('mouseleave', hideTooltip);

      container.appendChild(el);
      App.cellElements[node.key] = el;
    }
  }
}

/* ============================================================
   13. DOM: STEP RENDERER
   ============================================================ */

function applyStep(step) {
  const { startNode, goalNode } = App;

  const isProtected = (key) => (key === startNode.key || key === goalNode.key);

  const newOpenKeys = new Set(step.openSet.map(n => n.key));

  for (const key of App.openSetKeys) {
    if (!newOpenKeys.has(key)) {
      App.openSetKeys.delete(key);
      if (!isProtected(key) && !App.closedSetKeys.has(key) && !App.pathKeys.has(key)) {
        CellVS.set(key, null);
      }
    }
  }

  for (const key of newOpenKeys) {
    if (!App.openSetKeys.has(key)) {
      App.openSetKeys.add(key);
      if (!isProtected(key) && !App.closedSetKeys.has(key) && !App.pathKeys.has(key)) {
        CellVS.set(key, 'open');
      }
    }
  }

  for (const key of step.closedSet) {
    if (!App.closedSetKeys.has(key)) {
      App.closedSetKeys.add(key);
      if (!isProtected(key) && !App.pathKeys.has(key)) {
        CellVS.set(key, 'closed');
      }
    }
  }

  if (step.pathKeys) {
    for (const key of step.pathKeys) {
      if (!isProtected(key) && !App.pathKeys.has(key)) {
        App.pathKeys.add(key);
        CellVS.set(key, 'path');
      }
    }
  }

  if (App._prevCurrentKey) {
    CellVS.restore(App._prevCurrentKey);
    App._prevCurrentKey = null;
  }

  if (step.current && step.phase !== 'path' && step.phase !== 'done') {
    const key = step.current.key;
    if (!isProtected(key)) {
      CellVS.set(key, 'current');
      App._prevCurrentKey = key;
    }
  }

  if (App._prevExploringKey) {
    CellVS.restore(App._prevExploringKey);
    App._prevExploringKey = null;
  }

  if (step.exploringNeighbor) {
    const key = step.exploringNeighbor.key;
    if (!isProtected(key) && !App.closedSetKeys.has(key) && !App.pathKeys.has(key)) {
      CellVS.set(key, 'exploring');
      App._prevExploringKey = key;
    }
  }

  renderOpenList(step.openSet, step.current);
  renderClosedList(step.closedSet);
  updateStatus(step);

  App.stepCount++;
  document.getElementById('step-counter').textContent = `Step: ${App.stepCount}`;
}

/* ============================================================
   14. DOM: LIST RENDERERS
   ============================================================ */

function renderOpenList(openSet, current) {
  const listEl = document.getElementById('open-list');
  const countEl = document.getElementById('open-count');
  const fragment = document.createDocumentFragment();

  countEl.textContent = openSet.length;

  const isDijkstra = App.algorithm === 'dijkstra';
  
  if (isDijkstra) {
    const sorted = [...openSet].sort((a, b) => a.g - b.g);
    for (const node of sorted) {
      const row = document.createElement('div');
      row.className = 'list-row';
      if (current && node.key === current.key) row.classList.add('is-current');
      row.innerHTML =
        `<span class="pos">(${node.row},${node.col})</span>` +
        `<span>${fmtCost(node.g)}</span>` +
        `<span>—</span>` +
        `<span>—</span>`;
      fragment.appendChild(row);
    }
  } else {
    const sorted = [...openSet].sort((a, b) => (a.f - b.f) || (a.h - b.h));
    for (const node of sorted) {
      const row = document.createElement('div');
      row.className = 'list-row';
      if (current && node.key === current.key) row.classList.add('is-current');
      row.innerHTML =
        `<span class="pos">(${node.row},${node.col})</span>` +
        `<span>${fmtCost(node.g)}</span>` +
        `<span>${fmtCost(node.h)}</span>` +
        `<span>${fmtCost(node.f)}</span>`;
      fragment.appendChild(row);
    }
  }

  listEl.innerHTML = '';
  listEl.appendChild(fragment);
}

function renderClosedList(closedSet) {
  const listEl = document.getElementById('closed-list');
  const countEl = document.getElementById('closed-count');
  const fragment = document.createDocumentFragment();

  countEl.textContent = closedSet.size;

  const isDijkstra = App.algorithm === 'dijkstra';
  const keys = [...closedSet].reverse().slice(0, CFG.MAX_CLOSED_DISPLAY);

  for (const key of keys) {
    const node = App.nodeMap[key];
    if (!node) continue;

    const row = document.createElement('div');
    row.className = 'list-row';
    
    if (isDijkstra) {
      row.innerHTML =
        `<span class="pos">(${node.row},${node.col})</span>` +
        `<span>${fmtCost(node.g)}</span>` +
        `<span>—</span>` +
        `<span>—</span>`;
    } else {
      row.innerHTML =
        `<span class="pos">(${node.row},${node.col})</span>` +
        `<span>${fmtCost(node.g)}</span>` +
        `<span>${fmtCost(node.h)}</span>` +
        `<span>${fmtCost(node.f)}</span>`;
    }

    fragment.appendChild(row);
  }

  listEl.innerHTML = '';
  listEl.appendChild(fragment);
}

function fmtCost(v) {
  if (v === Infinity || v === undefined || isNaN(v)) return '∞';
  return Number.isInteger(v) ? v : v.toFixed(2);
}

/* ============================================================
   15. DOM: STATUS BAR & TOOLTIP
   ============================================================ */

function updateStatus(step) {
  const el = document.getElementById('status-text');
  const isDijkstra = App.algorithm === 'dijkstra';

  switch (step.phase) {
    case 'select':
      if (isDijkstra) {
        el.textContent = `▶ Processing node (${step.current.row},${step.current.col}) — g = ${fmtCost(step.current.g)}`;
      } else {
        el.textContent = `▶ Processing node (${step.current.row},${step.current.col}) — f = ${fmtCost(step.current.f)} (g=${fmtCost(step.current.g)}, h=${fmtCost(step.current.h)})`;
      }
      break;

    case 'explore': {
      const nb = step.exploringNeighbor;
      if (isDijkstra) {
        el.textContent = `⤷ Exploring neighbor (${nb.row},${nb.col}) — g=${fmtCost(nb.g)}`;
      } else {
        el.textContent = `⤷ Exploring neighbor (${nb.row},${nb.col}) — g=${fmtCost(nb.g)}, h=${fmtCost(nb.h)}, f=${fmtCost(nb.f)}`;
      }
      break;
    }

    case 'path':
      el.textContent = '★ Tracing final path…';
      break;

    case 'done': {
      const len = step.path ? step.path.length - 1 : '?';
      el.textContent = `✓ Path found! Length: ${len} steps  ·  Total nodes explored: ${App.closedSetKeys.size}`;
      break;
    }

    case 'no_path':
      el.textContent = `✗ No path exists between Start and Goal.`;
      break;

    default:
      el.textContent = '';
  }
}

/* Tooltip */

function showTooltip(event, node) {
  if (node.isWall) { hideTooltip(); return; }

  const tip = document.getElementById('tooltip');
  const isDijkstra = App.algorithm === 'dijkstra';

  const gStr = fmtCost(node.g);

  if (isDijkstra) {
    const parentStr = node.parent ? `(${node.parent.row},${node.parent.col})` : '—';
    tip.innerHTML =
      `<div class="tip-title">Node (${node.row}, ${node.col})</div>` +
      `<div class="tip-row"><span class="tip-lbl">g cost</span><span class="tip-val">${gStr}</span></div>` +
      `<div class="tip-row"><span class="tip-lbl">parent</span><span class="tip-val">${parentStr}</span></div>`;
  } else {
    const hStr = node.h ? fmtCost(node.h) : '—';
    const fStr = fmtCost(node.f);
    const parentStr = node.parent ? `(${node.parent.row},${node.parent.col})` : '—';
    tip.innerHTML =
      `<div class="tip-title">Node (${node.row}, ${node.col})</div>` +
      `<div class="tip-row"><span class="tip-lbl">g cost</span><span class="tip-val">${gStr}</span></div>` +
      `<div class="tip-row"><span class="tip-lbl">h cost</span><span class="tip-val">${hStr}</span></div>` +
      `<div class="tip-row"><span class="tip-lbl">f cost</span><span class="tip-val">${fStr}</span></div>` +
      `<div class="tip-row"><span class="tip-lbl">parent</span><span class="tip-val">${parentStr}</span></div>`;
  }

  tip.classList.remove('hidden');
  positionTooltip(event);
}

function moveTooltip(event) {
  const tip = document.getElementById('tooltip');
  if (!tip.classList.contains('hidden')) positionTooltip(event);
}

function hideTooltip() {
  document.getElementById('tooltip').classList.add('hidden');
}

function positionTooltip(event) {
  const tip = document.getElementById('tooltip');
  const m = 14;
  let x = event.clientX + m;
  let y = event.clientY + m;

  const tipW = 160, tipH = 120;
  if (x + tipW > window.innerWidth) x = event.clientX - tipW - m;
  if (y + tipH > window.innerHeight) y = event.clientY - tipH - m;

  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}

/* ============================================================
   16. ANIMATION CONTROLLER
   ============================================================ */

function runNextStep() {
  if (!App.isRunning || App.isPaused) return;

  const result = App.generator.next();

  if (result.done) { finishAnimation(false); return; }

  const step = result.value;

  requestAnimationFrame(() => {
    applyStep(step);

    if (step.phase === 'done') {
      finishAnimation(true);
    } else if (step.phase === 'no_path') {
      finishAnimation(false);
    } else {
      App.animTimer = setTimeout(runNextStep, calcDelay(App.speed));
    }
  });
}

function finishAnimation(success) {
  App.isRunning = false;
  App.isPaused = false;
  clearTimeout(App.animTimer);

  document.getElementById('btn-play').disabled = true;
  document.getElementById('btn-pause').disabled = true;

  const playBtn = document.getElementById('btn-play');
  playBtn.textContent = success ? '✓ Done' : '✗ No Path';
  playBtn.style.color = success ? 'var(--c-start)' : 'var(--c-goal)';
}

/* ============================================================
   17. APP INITIALISATION & RESET
   ============================================================ */

function initApp() {
  const rawSize = parseInt(document.getElementById('grid-size').value, 10);
  const seed = parseInt(document.getElementById('wall-seed').value, 10) || 42;
  const algoKey = document.querySelector('input[name="algorithm"]:checked').value;
  const heurKey = document.querySelector('input[name="heuristic"]:checked').value;

  App.gridSize = Math.max(5, Math.min(30, rawSize || 12));
  App.algorithm = algoKey;
  App.heuristic = heurKey;
  App.seed = seed;

  const { nodes, nodeMap } = generateGrid(App.gridSize, seed);
  App.nodes = nodes;
  App.nodeMap = nodeMap;
  App.startNode = nodes[0][0];
  App.goalNode = nodes[App.gridSize - 1][App.gridSize - 1];

  clearTimeout(App.animTimer);
  App.isRunning = false;
  App.isPaused = false;
  App.stepCount = 0;
  App.openSetKeys = new Set();
  App.closedSetKeys = new Set();
  App.pathKeys = new Set();
  App._prevCurrentKey = null;
  App._prevExploringKey = null;

  document.getElementById('setup-overlay').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  const isDijkstra = algoKey === 'dijkstra';
  const dirLabel = (heurKey === 'manhattan' && !isDijkstra) ? '4-dir' : '8-dir';
  const algoDisplay = isDijkstra ? "Dijkstra" : "A*";
  
  document.getElementById('algo-badge').textContent = isDijkstra ? 'D' : 'A*';
  document.getElementById('header-meta').textContent =
    `${App.gridSize}×${App.gridSize} · ${algoDisplay} · ${dirLabel} · seed ${seed}`;

  const listHeader = document.getElementById('list-header');
  const listHeaderRight = document.getElementById('list-header-right');
  
  if (isDijkstra) {
    listHeader.innerHTML = '<span>Node</span><span>g</span><span>—</span><span>—</span>';
    listHeaderRight.innerHTML = '<span>Node</span><span>g</span><span>—</span><span>—</span>';
  } else {
    listHeader.innerHTML = '<span>Node</span><span>g</span><span>h</span><span>f</span>';
    listHeaderRight.innerHTML = '<span>Node</span><span>g</span><span>h</span><span>f</span>';
  }

  buildGridDOM();

  const directions = isDijkstra ? DIR_8 : (heurKey === 'manhattan' ? DIR_4 : DIR_8);
  
  if (isDijkstra) {
    App.generator = dijkstraGenerator(App.nodeMap, App.startNode, App.goalNode, directions, App.gridSize);
  } else {
    const heuristicFn = HEURISTICS[heurKey];
    App.generator = aStarGenerator(App.nodeMap, App.startNode, App.goalNode, heuristicFn, directions, App.gridSize);
  }

  const playBtn = document.getElementById('btn-play');
  const pauseBtn = document.getElementById('btn-pause');
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  playBtn.textContent = '▶ Play';
  playBtn.style.color = '';

  document.getElementById('status-text').textContent = 'Ready — press Play to begin.';
  document.getElementById('step-counter').textContent = 'Step: 0';
  document.getElementById('open-list').innerHTML = '';
  document.getElementById('closed-list').innerHTML = '';
  document.getElementById('open-count').textContent = '0';
  document.getElementById('closed-count').textContent = '0';
}

function resetApp() {
  clearTimeout(App.animTimer);
  initApp();
}

/* ============================================================
   18. EVENT LISTENERS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('setup-start-btn').addEventListener('click', initApp);

  document.getElementById('grid-size').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') initApp();
  });
  document.getElementById('wall-seed').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') initApp();
  });

  document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isDijkstra = document.querySelector('input[name="algorithm"]:checked').value === 'dijkstra';
      const heuristicGroup = document.getElementById('heuristic-group');
      if (isDijkstra) {
        heuristicGroup.style.opacity = '0.4';
        heuristicGroup.style.pointerEvents = 'none';
      } else {
        heuristicGroup.style.opacity = '1';
        heuristicGroup.style.pointerEvents = 'auto';
      }
    });
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    if (App.isPaused) {
      App.isPaused = false;
      App.isRunning = true;
      document.getElementById('btn-play').textContent = '▶ Running…';
      document.getElementById('btn-play').disabled = true;
      document.getElementById('btn-pause').disabled = false;
      runNextStep();
    } else if (!App.isRunning) {
      App.isRunning = true;
      document.getElementById('btn-play').textContent = '▶ Running…';
      document.getElementById('btn-play').disabled = true;
      document.getElementById('btn-pause').disabled = false;
      runNextStep();
    }
  });

  document.getElementById('btn-pause').addEventListener('click', () => {
    if (!App.isRunning) return;
    App.isRunning = false;
    App.isPaused = true;
    clearTimeout(App.animTimer);

    document.getElementById('btn-play').textContent = '▶ Resume';
    document.getElementById('btn-play').disabled = false;
    document.getElementById('btn-pause').disabled = true;
    document.getElementById('status-text').textContent = 'Paused. Press Resume to continue.';
  });

  document.getElementById('btn-reset').addEventListener('click', resetApp);

  document.getElementById('btn-new-grid').addEventListener('click', () => {
    clearTimeout(App.animTimer);
    App.isRunning = false;
    document.getElementById('setup-overlay').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  });

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    App.speed = parseInt(e.target.value, 10);
    document.getElementById('speed-val').textContent = App.speed;
  });

  document.addEventListener('keydown', (e) => {
    if (document.getElementById('app').classList.contains('hidden')) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (App.isRunning) {
          document.getElementById('btn-pause').click();
        } else {
          document.getElementById('btn-play').click();
        }
        break;

      case 'KeyR':
        if (e.target.tagName !== 'INPUT') {
          document.getElementById('btn-reset').click();
        }
        break;

      case 'ArrowUp':
      case 'ArrowRight': {
        const slider = document.getElementById('speed-slider');
        slider.value = Math.min(10, parseInt(slider.value, 10) + 1);
        slider.dispatchEvent(new Event('input'));
        break;
      }
      case 'ArrowDown':
      case 'ArrowLeft': {
        const slider = document.getElementById('speed-slider');
        slider.value = Math.max(1, parseInt(slider.value, 10) - 1);
        slider.dispatchEvent(new Event('input'));
        break;
      }
    }
  });
});
