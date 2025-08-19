
import express from 'express';
import { loadBotJson, paginateShop } from './bot.js';
import { getBalance, addBalance, transfer } from './store.js';

const app = express();
app.use(express.json());

// Simple auth middleware if API_TOKEN is set
app.use((req, res, next) => {
  const required = process.env.API_TOKEN;
  if (!required) return next();
  const got = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  if (got !== required) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/shop', async (req, res) => {
  try {
    const { shop, pageSize, currency } = await loadBotJson();
    const page = parseInt(req.query.page ?? '1', 10) || 1;
    const data = paginateShop(shop, page, pageSize);
    res.json({ currency, ...data });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load shop' });
  }
});

app.get('/balance/:playerId', async (req, res) => {
  try {
    const playerId = String(req.params.playerId);
    const bal = await getBalance(playerId);
    res.json({ playerId, balance: bal });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to get balance' });
  }
});

app.post('/charge', async (req, res) => {
  try {
    const { playerId, amount, reason } = req.body || {};
    const amt = parseInt(amount, 10);
    if (!playerId || !Number.isFinite(amt)) return res.status(400).json({ error: 'playerId and amount are required' });
    if (amt <= 0) return res.status(400).json({ error: 'amount must be positive' });
    const next = await addBalance(String(playerId), -amt);
    res.json({ ok: true, playerId, newBalance: next, reason: reason || null });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Charge failed' });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    const { fromId, toId, amount } = req.body || {};
    const amt = parseInt(amount, 10);
    if (!fromId || !toId || !Number.isFinite(amt)) return res.status(400).json({ error: 'fromId, toId, and amount are required' });
    const result = await transfer(String(fromId), String(toId), amt);
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Transfer failed' });
  }
});

app.post('/rewards/hourly', async (req, res) => {
  try {
    const { amount } = req.body || {};
    const amt = parseInt(amount, 10);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount > 0 required' });
    // Stub; hook in your logic to select recipients
    res.json({ ok: true, granted: 0 });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Hourly reward failed' });
  }
});

const port = parseInt(process.env.PORT || '8787', 10);
app.listen(port, () => {
  console.log(`JSON Bot Runner listening on :${port}`);
});
