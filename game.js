// ANIMAL KING TOURNAMENT - GAME ENGINE
// Version: Space Battlefire Edition

const GameState = {
    currentScreen: 'main-menu',
    champion: null,
    challenger: null,
    championCurrentHP: 0,
    challengerCurrentHP: 0,
    isChampionTurn: true,
    battleInProgress: false,
    qteTimer: null,
    defenderMultiplier: 1.0,

    tournament: {
        fighters: [],
        currentRound: [],
        roundIndex: 0,
        currentMatchIndex: 0
    }
};

const ROUND_NAMES = ["ROUND OF 16", "QUARTER FINALS", "SEMI FINALS", "GRAND FINAL"];

document.addEventListener('DOMContentLoaded', () => {
    // Inject Styles, including new space theme
    ['tournament.css', 'space.css'].forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    });

    // Global Anim Styles
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes flash { 0% { opacity: 0.8; } 100% { opacity: 0; } }
        .flash-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: white; pointer-events: none; z-index: 9999;
            animation: flash 0.5s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    initParticles();
    initEventListeners();
    renderCollectionGrid();

    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (window.audioManager) {
                const isMuted = window.audioManager.toggleMute();
                muteBtn.textContent = isMuted ? '🔇' : '🔊';
            }
        });
    }

    const title = document.querySelector('#main-menu h1');
    if (title) title.textContent = "ANIMAL KING SPACE CUP";
    const sub = document.querySelector('#main-menu .subtitle');
    if (sub) sub.textContent = "Interactive Hyper-Battles in Zero-G.";
    const btn = document.getElementById('btn-start');
    if (btn) btn.innerHTML = "🚀 LAUNCH ARENA 🔊";

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
                <button id="btn-next-match" class="next-match-btn">ENGAGE ⚔️</button>
            </div>
        `;
        document.getElementById('app').appendChild(ts);
        document.getElementById('btn-next-match').addEventListener('click', startCurrentMatch);
    }
});

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    particlesContainer.innerHTML = '';
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 3 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = '#fff';
        particle.style.opacity = Math.random() * 0.9;
        particle.style.animationDuration = (30 + Math.random() * 30) + 's';
        particlesContainer.appendChild(particle);
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
    attach('btn-collection', () => showScreen('collection-screen'));
    attach('btn-back-collection', () => showScreen('main-menu'));
    attach('btn-menu', () => {
        hideModal();
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

// --- TOURNAMENT CORE ---

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
            p1: participants[i], p2: participants[i + 1],
            winner: null, status: 'pending'
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

// --- BATTLE ---

function startCurrentMatch() {
    const t = GameState.tournament;
    if (t.currentMatchIndex >= t.currentRound.length) return;
    const match = t.currentRound[t.currentMatchIndex];
    if (match.status === 'completed') return;

    if (window.audioManager) window.audioManager.play('start');

    GameState.champion = JSON.parse(JSON.stringify(match.p1));
    GameState.challenger = JSON.parse(JSON.stringify(match.p2));
    GameState.championCurrentHP = 100;
    GameState.challengerCurrentHP = 100;
    GameState.isChampionTurn = Math.random() < 0.5;
    GameState.battleInProgress = true;

    showScreen('battle-screen');
    initBattleUI();
    addBattleLog(`--- MATCH ${t.currentMatchIndex + 1} ---`, 'log-info');
    setTimeout(startInteractiveTurn, 1500);
}

function advanceToNextRound() {
    const t = GameState.tournament;
    const winners = t.currentRound.map(m => m.winner);
    t.roundIndex++;
    generateUnknownRound(winners);
    updateBracketUI();
    if (window.audioManager) window.audioManager.play('cheer');
}

// --- QTE INTERACTION ---

function initBattleUI() {
    const setInfo = (prefix, fighter) => {
        const img = document.getElementById(`${prefix}-img`);
        const name = document.getElementById(`${prefix}-name`);
        if (img) img.src = fighter.image;
        if (name) name.textContent = fighter.name;
    };
    setInfo('player', GameState.champion);
    setInfo('enemy', GameState.challenger);
    updateHP('champion');
    updateHP('challenger');

    const container = document.getElementById('action-buttons');
    if (container) container.innerHTML = `<div id="qte-overlay"></div>`;
    const log = document.getElementById('battle-log');
    if (log) log.innerHTML = '';
}

function startInteractiveTurn() {
    if (!GameState.battleInProgress) return;
    clearQTE();

    if (GameState.isChampionTurn) {
        promptQTE('attack', 2000, () => {
            if (window.audioManager) window.audioManager.play('ui_click');
            executeTurn('champion', 1.0);
        }, () => {
            addBattleLog(`${GameState.champion.name} missed!`, 'log-crit');
            GameState.isChampionTurn = !GameState.isChampionTurn;
            setTimeout(startInteractiveTurn, 1500);
        });
    } else {
        promptQTE('defend', 1500, () => {
            if (window.audioManager) window.audioManager.play('ui_click');
            addBattleLog(`Blocked! Reduced damage!`, 'log-heal');
            executeTurn('challenger', 0.5);
        }, () => {
            executeTurn('challenger', 1.0);
        });
    }
}

function promptQTE(type, duration, onSuccess, onFail) {
    const overlay = document.getElementById('qte-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
        <button id="qte-btn" class="qte-btn btn-${type}">
            ${type === 'attack' ? '🔥 FIREBALL!' : '🛡️ DEFEND!'}
        </button>
        <div class="timer-bar">
            <div id="qte-timer" class="timer-fill" style="transition: width ${duration}ms linear; width: 100%;"></div>
        </div>
    `;
    requestAnimationFrame(() => {
        const timer = document.getElementById('qte-timer');
        if (timer) timer.style.width = '0%';
    });

    let resolved = false;
    const resolve = (success) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(GameState.qteTimer);
        overlay.innerHTML = '';
        if (success) onSuccess(); else onFail();
    };

    document.getElementById('qte-btn').onclick = () => resolve(true);
    GameState.qteTimer = setTimeout(() => resolve(false), duration);
}

