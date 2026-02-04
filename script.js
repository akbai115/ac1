import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, clusterApiUrl } from '@solana/web3.js';

// --- Wallet Identity ---
let userWalletAddress = null;
const phantomAdapter = new PhantomWalletAdapter();

function showPage(pageId) {
    console.log('Switching to page:', pageId);

    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });

    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
        window.scrollTo(0, 0);

        // If landing on dashboard, start initial logs
        if (pageId === 'dashboard') {
            const terminal = document.getElementById('main-terminal');
            if (terminal) {
                terminal.innerHTML = '';
                typeLog('main-terminal', 'RPC_GATEWAY_UP: Latency 14ms [127.0.0.1:4242]', 'scan', '📡');
                setTimeout(() => typeLog('main-terminal', 'SIG_VERIFY: Ed25519 Handshake complete. Engine v2.0.4 [OPTIMIZED]', 'learn', '⚙️'), 800);
                setTimeout(() => typeLog('main-terminal', 'MEMPOOL_LISTENER: Hooked pump.fun migration gateway.', 'scan', '🔍'), 1600);
                setTimeout(() => startLiveBlocks(), 500);
                setTimeout(() => startLiveFeed(), 3000);
            }
        }
    } else {
        console.error('Page not found:', pageId + '-page');
    }
}

// Modal Functions
function openWalletModal() {
    document.getElementById('wallet-modal').style.display = 'flex';
}

function closeWalletModal(event) {
    document.getElementById('wallet-modal').style.display = 'none';
}

async function connectPhantom() {
    const btn = document.querySelector('.wallet-btn');
    const originalText = btn.innerHTML;

    try {
        btn.innerHTML = `<span class="loading-dots">Initializing Real Adapter</span>`;
        btn.disabled = true;

        await phantomAdapter.connect();
        const publicKey = phantomAdapter.publicKey.toString();

        userWalletAddress = publicKey;
        console.log("Connected via Real Adapter:", publicKey);

        btn.innerHTML = `<span style="color: var(--neon-green)">✓ Handshake Complete</span>`;
        await new Promise(r => setTimeout(r, 600));

        closeWalletModal();
        showPage('connect');
        updateDashboardWalletDisplay();
    } catch (err) {
        console.error("Adapter connection failed:", err);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function updateDashboardWalletDisplay() {
    if (!userWalletAddress) return;
    const shortAddress = userWalletAddress.slice(0, 4) + "..." + userWalletAddress.slice(-4);

    const addressElements = document.querySelectorAll('.action-btn-sm');
    addressElements.forEach(el => {
        if (el.innerText.includes('...')) {
            el.innerText = shortAddress;
        }
    });
}

// Scroll Reveal Implementation
const observerOptions = {
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
});

function selectMode(element) {
    const cards = document.querySelectorAll('.mode-card');
    cards.forEach(card => card.classList.remove('active'));
    element.classList.add('active');
}

function setNetwork(network) {
    const devnetBtn = document.getElementById('devnet-toggle');
    const mainnetBtn = document.getElementById('mainnet-toggle');
    const testSolBtn = document.getElementById('btn-test-sol');

    if (network === 'devnet') {
        devnetBtn.classList.add('active');
        mainnetBtn.classList.remove('active');
        if (testSolBtn) testSolBtn.style.display = 'block';
    } else {
        mainnetBtn.classList.add('active');
        devnetBtn.classList.remove('active');
        if (testSolBtn) testSolBtn.style.display = 'none';
    }
}

function simulateConnect() {
    const btn = document.getElementById('connect-btn');
    const continueBtn = document.getElementById('continue-btn');
    const statusCard = document.getElementById('agent-status-card');

    btn.innerHTML = 'Connecting to Local Node<span class="loading-dots"></span>';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = 'Link Established';
        btn.style.background = '#0d1a0d';
        btn.style.color = 'var(--neon-green)';
        btn.style.border = '1px solid var(--neon-green)';

        if (statusCard) {
            statusCard.style.display = 'block';
        }

        continueBtn.disabled = false;
        continueBtn.classList.add('active');
    }, 2000);
}

