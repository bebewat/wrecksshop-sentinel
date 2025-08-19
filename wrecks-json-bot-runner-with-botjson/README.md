
# Wrecks JSON Bot Runner (Node.js)

This lightweight server reads your `bot.json` and exposes endpoints the Beacon Sentinel scripts can call.

## Endpoints

- `GET /health` → `{ ok: true }`
- `GET /shop?page=1` → shop page data from `bot.json` (page, pageSize, items)
- `GET /balance/:playerId` → `{ balance }`
- `POST /charge` → `{playerId, amount, reason}` subtracts from balance
- `POST /transfer` → `{fromId, toId, amount}` moves balance
- `POST /rewards/hourly` → `{serviceId, amount}` (stub)

All endpoints require `Authorization: Bearer <API_TOKEN>` if `API_TOKEN` is defined in env.

## Quick Start

```bash
# 1) Put your bot.json in the project root:
#    (or set BOT_JSON_PATH to the absolute path)
cp /mnt/data/json_bot/bot.json ./bot.json

# 2) Install & run
npm install
PORT=8787 API_TOKEN=supersecret node src/index.js
```
