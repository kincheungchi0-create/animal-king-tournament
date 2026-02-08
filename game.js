// ANIMAL KING TOURNAMENT - REAL-TIME BATTLE ENGINE
// Version: Space Action Platformer

const GameState = {
    // Nav
    currentScreen: 'main-menu',

    // Tournament Data
    tournament: {
        fighters: [],
        currentRound: [],
        roundIndex: 0,
        currentMatchIndex: 0
    },

    // Real-Time Battle State
    battleActive: false,
    width: 1000,
    height: 400, // Arena dimensions logic (not pixels)
    animationFrameId: null, // NEW: Track loop ID

    player: {
        x: 100, y: 0, w: 80, h: 80,
        hp: 100, maxHp: 100, cd: 0,
        img: null, name: 'Player'
    },
    enemy: {
        x: 800, y: 0, w: 80, h: 80,
        hp: 100, maxHp: 100, cd: 0,
        img: null, name: 'Enemy',
        moveTimer: 0, logicTimer: 0
    },
    ullets: [], // Projectiles

    // Input
    keys: { left: false, right: false, space: false, up: false }
};

const ROUND_NAMES = ["ROUND OF 16", "QUARTER FINALS", "SEMI FINALS", "GRAND FINAL"];
const MOVE_SPEED = 5;
const BULLET_SPEED = 12;
const FIRE_COOLDOWN = 30; // Frames (approx 0.5s)
const GRAVITY = 0.8;
const JUMP_FORCE = 16;

// --- BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', () => {
    // Inject Styles
    ['tournament.css', 'space_arena.css'].forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    });

    initEventListeners();

    // Input Handlers
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') GameState.keys.left = true;
        if (e.key === 'ArrowRight') GameState.keys.right = true;
        if (e.key === 'ArrowUp') GameState.keys.up = true; // NEW: Jump
        if (e.code === 'Space') {
            if (GameState.battleActive) {
                GameState.keys.space = true;
            } else {
                handleGlobalSpaceKey();
            }
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') GameState.keys.left = false;
        if (e.key === 'ArrowRight') GameState.keys.right = false;
        if (e.key === 'ArrowUp') GameState.keys.up = false;
        if (e.code === 'Space') GameState.keys.space = false;
    });

    // Text Updates
    const title = document.querySelector('#main-menu h1');
    if (title) title.textContent = "ANIMAL KING SPACE ACTION";
    const sub = document.querySelector('#main-menu .subtitle');
    if (sub) sub.textContent = "Arrows to Move/Jump, Space to Shoot!";
    const btn = document.getElementById('btn-start');
    if (btn) btn.innerHTML = "🚀 PUSH SPACE TO START 🔊";

    // Setup Tournament Screen
    if (!document.getElementById('tournament-screen')) {
        const ts = document.createElement('div');
        ts.id = 'tournament-screen';
        ts.className = 'tournament-screen screen';
        ts.innerHTML = `
            <div class="tournament-header">
                <h2 id="round-title" class="round-title">ROUND OF 16</h2>
                <div id="round-subtitle" class="round-subtitle">Matches Remaining</div>
            </div>
            <div id="match-grid" class="match-grid"></div>
            <div class="tournament-controls">
                <button id="btn-next-match" class="next-match-btn">PUSH SPACE TO START ⚔️</button>
            </div>
        `;
        document.getElementById('app').appendChild(ts);
        document.getElementById('btn-next-match').addEventListener('click', startCurrentMatch);
    }
});

function handleGlobalSpaceKey() {
    // 1. If Modal Active (Game Over / Win)
    const modal = document.getElementById('result-modal');
    if (modal && modal.classList.contains('active')) {
        const btn = document.getElementById('btn-rematch');
        if (btn && btn.offsetParent !== null) { // Check visibility
            btn.click();
            return;
        }
    }

    // 2. Main Menu
    if (GameState.currentScreen === 'main-menu') {
        if (window.audioManager) window.audioManager.init();
        initTournament();
        return;
    }

    // 3. Tournament Screen
    if (GameState.currentScreen === 'tournament-screen') {
        startCurrentMatch();
        return;
    }
}

