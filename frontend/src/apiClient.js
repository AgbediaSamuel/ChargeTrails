import { getAuth } from "firebase/auth";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

async function authFetch(path, options = {}) {
  const auth = getAuth();
  const user = auth.currentUser;
  const headers = new Headers(options.headers || {});

  if (user) {
    const token = await user.getIdToken(true);
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export { authFetch, API_BASE };

