const CONTENT_URL = "https://content-api.wildberries.ru";
const PRICES_URL  = "https://discounts-prices-api.wildberries.ru";
const STATS_URL   = "https://statistics-api.wildberries.ru";

export interface WbCard {
  nmID: number;
  vendorCode: string;
  subjectName: string;
  title: string;
  description?: string;
  photos: Array<{ big: string; c246x328: string }>;
  sizes: Array<{ price?: number; discountedPrice?: number }>;
}

export interface WbPrice {
  nmID: number;
  sizes: Array<{ price: number; discountedPrice: number }>;
}

export interface WbOrder {
  nmId: number;
  totalPrice: number;
  date: string;
  isCancel: boolean;
  orderType: number;
}

export async function fetchWbCards(): Promise<WbCard[]> {
  const cards: WbCard[] = [];
  let cursor: { nmID?: number; updatedAt?: string } = {};

  while (true) {
    const body: Record<string, unknown> = {
      settings: {
        cursor: { limit: 100, ...(cursor.nmID ? cursor : {}) },
        filter: { withPhoto: -1 },
      },
    };

    const res = await fetch(`${CONTENT_URL}/content/v2/get/cards/list`, {
      method: "POST",
      headers: { Authorization: process.env.WB_TOKEN_CONTENT!, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`WB Content API error: ${res.status}`);
    const data = await res.json();

    const batch: WbCard[] = data.cards ?? [];
    cards.push(...batch);

    if (batch.length < 100) break;
    cursor = data.cursor ?? {};
    if (!cursor.nmID) break;
  }

  return cards;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 4): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    const delay = 5000 * (i + 1); // 5s, 10s, 15s, 20s
    await new Promise((r) => setTimeout(r, delay));
  }
  return fetch(url, options);
}

export async function fetchWbPrices(): Promise<Map<number, WbPrice>> {
  const res = await fetchWithRetry(
    `${PRICES_URL}/api/v2/list/goods/filter?limit=1000&offset=0`,
    { headers: { Authorization: process.env.WB_TOKEN_PRICES! } }
  );
  if (!res.ok) throw new Error(`WB Prices API error: ${res.status}`);
  const data = await res.json();

  const map = new Map<number, WbPrice>();
  for (const item of data.data?.listGoods ?? []) {
    map.set(item.nmID, item);
  }
  return map;
}

export async function fetchWbOrders(daysBack = 30): Promise<WbOrder[]> {
  const from = new Date();
  from.setDate(from.getDate() - daysBack);
  const dateFrom = from.toISOString().slice(0, 10);

  const res = await fetch(
    `${STATS_URL}/api/v1/supplier/orders?dateFrom=${dateFrom}`,
    { headers: { Authorization: process.env.WB_TOKEN_STATS! } }
  );
  if (!res.ok) throw new Error(`WB Stats API error: ${res.status}`);
  return res.json();
}

export function wbProductUrl(nmID: number) {
  return `https://www.wildberries.ru/catalog/${nmID}/detail.aspx`;
}
