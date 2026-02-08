// ANIMAL KING TOURNAMENT - GAME ENGINE
// Version: Ultimate Edition (Lethal Hits + Winner Modal)

// Game State Management
const GameState = {
    currentScreen: 'main-menu',
    champion: null,
    challenger: null,
    championCurrentHP: 0,
    challengerCurrentHP: 0,
    isChampionTurn: true,
    battleInProgress: false,
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
    // Inject Tournament CSS if missing
    if (!document.querySelector('link[href="tournament.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'tournament.css';
        document.head.appendChild(link);
    }

    // Inject Global Styles for Flash Effect
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

    // Mute Button Logic
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (window.audioManager) {
                const isMuted = window.audioManager.toggleMute();
                muteBtn.textContent = isMuted ? '🔇' : '🔊';
            }
        });
    }

    // Update Menu Text
    const title = document.querySelector('#main-menu h1');
    if (title) title.textContent = "ANIMAL KING WORLD CUP";
    const sub = document.querySelector('#main-menu .subtitle');
    if (sub) sub.textContent = "16 Elite Beasts. Full Audio Experience.";
    const btn = document.getElementById('btn-start');
    if (btn) btn.innerHTML = "🏆 BEGIN TOURNAMENT 🔊";

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

    attach('btn-start', () => {
        if (window.audioManager) window.audioManager.init();
        initTournament();
    });

    attach('btn-collection', () => showScreen('collection-screen'));
    attach('btn-howto', () => showScreen('howto-screen'));
    attach('btn-back-collection', () => showScreen('main-menu'));
    attach('btn-back-howto', () => showScreen('main-menu'));

    attach('btn-menu', () => {
        document.getElementById('result-modal').classList.remove('active');
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
    // AUDIO: Play Start Sound & BGM
    if (window.audioManager) {
        window.audioManager.play('start');
        window.audioManager.playBGM('bgm');
    }

    let pool = [...DIGIMON_DATABASE];
    pool.sort(() => Math.random() - 0.5);

    if (pool.length < 16) {
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

    if (window.audioManager) window.audioManager.play('start');

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
    if (window.audioManager) window.audioManager.play('cheer');
}


// --- MODAL & BATTLE LOGIC ---

function handleMatchEnd(championWon) {
    const t = GameState.tournament;
    const match = t.currentRound[t.currentMatchIndex];
    if (!match) return;

    match.status = 'completed';
    match.winner = championWon ? match.p1 : match.p2;

    if (window.audioManager) window.audioManager.play('cheer');

    addBattleLog(`🏆 Winner: ${match.winner.name}!`, 'log-heal');

    setTimeout(() => {
        showMatchWinnerModal(match.winner);
    }, 1500); // Slightly longer delay to let the lethal effect settle
}

function showMatchWinnerModal(winner) {
    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const btn = document.getElementById('btn-rematch');

    if (icon) icon.textContent = '🏅';
    if (title) title.textContent = 'MATCH WINNER';

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
        <div style="font-size:1.8rem; color:#facc15; margin:10px 0;">${winner.name}</div>
        ADVANCES TO THE NEXT ROUND!
    `;

    if (btn) {
        btn.textContent = "CONTINUE TO BRACKET ➡️";
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            document.getElementById('result-modal').classList.remove('active');
            GameState.tournament.currentMatchIndex++;
            showScreen('tournament-screen');
            updateBracketUI();
        });
    }

    if (modal) modal.classList.add('active');
}

function showTournamentWinner() {
    const winner = GameState.tournament.currentRound[0].winner;
    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const btn = document.getElementById('btn-rematch');

    if (window.audioManager) {
        window.audioManager.stopBGM();
        window.audioManager.play('win');
    }

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
        HAS CONQUERED THE ANIMAL WORLD CUP!
    `;

    if (btn) {
        btn.textContent = "🏆 START NEW CUP";
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            document.getElementById('result-modal').classList.remove('active');
            initTournament();
        });
    }

    if (modal) modal.classList.add('active');
}

