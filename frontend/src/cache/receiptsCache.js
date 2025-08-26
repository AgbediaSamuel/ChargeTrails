const ns = (uid) => `receipts:${uid}`;

function load(uid) {
  try {
    const raw = localStorage.getItem(ns(uid));
    if (!raw) return { map: {}, saved_at: 0 };
    return JSON.parse(raw);
  } catch {
    return { map: {}, saved_at: 0 };
  }
}

function save(uid, data) {
  try {
    localStorage.setItem(ns(uid), JSON.stringify({ ...data, saved_at: Date.now() }));
  } catch {}
}

export function hydrateListFromCache(uid) {
  const { map } = load(uid);
  return Object.values(map);
}

export function mergeListIntoCache(uid, receipts) {
  const data = load(uid);
  for (const r of receipts || []) {
    const prev = data.map[r.receipt_id];
    const prevTs = prev && typeof prev.timestamp === 'number' ? prev.timestamp : 0;
    const currTs = typeof r.timestamp === 'number' ? r.timestamp : prevTs + 1;
    if (!prev || currTs >= prevTs) {
      data.map[r.receipt_id] = r;
    }
  }
  save(uid, data);
}

export function mergeOneIntoCache(uid, receipt) {
  mergeListIntoCache(uid, [receipt]);
}

export function removeFromCache(uid, receiptId) {
  const data = load(uid);
  delete data.map[receiptId];
  save(uid, data);
}

export function clearCache(uid) {
  try { localStorage.removeItem(ns(uid)); } catch {}
}


