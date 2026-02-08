// ANIMAL KING TOURNAMENT - GAME ENGINE
// Version: Stable World Cup Bracket

// Game State Management
const GameState = {
    currentScreen: 'main-menu',

    // Battle specific vars
    champion: null,      // Left Side (Player)
    challenger: null,    // Right Side (Enemy)
    championCurrentHP: 0,
    challengerCurrentHP: 0,
    isChampionTurn: true,
    battleInProgress: false,

    // Tournament Management
    tournament: {
        fighters: [],
        currentRound: [],
        roundIndex: 0,
        currentMatchIndex: 0
    }
};

const ROUND_NAMES = ["ROUND OF 16", "QUARTER FINALS", "SEMI FINALS", "GRAND FINAL"];

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    // Inject Tournament CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'tournament.css';
    document.head.appendChild(link);

    initParticles();
    initEventListeners();
    renderCollectionGrid();

    // Update Menu Text
    const title = document.querySelector('#main-menu h1');
    if (title) title.textContent = "ANIMAL KING WORLD CUP";
    const sub = document.querySelector('#main-menu .subtitle');
    if (sub) sub.textContent = "16 Elite Beasts. Single Elimination.";
    const btn = document.getElementById('btn-start');
    if (btn) btn.innerHTML = "🏆 BEGIN TOURNAMENT";

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
            <div id="match-grid" class="match-grid">
                <!-- Matches Render Here -->
            </div>
            <div class="tournament-controls">
                <button id="btn-next-match" class="next-match-btn">START NEXT MATCH ⚔️</button>
            </div>
        `;
        document.getElementById('app').appendChild(ts);
        document.getElementById('btn-next-match').addEventListener('click', startCurrentMatch);
    }
});

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

function initEventListeners() {
    const attach = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    };

    attach('btn-start', initTournament);
    attach('btn-collection', () => showScreen('collection-screen'));
    attach('btn-howto', () => showScreen('howto-screen'));
    attach('btn-back-collection', () => showScreen('main-menu'));
    attach('btn-back-howto', () => showScreen('main-menu'));

    attach('btn-rematch', () => {
        hideModal();
        initTournament();
    });
    attach('btn-menu', () => {
        hideModal();
        showScreen('main-menu');
    });

    const dexClose = document.getElementById('dex-close');
    if (dexClose) dexClose.addEventListener('click', () => {
        document.getElementById('dex-detail').classList.remove('active');
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
        else if (screenId === 'main-menu') target.style.display = 'block';
        else target.style.display = 'block';
    }
    GameState.currentScreen = screenId;
}

// --- TOURNAMENT ENGINE ---

function initTournament() {
    let pool = [...DIGIMON_DATABASE];
    pool.sort(() => Math.random() - 0.5);

    // Ensure we have at least 16
    if (pool.length < 16) {
        // Duplicate if not enough (unlikely with 50+)
        while (pool.length < 16) pool = pool.concat(pool);
    }

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
            p1: participants[i],
            p2: participants[i + 1],
            winner: null,
            status: 'pending'
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
    if (subtitle) subtitle.textContent = pending === 0 ? "Round Complete! Proceeding..." : `${pending} Matches Remaining`;

    t.currentRound.forEach((match, index) => {
        const card = document.createElement('div');
        let cardClass = 'match-card';
        if (match.status === 'completed') cardClass += ' completed';
        else if (index === t.currentMatchIndex && pending > 0) cardClass += ' current';
        else cardClass += ' upcoming';

        card.className = cardClass;

        const p1HTML = renderMiniFighter(match.p1, match.winner === match.p1, match.winner && match.winner !== match.p1);
        const p2HTML = match.p2 ? renderMiniFighter(match.p2, match.winner === match.p2, match.winner && match.winner !== match.p2) : `<div class="fighter-mini">BYE</div>`;

        card.innerHTML = `
            <div class="match-id">M${index + 1}</div>
            ${p1HTML}
            <div class="vs-badge">VS</div>
            ${p2HTML}
        `;
        grid.appendChild(card);
    });

    const btn = document.getElementById('btn-next-match');
    if (btn) {
        // Clone node to clear listeners
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

function renderMiniFighter(fighter, isWinner, isLoser) {
    let classes = 'fighter-mini';
    if (isWinner) classes += ' winner';
    if (isLoser) classes += ' loser';
    return `
        <div class="${classes}">
            <img src="${fighter.image}" onerror="this.src='https://via.placeholder.com/60'">
            <div class="name">${fighter.name}</div>
        </div>
    `;
}

// --- MATCH FLOW ---

function startCurrentMatch() {
    const t = GameState.tournament;
    if (t.currentMatchIndex >= t.currentRound.length) return;

    const match = t.currentRound[t.currentMatchIndex];
    if (match.status === 'completed') return;

    GameState.champion = JSON.parse(JSON.stringify(match.p1));
    GameState.challenger = JSON.parse(JSON.stringify(match.p2));
    GameState.championCurrentHP = 100;
    GameState.challengerCurrentHP = 100;
    GameState.isChampionTurn = Math.random() < 0.5;
    GameState.battleInProgress = true;

    showScreen('battle-screen');
    initBattleUI();

    addBattleLog(`--- ${ROUND_NAMES[t.roundIndex]} : MATCH ${t.currentMatchIndex + 1} ---`, 'log-info');
    addBattleLog(`${GameState.champion.name} VS ${GameState.challenger.name}`, 'log-skill');

    setTimeout(nextTurn, 1000);
}

function advanceToNextRound() {
    const t = GameState.tournament;
    const winners = t.currentRound.map(m => m.winner);
    t.roundIndex++;
    generateUnknownRound(winners);
    updateBracketUI();
}

function showTournamentWinner() {
    const winner = GameState.tournament.currentRound[0].winner;
    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const btn = document.getElementById('btn-rematch');

    if (icon) icon.textContent = '👑';
    if (title) title.textContent = 'WORLD CHAMPION';

    let img = document.getElementById('winner-reveal-img');
    if (!img) {
        img = document.createElement('img');
        img.id = 'winner-reveal-img';
        img.className = 'winner-reveal-img';
        const content = document.querySelector('.modal-content');
        if (content) content.insertBefore(img, title.nextSibling);
    }
    img.src = winner.image;

    if (message) message.innerHTML = `
        <div style="font-size:2rem; color:#facc15; margin:10px 0;">${winner.name}</div>
        has conquered the Animal World Cup!
    `;
    if (btn) btn.textContent = "Start New Cup";

    if (modal) modal.classList.add('active');
}


// --- ROBUST BATTLE ENGINE ---

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

    const pMp = document.getElementById('player-mp-bar');
    const eMp = document.getElementById('enemy-mp-bar');
    if (pMp) pMp.style.display = 'none';
    if (eMp) eMp.style.display = 'none';

    document.querySelector('.player-card').classList.remove('low-hp', 'hit-shake');
    document.querySelector('.enemy-card').classList.remove('low-hp', 'hit-shake');

    const container = document.getElementById('action-buttons');
    if (container) {
        container.innerHTML = `
            <div style="width:100%; text-align:center; padding:15px; background:rgba(0,0,0,0.6); border-radius:15px; border:1px solid #fff;">
                <div style="font-size:1.2rem; color:#fff; font-family:'Orbitron'; animation: pulse 1s infinite;">⚔️ FIGHTING... ⚔️</div>
            </div>
        `;
    }
    const log = document.getElementById('battle-log');
    if (log) log.innerHTML = '';
}

function nextTurn() {
    if (!GameState.battleInProgress) return;

    try {
        if (GameState.isChampionTurn) {
            executeTurn('champion');
        } else {
            executeTurn('challenger');
        }
    } catch (e) {
        console.error("Battle Error:", e);
        // Force continue to avoid stuck game
        GameState.isChampionTurn = !GameState.isChampionTurn;
        setTimeout(nextTurn, 1000);
    }
}

function executeTurn(attackerSide) {
    const attacker = attackerSide === 'champion' ? GameState.champion : GameState.challenger;
    const defender = attackerSide === 'champion' ? GameState.challenger : GameState.champion;
    const defenderSide = attackerSide === 'champion' ? 'challenger' : 'champion';

    const skills = attacker.skills || [];
    let selectedSkill = skills.length > 0 ? skills[0] : { name: "Attack", damage: 20, type: "normal" };

    const rand = Math.random();
    if (skills.length >= 3) {
        if (rand < 0.5) selectedSkill = skills[0];
        else if (rand < 0.85) selectedSkill = skills[1];
        else selectedSkill = skills[2];
    }

    const baseDamage = parseFloat(selectedSkill.damage || 20) + parseFloat(attacker.stats.attack || 20);
    const typeMultiplier = getTypeMultiplier(attacker.type, defender.type);
    const defense = parseFloat(defender.stats.defense || 10);
    const variance = (Math.random() * 0.4) + 0.8;

    let rawDamage = ((baseDamage * typeMultiplier) - (defense * 0.35)) * variance;
    let finalDamage = Math.max(5, Math.floor(rawDamage));

    let isCrit = false;
    if (Math.random() < 0.15) {
        finalDamage = Math.floor(finalDamage * 1.5);
        isCrit = true;
    }

    // 1. Log Attack
    addBattleLog(`${attacker.name} uses ${selectedSkill.name}!`, 'log-info');

    // 2. Animation (Lunge)
    const imgId = attackerSide === 'champion' ? 'player-img' : 'enemy-img';
    const attackerImg = document.getElementById(imgId);
    if (attackerImg) {
        attackerImg.classList.add(attackerSide === 'champion' ? 'attack-lunge' : 'enemy-lunge');
        setTimeout(() => attackerImg.classList.remove(attackerSide === 'champion' ? 'attack-lunge' : 'enemy-lunge'), 300);
    }

    // 3. Impact & Damage (Delayed)
    setTimeout(() => {
        if (!GameState.battleInProgress) return; // Double check

        // Visuals
        if (finalDamage > 25 || isCrit) shakeScreen();
        playSkillVFX(selectedSkill.type || 'normal', defenderSide);

        // Apply HP
        if (defenderSide === 'challenger') {
            GameState.challengerCurrentHP = Math.max(0, GameState.challengerCurrentHP - finalDamage);
        } else {
            GameState.championCurrentHP = Math.max(0, GameState.championCurrentHP - finalDamage);
        }
        updateHP(defenderSide);

        // Hit Shake
        const defCardClass = defenderSide === 'champion' ? '.player-card' : '.enemy-card';
        const defCard = document.querySelector(defCardClass);
        if (defCard) {
            defCard.classList.add('hit-shake');
            setTimeout(() => defCard.classList.remove('hit-shake'), 400);
        }

        showFloatingDamage(finalDamage, defenderSide, isCrit);

        let dmgMsg = `>> ${finalDamage} damage!`;
        if (isCrit) dmgMsg += ' CRITICAL!';
        else if (typeMultiplier > 1.2) dmgMsg += ' SUPER EFFECTIVE!';
        addBattleLog(dmgMsg, attackerSide === 'champion' ? 'log-damage' : 'log-damage-enemy');

        checkBattleEnd();

    }, 300);
}

function checkBattleEnd() {
    if (GameState.championCurrentHP <= 0 || GameState.challengerCurrentHP <= 0) {
        const championWon = GameState.championCurrentHP > 0;
        GameState.battleInProgress = false;
        handleMatchEnd(championWon);
    } else {
        GameState.isChampionTurn = !GameState.isChampionTurn;
        // Schedule next turn safely
        setTimeout(nextTurn, 1000);
    }
}

function handleMatchEnd(championWon) {
    const t = GameState.tournament;
    const match = t.currentRound[t.currentMatchIndex];
    if (!match) return;

    match.status = 'completed';
    match.winner = championWon ? match.p1 : match.p2;

    addBattleLog(`🏆 Winner: ${match.winner.name}!`, 'log-heal');

    setTimeout(() => {
        t.currentMatchIndex++;
        showScreen('tournament-screen');
        updateBracketUI();
    }, 2000);
}

// --- HELPERS ---

function shakeScreen() {
    const app = document.getElementById('app');
    if (!app) return;
    app.classList.add('screen-shake');
    setTimeout(() => app.classList.remove('screen-shake'), 400);
}

function playSkillVFX(type, targetSide) {
    const container = document.getElementById('fx-container');
    if (!container) return;

    const vfx = document.createElement('div');
    const targetSelector = targetSide === 'champion' ? '.player-card' : '.enemy-card';
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    const arenaRect = document.querySelector('.battle-arena').getBoundingClientRect();

    vfx.style.left = (rect.left - arenaRect.left + (rect.width / 2)) + 'px';
    vfx.style.top = (rect.top - arenaRect.top + (rect.height / 2)) + 'px';
    vfx.style.transform = 'translate(-50%, -50%)';

    if (type === 'fire') vfx.className = 'vfx-fire';
    else if (type === 'water' || type === 'nature') vfx.className = 'vfx-ice';
    else if (type === 'dark') vfx.className = 'vfx-dark';
    else vfx.className = 'vfx-ice';

    container.appendChild(vfx);
    setTimeout(() => vfx.remove(), 1000);
}

function showFloatingDamage(amount, targetSide, isCrit) {
    const container = document.getElementById('fx-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = isCrit ? 'floating-damage floating-dmg-crit' : 'floating-damage';
    el.textContent = amount;

    const targetSelector = targetSide === 'champion' ? '.player-card' : '.enemy-card';
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    const arenaRect = document.querySelector('.battle-arena').getBoundingClientRect();
    const randomX = (Math.random() * 40) - 20;

    el.style.left = (rect.left - arenaRect.left + (rect.width / 2) + randomX) + 'px';
    el.style.top = (rect.top - arenaRect.top) + 'px';
    el.style.color = targetSide === 'champion' ? '#ff4444' : '#ffffff';
    el.style.zIndex = 50;

    container.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

function updateHP(side) {
    const currentHP = side === 'champion' ? GameState.championCurrentHP : GameState.challengerCurrentHP;
    const maxHP = 100;
    const percentage = Math.max(0, (currentHP / maxHP) * 100);

    const prefix = side === 'champion' ? 'player' : 'enemy';
    const hpBar = document.getElementById(`${prefix}-hp-bar`);
    if (hpBar) {
        const hpFill = hpBar.querySelector('.hp-fill');
        const hpText = hpBar.querySelector('.hp-text');
        if (hpFill) hpFill.style.width = percentage + '%';
        if (hpText) hpText.textContent = `${Math.floor(currentHP)}/${maxHP}`;
    }
}
function addBattleLog(message, className = '') {
    const log = document.getElementById('battle-log');
    if (!log) return;
    const entry = document.createElement('p');
    entry.className = `log-entry ${className}`;
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}
function hideModal() {
    const modal = document.getElementById('result-modal');
    if (modal) modal.classList.remove('active');
}
function renderCollectionGrid() {
    const grid = document.getElementById('collection-grid');
    if (!grid) return;
    grid.innerHTML = '';
    DIGIMON_DATABASE.forEach(digimon => {
        const card = document.createElement('div');
        card.className = 'collection-card';
        card.innerHTML = `
            <img src="${digimon.image}" alt="${digimon.name}" onerror="this.src='https://via.placeholder.com/80?text=${digimon.name}'">
            <h4>${digimon.name}</h4>
        `;
        grid.appendChild(card);
    });
}
function getTypeMultiplier(at, dt) {
    const eff = TYPE_EFFECTIVENESS[at];
    if (!eff) return 1;
    if (eff.strong.includes(dt)) return 1.5;
    if (eff.weak.includes(dt)) return 0.75;
    return 1;
}
