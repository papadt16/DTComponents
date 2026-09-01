// Customer-facing auth helpers. Deliberately separate from the admin
// token ("dt_token") so a customer session and an admin session never
// collide in the same browser.

const TOKEN_KEY = "dt_customer_token";
const PROFILE_KEY = "dt_customer_profile";

export function getCustomerToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setCustomerSession(token, profile) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile || {}));
}

export function getCustomerProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearCustomerSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function isLoggedIn() {
  return Boolean(getCustomerToken());
}

export function authHeaders() {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
