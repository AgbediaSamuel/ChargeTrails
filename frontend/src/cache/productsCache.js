const key = (uid) => `products:${uid}`;

function load(uid) {
  try {
    const raw = localStorage.getItem(key(uid));
    if (!raw) return { items: [], saved_at: 0 };
    return JSON.parse(raw);
  } catch {
    return { items: [], saved_at: 0 };
  }
}

function save(uid, items) {
  try {
    localStorage.setItem(key(uid), JSON.stringify({ items, saved_at: Date.now() }));
  } catch {}
}

export function hydrateProducts(uid) {
  return load(uid).items || [];
}

export function saveProducts(uid, items) {
  save(uid, items || []);
}

export function clearProductsCache(uid) {
  try { localStorage.removeItem(key(uid)); } catch {}
}