async function simulateDeployment() {
    const btn = document.getElementById('deploy-btn');
    const steps = document.querySelectorAll('.step-item');

    btn.disabled = true;
    btn.innerHTML = 'Initializing Orchestrator<span class="loading-dots"></span>';

    for (const step of steps) {
        await new Promise(r => setTimeout(r, 800));
        step.classList.add('completed');
    }

    await new Promise(r => setTimeout(r, 1000));
    btn.innerHTML = 'System Online 🦞';
    btn.style.background = '#0d1a0d';
    btn.style.color = 'var(--neon-green)';
    btn.style.border = '1px solid var(--neon-green)';

    setTimeout(() => {
        showPage('dashboard');
        // Reset steps for next time
        steps.forEach(s => s.classList.remove('completed'));
        btn.disabled = false;
        btn.innerHTML = 'Deploy & Activate 🦞';
        btn.style = '';
    }, 2000);
}

// Demo Simulations
async function typeLog(elementId, text, type = 'scan', icon = '🔍') {
    const el = document.getElementById(elementId);
    if (!el) return;

    const row = document.createElement('div');
    row.className = `log-row ${type}`;

    const time = document.createElement('div');
    time.className = 'log-time';
    const now = new Date();
    time.innerText = now.toLocaleTimeString([], { hour12: false });

    const iconEl = document.createElement('div');
    iconEl.className = 'log-icon';
    iconEl.innerText = icon;

    const msg = document.createElement('div');
    msg.className = 'log-msg';

    row.appendChild(time);
    row.appendChild(iconEl);
    row.appendChild(msg);
    el.appendChild(row);

    // Typing effect for the message
    for (let i = 0; i < text.length; i++) {
        msg.innerText += text[i];
        await new Promise(r => setTimeout(r, 15));
    }

    // Auto-scroll terminal
    el.scrollTop = el.scrollHeight;
}

async function runSnipeDemo() {
    const logs = document.getElementById('snipe-logs');
    if (!logs) return;
    logs.innerHTML = '';

    await typeLog('snipe-logs', 'Booting sniping engine...', 'scan', '⚙️');
    await new Promise(r => setTimeout(r, 800));
    await typeLog('snipe-logs', 'Watching pump.fun bonding curve migrations...', 'scan', '📡');
    await new Promise(r => setTimeout(r, 1500));
    await typeLog('snipe-logs', 'MIGRATION DETECTED: $LOBSTER', 'trade', '🎯');
    await new Promise(r => setTimeout(r, 600));
    await typeLog('snipe-logs', 'Bought $LOBSTER for 0.5 SOL (slippage < 0.5%)', 'trade', '🚀');
    await new Promise(r => setTimeout(r, 1000));
    await typeLog('snipe-logs', 'Transaction Broadcast: Signature: 5WjM...v2e', 'learn', '📑');
}

async function runFarmDemo() {
    const logs = document.getElementById('farm-logs');
    if (!logs) return;
    logs.innerHTML = '';

    await typeLog('farm-logs', 'Yield monitoring active...', 'scan', '🌱');
    await new Promise(r => setTimeout(r, 1000));
    await typeLog('farm-logs', 'Scanning SOL/USDC pools for volatility spikes...', 'scan', '📊');
    await new Promise(r => setTimeout(r, 1500));
    await typeLog('farm-logs', 'PRICE DROP: SOL/USDC current price $98.40 (-4.2%)', 'block', '⚠️');
    await new Promise(r => setTimeout(r, 1000));
    await typeLog('farm-logs', 'Rebalancing: Swapping 10 SOL for USDC...', 'trade', '🔄');
    await typeLog('farm-logs', 'Liquidity Provision Active: Projected 42% APY', 'trade', '🌾');
}

async function runSwarmDemo() {
    const logs = document.getElementById('swarm-logs');
    if (!logs) return;
    const a1 = document.getElementById('agent-1');
    const a2 = document.getElementById('agent-2');
    const a3 = document.getElementById('agent-3');

    logs.innerHTML = '';

    if (a1) a1.classList.add('active');
    await typeLog('swarm-logs', 'Initializing multi-dex monitor...', 'scan', '🐝');
    await typeLog('swarm-logs', 'Monitor 1: Arbitrage gap detected on Raydium (1.2%)', 'scan', '📡');

    await new Promise(r => setTimeout(r, 1000));
    if (a2) a2.classList.add('active');
    await typeLog('swarm-logs', 'Monitor 2: Verifying pool depth & impact...', 'learn', '🧠');

    await new Promise(r => setTimeout(r, 1000));
    if (a3) a3.classList.add('active');
    await typeLog('swarm-logs', 'Monitor 3: Route optimization via Jupiter complete.', 'learn', '🛡️');

    await new Promise(r => setTimeout(r, 1500));
    await typeLog('swarm-logs', 'EXECUTION: Triangular arbitrage complete. Gain: +0.12 SOL.', 'trade', '💰');
}

