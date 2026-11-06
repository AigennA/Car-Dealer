import demo from "../../../data/demo.json";

/**
 * Demo staff accounts for the static website, kept in the browser.
 * NOT secure — the real platform authenticates against the API (backend/).
 */
export type StaffAccount = { username: string; password: string };

export const DEMO_ACCOUNT: StaffAccount = demo.staffAccount;
export const ACCOUNTS_KEY = "car_dealer_accounts";
export const MIN_DEMO_PASSWORD_LENGTH = 4;

export const ACCOUNT_MESSAGES = {
  usernameRequired: "Ange ett användarnamn.",
  wrongCredentials: "Fel användarnamn eller lösenord.",
  passwordTooShort: `Lösenordet måste vara minst ${MIN_DEMO_PASSWORD_LENGTH} tecken.`,
  usernameTaken: "Användarnamnet finns redan.",
  created: "Konto skapat! Du kan nu logga in.",
} as const;

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function loadAccounts(storage: Storage = localStorage): StaffAccount[] {
  try {
    const saved: StaffAccount[] = JSON.parse(storage.getItem(ACCOUNTS_KEY) ?? "[]");
    return saved.some((a) => same(a.username, DEMO_ACCOUNT.username)) ? saved : [DEMO_ACCOUNT, ...saved];
  } catch {
    return [DEMO_ACCOUNT];
  }
}

export type AccountResult = { ok: true; username: string } | { ok: false; error: string };

export function authenticate(username: string, password: string, storage: Storage = localStorage): AccountResult {
  const user = username.trim();
  if (!user) return { ok: false, error: ACCOUNT_MESSAGES.usernameRequired };
  const account = loadAccounts(storage).find((a) => same(a.username, user));
  return account && account.password === password ? { ok: true, username: user } : { ok: false, error: ACCOUNT_MESSAGES.wrongCredentials };
}

export function register(username: string, password: string, storage: Storage = localStorage): AccountResult {
  const user = username.trim();
  if (!user) return { ok: false, error: ACCOUNT_MESSAGES.usernameRequired };
  if (password.length < MIN_DEMO_PASSWORD_LENGTH) return { ok: false, error: ACCOUNT_MESSAGES.passwordTooShort };
  const accounts = loadAccounts(storage);
  if (accounts.some((a) => same(a.username, user))) return { ok: false, error: ACCOUNT_MESSAGES.usernameTaken };
  storage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, { username: user, password }]));
  return { ok: true, username: user };
}