function initEventListeners() {
    const attach = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    };
    attach('btn-start', () => {
        if (window.audioManager) window.audioManager.init();
        initTournament();
    });
    attach('btn-menu', () => {
        GameState.battleActive = false;
        showScreen('main-menu');
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        if (screenId === 'tournament-screen') target.style.display = 'flex';
        else target.style.display = 'block';
    }
    GameState.currentScreen = screenId;
}

// --- TOURNAMENT LOGIC (Mostly Unchanged) ---

function initTournament() {
    if (window.audioManager) {
        window.audioManager.play('start');
        window.audioManager.playBGM('bgm');
    }
    let pool = [...DIGIMON_DATABASE];
    pool.sort(() => Math.random() - 0.5);
    if (pool.length < 16) while (pool.length < 16) pool = pool.concat(pool);
    GameState.tournament.fighters = pool.slice(0, 16);
    GameState.tournament.roundIndex = 0;
    generateUnknownRound(GameState.tournament.fighters);
    updateBracketUI();
    showScreen('tournament-screen');
}

function generateUnknownRound(participants) {
    const matches = [];
    for (let i = 0; i < participants.length; i += 2) {
        matches.push({
            id: matches.length + 1,
            p1: participants[i], p2: participants[i + 1], winner: null, status: 'pending'
        });
    }
    GameState.tournament.currentRound = matches;
    GameState.tournament.currentMatchIndex = 0;
}

