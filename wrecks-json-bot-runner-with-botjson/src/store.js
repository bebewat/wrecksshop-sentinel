
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const BAL_FILE = path.join(DATA_DIR, 'balances.json');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(file, obj) {
  const raw = JSON.stringify(obj, null, 2);
  await fs.writeFile(file, raw, 'utf8');
}

export async function getBalance(playerId) {
  await ensureDataDir();
  const db = await readJson(BAL_FILE, {});
  const v = parseInt(db[playerId] ?? 0, 10);
  return Number.isFinite(v) ? v : 0;
}

export async function setBalance(playerId, newValue) {
  await ensureDataDir();
  const db = await readJson(BAL_FILE, {});
  db[playerId] = newValue;
  await writeJson(BAL_FILE, db);
}

export async function addBalance(playerId, delta) {
  const cur = await getBalance(playerId);
  const next = cur + delta;
  if (next < 0) throw new Error('Insufficient funds');
  await setBalance(playerId, next);
  return next;
}

export async function transfer(fromId, toId, amount) {
  if (amount <= 0) throw new Error('Amount must be positive');
  const fromBal = await getBalance(fromId);
  if (fromBal < amount) throw new Error('Insufficient funds');
  await setBalance(fromId, fromBal - amount);
  const toBal = await getBalance(toId);
  await setBalance(toId, toBal + amount);
  return { from: fromId, to: toId, amount };
}
