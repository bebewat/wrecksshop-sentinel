
import fs from 'fs/promises';
import path from 'path';

export async function loadBotJson() {
  const botPath = process.env.BOT_JSON_PATH || path.resolve(process.cwd(), 'bot.json');
  const raw = await fs.readFile(botPath, 'utf8');
  const bot = JSON.parse(raw);
  const shop = Array.isArray(bot?.shop?.catalog) ? bot.shop.catalog : [];
  const pageSize = Math.max(1, parseInt(bot?.shop?.max_items_per_page ?? 10, 10) || 10);
  const currency = bot?.economy?.currency_name || 'points';
  return { bot, shop, pageSize, currency };
}

export function paginateShop(shop, page, pageSize) {
  const pages = Math.max(1, Math.ceil(shop.length / pageSize));
  const p = Math.min(Math.max(1, page), pages);
  const start = (p - 1) * pageSize;
  const items = shop.slice(start, start + pageSize).map(it => ({
    name: it?.name,
    price: it?.price ?? it?.cost ?? 0
  }));
  return { page: p, pages, pageSize, total: shop.length, items };
}
