require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 8000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

require('events').EventEmitter.defaultMaxListeners = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ── Config helpers ────────────────────────────────────────────────────────────
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE));
    } catch {}
    return { token: '', chatId: '', botName: 'Queen Ruva AI', started: false };
}

function saveConfig(data) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'main.html')));

app.get('/api/config', (req, res) => {
    const cfg = loadConfig();
    res.json({
        botName: cfg.botName || '',
        chatId: cfg.chatId || '',
        tokenSet: !!cfg.token,
        started: cfg.started || false,
        tokenPreview: cfg.token ? cfg.token.substring(0, 10) + '...' : ''
    });
});

app.post('/api/start', async (req, res) => {
    const { token, chatId, botName } = req.body;

    if (!token || !token.includes(':'))
        return res.status(400).json({ ok: false, error: 'Invalid token. Must be like: 123456:ABC-DEF...' });
    if (!chatId)
        return res.status(400).json({ ok: false, error: 'Chat ID is required.' });

    const cfg = { token, chatId, botName: botName || 'Queen Ruva AI', started: true };
    saveConfig(cfg);

    try {
        const { startBot, getBot } = require('./bot');
        startBot(token);

        // Notify owner
        const bot = getBot();
        if (bot && chatId) {
            try {
                await bot.sendMessage(chatId,
                    `✅ *${cfg.botName}* started!\n\nBot is online. Type /menu to see all commands.`,
                    { parse_mode: 'Markdown' }
                );
            } catch {}
        }

        res.json({ ok: true, message: `✅ Bot "${cfg.botName}" started! Check your Telegram.` });
    } catch (e) {
        cfg.started = false;
        saveConfig(cfg);
        res.status(500).json({ ok: false, error: e.message });
    }
});

app.post('/api/stop', (req, res) => {
    try { require('./bot').stopBot(); } catch {}
    const cfg = loadConfig();
    cfg.started = false;
    saveConfig(cfg);
    res.json({ ok: true, message: '🛑 Bot stopped.' });
});

app.get('/api/status', (req, res) => {
    let running = false;
    try { running = !!require('./bot').getBot(); } catch {}
    res.json({ running });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`
╔══════════════════════════════════════════╗
║    🤖 QUEEN RUVA TG MINI · Iconic Tech   ║
╠══════════════════════════════════════════╣
║  Web UI: http://0.0.0.0:${PORT}             ║
╚══════════════════════════════════════════╝
`);

    const cfg = loadConfig();
    if (cfg.token && cfg.started) {
        console.log('🔄 Auto-resuming bot from saved config...');
        try { require('./bot').startBot(cfg.token); } catch (e) {
            console.error('Auto-resume failed:', e.message);
        }
    }
});