function updateBracketUI() {
    const t = GameState.tournament;
    const grid = document.getElementById('match-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const title = document.getElementById('round-title');
    if (title) title.textContent = ROUND_NAMES[t.roundIndex] || "TOURNAMENT";
    const pending = t.currentRound.filter(m => m.status !== 'completed').length;
    const subtitle = document.getElementById('round-subtitle');
    if (subtitle) subtitle.textContent = pending === 0 ? "Round Complete!" : `${pending} Matches Remaining`;

    t.currentRound.forEach((match, index) => {
        const card = document.createElement('div');
        let cardClass = 'match-card';
        if (match.status === 'completed') cardClass += ' completed';
        else if (index === t.currentMatchIndex && pending > 0) cardClass += ' current';
        else cardClass += ' upcoming';
        card.className = cardClass;

        const p1HTML = renderMiniFighter(match.p1, match.winner === match.p1);
        const p2HTML = match.p2 ? renderMiniFighter(match.p2, match.winner === match.p2) : `<div>BYE</div>`;

        card.innerHTML = `<div class="match-id">M${index + 1}</div>${p1HTML}<div class="vs-badge">VS</div>${p2HTML}`;
        grid.appendChild(card);
    });

    const btn = document.getElementById('btn-next-match');
    if (btn) {
        btn.style.display = 'block';
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        if (pending === 0) {
            if (t.currentRound.length === 1) {
                newBtn.textContent = "VIEW FINAL RESULTS 🏆";
                newBtn.addEventListener('click', showTournamentWinner);
            } else {
                newBtn.textContent = "START NEXT ROUND ➡️";
                newBtn.addEventListener('click', advanceToNextRound);
            }
        } else {
            newBtn.textContent = "START MATCH ⚔️";
            newBtn.addEventListener('click', startCurrentMatch);
        }
    }
}

function renderMiniFighter(fighter, isWinner) {
    return `<div class="fighter-mini ${isWinner ? 'winner' : ''}">
            <img src="${fighter.image}" onerror="this.src='https://via.placeholder.com/60'">
            <div class="name">${fighter.name}</div>
        </div>`;
}

// --- REAL-TIME BATTLE ENGINE ---

function startCurrentMatch() {
    // 1. CRITICAL FIX: Stop previous loop to prevent 'Fast Mode'
    if (GameState.animationFrameId) {
        cancelAnimationFrame(GameState.animationFrameId);
        GameState.animationFrameId = null;
    }
    GameState.battleActive = false;

    const t = GameState.tournament;
    if (t.currentMatchIndex >= t.currentRound.length) return;
    const match = t.currentRound[t.currentMatchIndex];

    // Init state
    GameState.player.hp = 100;
    GameState.player.img = match.p1.image;
    GameState.player.name = match.p1.name;
    GameState.player.x = 100;
    GameState.player.y = 0;
    GameState.player.dy = 0;

    GameState.enemy.hp = 100;
    GameState.enemy.img = match.p2.image;
    GameState.enemy.name = match.p2.name;
    GameState.enemy.x = 800;
    GameState.enemy.y = 0;
    GameState.enemy.dy = 0;

    GameState.bullets = [];
    GameState.battleActive = true;

    if (window.audioManager) window.audioManager.play('start');

    // Build Arena DOM if needed
    let bs = document.getElementById('battle-screen');
    if (!bs) {
        bs = document.createElement('div');
        bs.id = 'battle-screen';
        bs.className = 'screen';
        document.getElementById('app').appendChild(bs);
    }

    bs.innerHTML = `
        <div id="game-stage">
            <div class="stars"></div>
            <div class="hud-layer">
                <div class="hud-p1">
                    <div style="margin-bottom:5px;">${GameState.player.name}</div>
                    <div class="hp-bar-frame"><div id="hp-p1" class="hp-fill"></div></div>
                </div>
                <div class="hud-p2">
                    <div style="margin-bottom:5px; text-align:right;">${GameState.enemy.name}</div>
                    <div class="hp-bar-frame"><div id="hp-p2" class="hp-fill"></div></div>
                </div>
            </div>
            
            <div id="p1-sprite" class="sprite sprite-p1" style="background-image:url('${GameState.player.img}')"></div>
            <div id="p2-sprite" class="sprite sprite-p2" style="background-image:url('${GameState.enemy.img}')"></div>
            
            <div class="stage-floor"></div>
            <div class="controls-hint">ARROWS: Move/Jump | SPACE: Fire</div>
        </div>
    `;

    showScreen('battle-screen');

    // Start Loop
    gameLoop();
}

function gameLoop() {
    if (!GameState.battleActive) return;

    updateGameLogic();
    renderGame();

    GameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function updateGameLogic() {
    const p1 = GameState.player;
    const p2 = GameState.enemy;
    const width = 1000;

    // 1. Player Move
    if (GameState.keys.left && p1.x > 0) p1.x -= MOVE_SPEED;
    if (GameState.keys.right && p1.x < width - p1.w) p1.x += MOVE_SPEED;

    // Player Jump
    if (p1.y === 0 && GameState.keys.up) {
        p1.dy = JUMP_FORCE;
    }
    p1.y += p1.dy;
    if (p1.y > 0) p1.dy -= GRAVITY;
    if (p1.y < 0) { p1.y = 0; p1.dy = 0; }

    // 2. Player Shoot
    if (p1.cd > 0) p1.cd--;
    if (GameState.keys.space && p1.cd === 0) {
        spawnBullet(p1.x + p1.w, p1.y + 40, BULLET_SPEED, 'p1');
        p1.cd = FIRE_COOLDOWN;
        if (window.audioManager) window.audioManager.play('hit_fast', { volume: 0.5 });
    }

    // 3. Enemy AI
    p2.logicTimer++;
    if (p2.logicTimer > 45) { // Decision frequently
        p2.moveDir = Math.random() < 0.5 ? -1 : 1;

        // Random Jump
        if (Math.random() < 0.3 && p2.y === 0) {
            p2.dy = JUMP_FORCE;
        }

        p2.logicTimer = 0;
    }

    // Enemy Move & Physics
    if (p2.moveDir === -1 && p2.x > 0) p2.x -= (MOVE_SPEED * 0.6);
    if (p2.moveDir === 1 && p2.x < width - p2.w) p2.x += (MOVE_SPEED * 0.6);

    p2.y += p2.dy;
    if (p2.y > 0) p2.dy -= GRAVITY;
    if (p2.y < 0) { p2.y = 0; p2.dy = 0; }

    // Enemy Shoot
    if (p2.cd > 0) p2.cd--;
    if (p2.cd === 0 && Math.random() < 0.05) {
        spawnBullet(p2.x, p2.y + 40, -BULLET_SPEED, 'p2');
        p2.cd = FIRE_COOLDOWN * 1.5;
        if (window.audioManager) window.audioManager.play('hit_fast', { volume: 0.5 });
    }

    // 4. Update Bullets & Collisions
    updateBulletsAndCollisions(p1, p2, width);
}

function updateBulletsAndCollisions(p1, p2, width) {
    for (let i = GameState.bullets.length - 1; i >= 0; i--) {
        let b = GameState.bullets[i];
        b.x += b.dx;

        // Remove OOB
        if (b.x < -50 || b.x > width + 50) {
            GameState.bullets.splice(i, 1);
            continue;
        }

        let hit = false;
        if (b.owner === 'p1') {
            // Check against Enemy (p2)
            if (checkOverlap(b, p2)) {
                takeDamage('p2', 15);
                hit = true;
            }
        } else {
            // Check against Player (p1)
            if (checkOverlap(b, p1)) {
                takeDamage('p1', 15);
                hit = true;
            }
        }

        if (hit) {
            spawnExplosion(b.x, b.y + 10);
            GameState.bullets.splice(i, 1);
        }
    }
}

function checkOverlap(bullet, actor) {
    // Bullet: x, y (bottom), size 30
    // Actor: x, y (bottom), size 80 (w/h)
    // IMPORTANT: Y is bottom-based.

    const bLeft = bullet.x;
    const bRight = bullet.x + 30;
    const bBottom = bullet.y;
    const bTop = bullet.y + 30;

    const aLeft = actor.x + 20; // Hitbox padding
    const aRight = actor.x + actor.w - 20;
    const aBottom = actor.y;
    const aTop = actor.y + actor.h;

    return (bLeft < aRight && bRight > aLeft && bBottom < aTop && bTop > aBottom);
}

function renderGame() {
    const p1El = document.getElementById('p1-sprite');
    const p2El = document.getElementById('p2-sprite');

    if (p1El) {
        p1El.style.left = GameState.player.x + 'px';
        p1El.style.bottom = (40 + GameState.player.y) + 'px'; // Base 40 + Jump Offset
    }
    if (p2El) {
        p2El.style.left = GameState.enemy.x + 'px';
        p2El.style.bottom = (40 + GameState.enemy.y) + 'px';
    }

    // Render HP
    const hp1 = document.getElementById('hp-p1');
    const hp2 = document.getElementById('hp-p2');
    if (hp1) hp1.style.width = GameState.player.hp + '%';
    if (hp2) hp2.style.width = GameState.enemy.hp + '%';

    // Render Bullets
    document.querySelectorAll('.bullet').forEach(el => el.remove());

    const stage = document.getElementById('game-stage');
    GameState.bullets.forEach(b => {
        const el = document.createElement('div');
        el.className = b.owner === 'p1' ? 'bullet' : 'bullet bullet-p2';
        el.style.left = b.x + 'px';
        el.style.bottom = b.y + 'px';
        stage.appendChild(el);
    });
}

function spawnBullet(x, y, dx, owner) {
    GameState.bullets.push({ x, y, dx, owner });
}

function spawnExplosion(x, y) {
    const stage = document.getElementById('game-stage');
    const exp = document.createElement('div');
    exp.className = 'explosion';
    exp.style.left = x + 'px';
    exp.style.bottom = y + 'px';
    stage.appendChild(exp);
    setTimeout(() => exp.remove(), 300);

    if (window.audioManager) window.audioManager.play('hit_heavy', { volume: 0.8 });
}

function takeDamage(target, amt) {
    if (!GameState.battleActive) return;

    if (target === 'p1') {
        GameState.player.hp -= amt;
        if (GameState.player.hp <= 0) endGame(false);
    } else {
        GameState.enemy.hp -= amt;
        if (GameState.enemy.hp <= 0) endGame(true);
    }
}

function endGame(playerWon) {
    GameState.battleActive = false;
    // Explode loser
    const loser = playerWon ? GameState.enemy : GameState.player;
    spawnExplosion(loser.x, 20);

    if (window.audioManager) {
        window.audioManager.play('roar');
        window.audioManager.play('cheer');
    }

    setTimeout(() => {
        handleMatchEnd(playerWon);
    }, 1500);
}

// --- STANDARD UTILS ---

function handleMatchEnd(championWon) {
    const t = GameState.tournament;
    const match = t.currentRound[t.currentMatchIndex];
    if (!match) return;
    match.status = 'completed';
    match.winner = championWon ? match.p1 : match.p2;
    showMatchWinnerModal(match.winner, championWon); // Pass if player won
}

function showMatchWinnerModal(winner, playerWon) {
    const modal = document.getElementById('result-modal');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const btn = document.getElementById('btn-rematch');

    // SFX
    if (window.audioManager) {
        if (playerWon) window.audioManager.play('cheer');
        else window.audioManager.play('roar');
    }

    title.textContent = playerWon ? 'VICTORY! 🏆' : 'DEFEATED... 💀';
    let img = document.getElementById('winner-reveal-img');
    if (!img) {
        img = document.createElement('img');
        img.id = 'winner-reveal-img';
        img.className = 'winner-reveal-img';
        document.querySelector('.modal-content').insertBefore(img, title.nextSibling);
    }
    img.src = winner.image;

    message.innerHTML = `
        <div style="font-size:1.8rem; color:${playerWon ? '#facc15' : '#ff4444'}; margin:10px 0;">${winner.name}</div>
        ${playerWon ? 'ADVANCES TO NEXT ROUND!' : 'ELIMINATED!'}
    `;

    // Hide button for auto flow
    if (playerWon) {
        if (btn) btn.style.display = 'none';
        modal.classList.add('active');

        // AUTO ADVANCE
        setTimeout(() => {
            modal.classList.remove('active');
            GameState.tournament.currentMatchIndex++;
            advanceLogic();
        }, 2000);
    } else {
        // GAME OVER - Manual Restart
        if (btn) {
            btn.style.display = 'block';
            btn.textContent = "TRY AGAIN 🔄";
            // Check listener stacking - use onclick
            btn.onclick = () => {
                modal.classList.remove('active');
                startCurrentMatch();
            };
        }
        modal.classList.add('active');
    }
}

function advanceLogic() {
    const t = GameState.tournament;

    // Check if current round is complete?
    // currentMatchIndex might be out of bounds if round ended
    if (t.currentMatchIndex >= t.currentRound.length) {
        // Round Complete
        if (t.currentRound.length === 1) {
            showTournamentWinner();
        } else {
            advanceToNextRound();
        }
    } else {
        // Next Match in same round
        // Show bracket briefly then auto start
        showScreen('tournament-screen');
        updateBracketUI();
        setTimeout(() => startCurrentMatch(), 1500);
    }
}

function advanceToNextRound() {
    const t = GameState.tournament;
    const winners = t.currentRound.map(m => m.winner);
    t.roundIndex++;
    generateUnknownRound(winners);

    // Show Bracket logic
    showScreen('tournament-screen');
    updateBracketUI();

    // Auto start first match of new round
    setTimeout(() => startCurrentMatch(), 2000);
}

function showTournamentWinner() {
    const winner = GameState.tournament.currentRound[0].winner;
    const modal = document.getElementById('result-modal');
    modal.classList.add('active');

    if (window.audioManager) {
        window.audioManager.stopBGM();
        window.audioManager.play('win');
    }

    document.getElementById('result-title').textContent = "UNIVERSE CHAMPION 👑";
    document.getElementById('result-message').innerHTML = `
        <div style="font-size:2rem; color:#facc15;">${winner.name}<br>THE ULTIMATE VICTOR!</div>
    `;

    const btn = document.getElementById('btn-rematch');
    if (btn) {
        btn.style.display = 'block';
        btn.textContent = "🏆 START NEW CUP";
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            initTournament();
        });
    }
}