function clearQTE() {
    const overlay = document.getElementById('qte-overlay');
    if (overlay) overlay.innerHTML = '';
    if (GameState.qteTimer) clearTimeout(GameState.qteTimer);
}

// --- PROJECTILE & DAMAGE ---

function executeTurn(attackerSide, damageMultiplier = 1.0) {
    const attacker = attackerSide === 'champion' ? GameState.champion : GameState.challenger;
    const defender = attackerSide === 'champion' ? GameState.challenger : GameState.champion;
    const defenderSide = attackerSide === 'champion' ? 'challenger' : 'champion';

    const skills = attacker.skills || [];
    let selectedSkill = skills.length > 0 ? skills[0] : { name: "Fireball", damage: 20 };

    addBattleLog(`${attacker.name} charges ${selectedSkill.name}...`, 'log-info');

    // AUDIO: Charge/Shoot
    if (window.audioManager) window.audioManager.play('hit_fast', { volume: 0.8 });

    // 1. SHOOT PROJECTILE (Animation)
    shootProjectile(attackerSide, defenderSide, () => {
        // Callback when projectile hits (approx 500ms later)
        if (!GameState.battleInProgress) return;

        // DAMAGE CALC
        const baseDamage = parseFloat(selectedSkill.damage || 20) + parseFloat(attacker.stats.attack || 20);
        const typeMultiplier = getTypeMultiplier(attacker.type, defender.type);
        const defense = parseFloat(defender.stats.defense || 10);
        let rawDamage = ((baseDamage * typeMultiplier) - (defense * 0.35)) * ((Math.random() * 0.4) + 0.8);
        let finalDamage = Math.max(5, Math.floor(rawDamage * damageMultiplier));

        let isCrit = false;
        if (Math.random() < 0.15 && damageMultiplier > 0.6) {
            finalDamage = Math.floor(finalDamage * 1.5);
            isCrit = true;
        }

        // LETHAL CHECK
        const currentDefHP = defenderSide === 'challenger' ? GameState.challengerCurrentHP : GameState.championCurrentHP;
        const isLethal = finalDamage >= currentDefHP;

        // AUDIO & VFX
        if (window.audioManager) {
            if (isLethal) {
                window.audioManager.play('roar');
                window.audioManager.play('hit_heavy', { volume: 1.5 });
            } else {
                window.audioManager.play('hit_heavy', { volume: 1.0 });
            }
        }

        if (isLethal) {
            shakeScreen(true);
            const flash = document.createElement('div');
            flash.className = 'flash-overlay';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 600);
        } else {
            shakeScreen(false);
        }

        playSkillVFX(selectedSkill.type || 'normal', defenderSide);

        if (defenderSide === 'challenger') {
            GameState.challengerCurrentHP = Math.max(0, GameState.challengerCurrentHP - finalDamage);
        } else {
            GameState.championCurrentHP = Math.max(0, GameState.championCurrentHP - finalDamage);
        }
        updateHP(defenderSide);
        showFloatingDamage(finalDamage, defenderSide, isCrit || isLethal);

        let dmgMsg = `>> ${finalDamage} damage!`;
        if (isLethal) dmgMsg += ' FATAL!';
        addBattleLog(dmgMsg, attackerSide === 'champion' ? 'log-damage' : 'log-damage-enemy');

        if (isLethal) {
            GameState.battleInProgress = false;
            setTimeout(() => handleMatchEnd(GameState.championCurrentHP > 0), 1000);
        } else {
            GameState.isChampionTurn = !GameState.isChampionTurn;
            setTimeout(startInteractiveTurn, 1000);
        }
    });
}