// --- BATTLE EXECUTION ---

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

    addBattleLog(`${attacker.name} uses ${selectedSkill.name}!`, 'log-info');

    if (window.audioManager) window.audioManager.play('hit_fast', { volume: 0.5 });

    const imgId = attackerSide === 'champion' ? 'player-img' : 'enemy-img';
    const attackerImg = document.getElementById(imgId);
    if (attackerImg) {
        attackerImg.classList.add(attackerSide === 'champion' ? 'attack-lunge' : 'enemy-lunge');
        setTimeout(() => attackerImg.classList.remove(attackerSide === 'champion' ? 'attack-lunge' : 'enemy-lunge'), 300);
    }

    setTimeout(() => {
        if (!GameState.battleInProgress) return;

        // LETHAL CHECK
        const currentDefHP = defenderSide === 'challenger' ? GameState.challengerCurrentHP : GameState.championCurrentHP;
        const isLethal = finalDamage >= currentDefHP;

        // VISUALS & SOUNDS
        if (window.audioManager) {
            if (isLethal) {
                // FATALITY SFX
                window.audioManager.play('roar');
                window.audioManager.play('hit_heavy', { volume: 1.5 });
            } else if (isCrit || finalDamage > 30) {
                window.audioManager.play('hit_heavy', { volume: 1.0 });
            } else {
                window.audioManager.play('hit_heavy', { volume: 0.6 });
            }
        }

        if (isLethal) {
            shakeScreen(true); // Intense shake
            const flash = document.createElement('div');
            flash.className = 'flash-overlay';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 600);
        } else if (finalDamage > 25 || isCrit) {
            shakeScreen(false);
        }

        playSkillVFX(selectedSkill.type || 'normal', defenderSide);

        if (defenderSide === 'challenger') {
            GameState.challengerCurrentHP = Math.max(0, GameState.challengerCurrentHP - finalDamage);
        } else {
            GameState.championCurrentHP = Math.max(0, GameState.championCurrentHP - finalDamage);
        }
        updateHP(defenderSide);

        showFloatingDamage(finalDamage, defenderSide, isCrit || isLethal); // Lethal is red logic usually

        let dmgMsg = `>> ${finalDamage} damage!`;
        if (isLethal) dmgMsg += ' FATAL BLOW!!!';
        else if (isCrit) dmgMsg += ' CRITICAL!';
        else if (typeMultiplier > 1.2) dmgMsg += ' SUPER EFFECTIVE!';
        addBattleLog(dmgMsg, attackerSide === 'champion' ? 'log-damage' : 'log-damage-enemy');

        if (isLethal) {
            // Dramatic pause before end
            GameState.battleInProgress = false;
            setTimeout(() => {
                handleMatchEnd(GameState.championCurrentHP > 0);
            }, 1000);
        } else {
            checkBattleEnd();
        }

    }, 300);
}

function checkBattleEnd() {
    if (GameState.championCurrentHP <= 0 || GameState.challengerCurrentHP <= 0) {
        const championWon = GameState.championCurrentHP > 0;
        GameState.battleInProgress = false;
        handleMatchEnd(championWon);
    } else {
        GameState.isChampionTurn = !GameState.isChampionTurn;
        setTimeout(nextTurn, 1000);
    }
}

function shakeScreen(isIntense = false) {
    const app = document.getElementById('app');
    if (!app) return;

    // Reset animation hack
    app.classList.remove('screen-shake');
    void app.offsetHeight;
    app.classList.add('screen-shake');

    if (isIntense) {
        app.style.animationDuration = '0.8s';
    } else {
        app.style.animationDuration = '0.4s';
    }

    setTimeout(() => {
        app.classList.remove('screen-shake');
        app.style.animationDuration = '';
    }, isIntense ? 800 : 400);
}

// ... STANDARD UTILS (playSkillVFX, showFloatingDamage, updateHP, addBattleLog, renderCollectionGrid, getTypeMultiplier) ...
// (Re-including them here to be complete and avoid cutting off the file)

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
    el.style.fontSize = isCrit ? '2.5rem' : '1.5rem';
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