// --- Live Activity Generator ---
const RANDOM_LOGS = [
    { text: "Sold 0.0809 $STRUMP for 0.1420 SOL (+0.0310 SOL, 2.94x)", type: "trade", icon: "💰" },
    { text: "Bought 0.0412 $STRUMP for 0.0500 SOL (+0.0000 SOL, 1.00x)", type: "trade", icon: "💎" },
    { text: "Sold 0.0550 $STRUMP for 0.1210 SOL (+0.0660 SOL, 2.20x)", type: "trade", icon: "💰" },
    { text: "Sold 0.0733 $STRUMP for 0.1832 SOL (+0.1099 SOL, 2.50x)", type: "trade", icon: "💰" },
    { text: "Bought 0.0977 $CLAW for 0.1200 SOL (+0.0000 SOL, 3.21x)", type: "trade", icon: "🦞" },
    { text: "JITO_TIP_OPTIMIZED: 0.001 SOL (Block: 319284)", type: "learn", icon: "⚡" },
    { text: "MEMPOOL_EVENT: New bond curve created [$PEPE2.0]", type: "scan", icon: "📡" },
    { text: "SLIPPAGE_ENFORCED: Boundary 0.8% [VOLATILITY_PROTECT]", type: "learn", icon: "🛡️" },
    { text: "RPC_LATENCY_SPIKE: Switching to fallback provider [QuikNode]", type: "block", icon: "⚠️" },
    { text: "BONDING_CURVE_UPDATE: $MEOW at 84% [PRE-MIGRATION]", type: "scan", icon: "📈" },
    { text: "PRIORITY_FEE_ADJUSTED: 4200 lamports/CU [CONGESTION_MODE]", type: "learn", icon: "⛽" },
    { text: "SECURITY_SWEEP: No rug signatures detected in $CHILL", type: "learn", icon: "🧼" }
];

let feedInterval = null;

function startLiveFeed() {
    if (feedInterval) clearInterval(feedInterval);

    feedInterval = setInterval(() => {
        // Only run if the dashboard is visible
        const dashboard = document.getElementById('dashboard-page');
        if (dashboard && dashboard.classList.contains('active')) {
            const log = RANDOM_LOGS[Math.floor(Math.random() * RANDOM_LOGS.length)];
            typeLog('main-terminal', log.text, log.type, log.icon);
        }
    }, 4500); // New log every 4.5 seconds
}
function startLiveBlocks() {
    const headerTitle = document.querySelector('.header-left span:last-child');
    if (!headerTitle) return;

    let blockHeight = 319284102;
    setInterval(() => {
        blockHeight += Math.floor(Math.random() * 3) + 1;
        headerTitle.innerHTML = `LIVE_ACTIVITY_FEED <span style="color: #445544; font-size: 0.6rem; margin-left:10px; font-weight: 400;">BLOCK: ${blockHeight}</span>`;
    }, 2000);
}

async function copyCA() {
    const ca = "824s8Mv422yeC1jukfjKYCYe2eFvYTQEY2C47wFRpump";
    try {
        await navigator.clipboard.writeText(ca);
        const pill = document.querySelector('.ca-pill');
        const label = pill.querySelector('.ca-label');

        pill.classList.add('copied');
        label.innerText = "COPIED!";

        setTimeout(() => {
            pill.classList.remove('copied');
            label.innerText = "CA:";
        }, 2000);
    } catch (err) {
        console.error('Failed to copy CA:', err);
    }
}

// Expose to window for index.html onclick handlers
window.showPage = showPage;
window.connectPhantom = connectPhantom;
window.openWalletModal = openWalletModal;
window.closeWalletModal = closeWalletModal;
window.simulateConnect = simulateConnect;
window.setNetwork = setNetwork;
window.selectMode = selectMode;
window.copyCA = copyCA;
window.simulateDeployment = simulateDeployment;
window.runSnipeDemo = runSnipeDemo;
window.runFarmDemo = runFarmDemo;
window.runSwarmDemo = runSwarmDemo;