function shootProjectile(attackerSide, defenderSide, onHit) {
    const app = document.getElementById('app');
    const ball = document.createElement('div');
    ball.className = attackerSide === 'champion' ? 'projectile' : 'projectile enemy-projectile';

    // Get Coordinates
    const attImg = document.getElementById(attackerSide === 'champion' ? 'player-img' : 'enemy-img');
    const defImg = document.getElementById(attackerSide === 'champion' ? 'enemy-img' : 'player-img');

    if (!attImg || !defImg) { onHit(); return; } // Safety

    const startRect = attImg.getBoundingClientRect();
    const endRect = defImg.getBoundingClientRect();
    const containerRect = document.querySelector('.battle-arena').getBoundingClientRect(); // Usually absolute

    // Position relative to screen since projectile is fixed
    ball.style.left = (startRect.left + startRect.width / 2 - 20) + 'px';
    ball.style.top = (startRect.top + startRect.height / 2 - 20) + 'px';

    document.body.appendChild(ball);

    // Animate
    const deltaX = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
    const deltaY = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);

    const anim = ball.animate([
        { transform: 'translate(0,0) scale(0.5)' },
        { transform: `translate(${deltaX}px, ${deltaY}px) scale(1.5)` }
    ], {
        duration: 500,
        easing: 'ease-in'
    });

    anim.onfinish = () => {
        ball.remove();
        onHit();
    };
}

// ... STANDARD UTILS ...
function handleMatchEnd(championWon) {
    const t = GameState.tournament;
    const match = t.currentRound[t.currentMatchIndex];
    if (!match) return;
    match.status = 'completed';
    match.winner = championWon ? match.p1 : match.p2;
    if (window.audioManager) window.audioManager.play('cheer');
    setTimeout(() => showMatchWinnerModal(match.winner), 1500);
}

function showMatchWinnerModal(winner) {
    const modal = document.getElementById('result-modal');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const btn = document.getElementById('btn-rematch');

    title.textContent = 'MATCH WINNER 🏅';
    let img = document.getElementById('winner-reveal-img');
    if (!img) {
        img = document.createElement('img');
        img.id = 'winner-reveal-img';
        img.className = 'winner-reveal-img';
        document.querySelector('.modal-content').insertBefore(img, title.nextSibling);
    }
    img.src = winner.image;

    message.innerHTML = `<div style="font-size:1.8rem; color:#facc15; margin:10px 0;">${winner.name}</div>`;

    if (btn) {
        btn.style.display = 'block';
        btn.textContent = "CONTINUE ➡️";
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            document.getElementById('result-modal').classList.remove('active');
            GameState.tournament.currentMatchIndex++;
            showScreen('tournament-screen');
            updateBracketUI();
        });
    }
    modal.classList.add('active');
}

function showTournamentWinner() {
    const winner = GameState.tournament.currentRound[0].winner;
    const modal = document.getElementById('result-modal');
    const message = document.getElementById('result-message');
    const btn = document.getElementById('btn-rematch');
    if (window.audioManager) {
        window.audioManager.stopBGM();
        window.audioManager.play('win');
    }
    message.innerHTML = `<div style="font-size:2rem; color:#facc15;">${winner.name}<br>CONQUERED THE GALAXY!</div>`;
    btn.textContent = "🏆 NEW GAME";
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        initTournament();
    });
    modal.classList.add('active');
}

function hideModal() { document.getElementById('result-modal').classList.remove('active'); }
function shakeScreen(isIntense) {
    const app = document.getElementById('app');
    if (!app) return;
    app.classList.remove('screen-shake');
    void app.offsetHeight;
    app.classList.add('screen-shake');
    app.style.animationDuration = isIntense ? '0.8s' : '0.4s';
    setTimeout(() => app.classList.remove('screen-shake'), 800);
}
function playSkillVFX(type, side) {/* Same as before */ }
function showFloatingDamage(amt, side, crit) {/* Same as before, just add to container */ }
// (For brevity, assuming existing HTML structure for fx-container)
function updateHP(side) {
    const currentHP = side === 'champion' ? GameState.championCurrentHP : GameState.challengerCurrentHP;
    const maxHP = 100;
    const percentage = Math.max(0, (currentHP / maxHP) * 100);
    const prefix = side === 'champion' ? 'player' : 'enemy';
    const hpBar = document.getElementById(`${prefix}-hp-bar`);
    if (hpBar) {
        hpBar.querySelector('.hp-fill').style.width = percentage + '%';
        hpBar.querySelector('.hp-text').textContent = `${Math.floor(currentHP)}/${maxHP}`;
    }
}
function addBattleLog(msg, cls) {
    const log = document.getElementById('battle-log');
    if (log) {
        const p = document.createElement('p');
        p.className = `log-entry ${cls || ''}`;
        p.textContent = msg;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
    }
}
function renderCollectionGrid() { /* ... */ }
function getTypeMultiplier(at, dt) { return 1; } // Simplified for now
