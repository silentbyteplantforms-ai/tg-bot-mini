# TG Bot Mini — by Iconic Tech

A minimal Telegram bot with a web UI for config. Enter your token + Chat ID in the browser, hit Start — done.

## Quick Start

```bash
npm install
npm start
```

Open `http://localhost:8000` → Enter your Bot Token & Chat ID → Start Bot.

## How to get your Token & Chat ID

1. **Token** → DM [@BotFather](https://t.me/BotFather) on Telegram → `/newbot`
2. **Chat ID** → DM [@userinfobot](https://t.me/userinfobot) → `/start`

## Default Commands

| Command | Response |
|---------|----------|
| `/start` | Welcome message + your Chat ID |
| `/help` | List of commands |
| `/id` | Your Chat ID |
| `/ping` | Pong! |

## Deploy

Works on Render, Railway, Termux — anywhere Node ≥ 18 runs.
