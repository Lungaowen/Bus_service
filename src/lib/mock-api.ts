// Mock API layer shaped like AuthService + CardService.
// Swap these functions with real fetch() calls later; signatures stay the same.

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type User = { id: number; username: string; email: string };

export type Card = {
  id: number;
  maskedNumber: string;
  fullNumber: string; // mock-only
  cvv: string; // mock-only
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: string;
  isDefault: boolean;
  balance: number;
  currency: "ZAR";
  status: "Active" | "Closed";
  createdAt: string;
};

export type Transaction = {
  id: number;
  cardId: number;
  dateTime: string;
  description: string;
  amount: number;
  status: "Successful" | "Pending" | "Failed";
};

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// ---- seed store ----
type Store = {
  users: (User & { password: string })[];
  cards: Card[];
  transactions: Transaction[];
  nextUserId: number;
  nextCardId: number;
  nextTxId: number;
};

function seed(): Store {
  return {
    users: [
      { id: 1, username: "Mpho", email: "mpho@example.com", password: "password" },
    ],
    cards: [
      {
        id: 1,
        maskedNumber: "**** **** **** 4821",
        fullNumber: "4539 1122 3344 4821",
        cvv: "324",
        cardHolderName: "Mpho Nkosi",
        expiryMonth: 8,
        expiryYear: 2029,
        cardType: "Visa",
        isDefault: true,
        balance: 2500,
        currency: "ZAR",
        status: "Active",
        createdAt: "2026-05-01T08:00:00Z",
      },
      {
        id: 2,
        maskedNumber: "**** **** **** 7712",
        fullNumber: "5412 7788 9901 7712",
        cvv: "918",
        cardHolderName: "Mpho Nkosi",
        expiryMonth: 3,
        expiryYear: 2030,
        cardType: "Mastercard",
        isDefault: false,
        balance: 0,
        currency: "ZAR",
        status: "Active",
        createdAt: "2026-06-14T10:00:00Z",
      },
    ],
    transactions: [
      {
        id: 1,
        cardId: 1,
        dateTime: "2024-05-12T08:45:00Z",
        description: "Card Top Up",
        amount: 500,
        status: "Successful",
      },
      {
        id: 2,
        cardId: 1,
        dateTime: "2024-05-05T14:30:00Z",
        description: "Card Top Up",
        amount: 1000,
        status: "Successful",
      },
      {
        id: 3,
        cardId: 1,
        dateTime: "2024-04-28T12:10:00Z",
        description: "Bus Fare",
        amount: -22,
        status: "Successful",
      },
      {
        id: 4,
        cardId: 2,
        dateTime: "2024-04-15T09:05:00Z",
        description: "Card Top Up",
        amount: 250,
        status: "Successful",
      },
    ],
    nextUserId: 2,
    nextCardId: 3,
    nextTxId: 5,
  };
}

const STORE_KEY = "tbs.mock-store.v1";

function loadStore(): Store {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Store;
  } catch {
    return seed();
  }
}

function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

function withStore<T>(fn: (s: Store) => T): T {
  const s = loadStore();
  const result = fn(s);
  saveStore(s);
  return result;
}

// ---- helpers ----
function genCardNumber() {
  const rand = () => Math.floor(1000 + Math.random() * 9000);
  const groups = [rand(), rand(), rand(), rand()];
  const full = groups.join(" ");
  const last4 = String(groups[3]);
  return { fullNumber: full, maskedNumber: `**** **** **** ${last4}` };
}

function ok<T>(message: string, data: T): ApiResponse<T> {
  return { success: true, message, data };
}
function fail<T = null>(message: string): ApiResponse<T> {
  return { success: false, message, data: null as T };
}

// ---- Auth ----
export async function login(input: { email: string; password: string }) {
  await delay();
  return withStore((s) => {
    const u = s.users.find(
      (x) =>
        (x.email.toLowerCase() === input.email.toLowerCase() ||
          x.username.toLowerCase() === input.email.toLowerCase()) &&
        x.password === input.password,
    );
    if (!u) return fail<{ token: string; user: User }>("Invalid credentials");
    const { password: _pw, ...user } = u;
    return ok("Login successful", { token: `mock.${u.id}.${Date.now()}`, user });
  });
}

export async function register(input: {
  username: string;
  email: string;
  password: string;
}) {
  await delay();
  return withStore((s) => {
    if (s.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase()))
      return fail<{ token: string; user: User }>("Email already in use");
    if (s.users.some((u) => u.username.toLowerCase() === input.username.toLowerCase()))
      return fail<{ token: string; user: User }>("Username already taken");
    const user: User & { password: string } = {
      id: s.nextUserId++,
      username: input.username,
      email: input.email,
      password: input.password,
    };
    s.users.push(user);
    const { password: _pw, ...pub } = user;
    return ok("Registration successful", {
      token: `mock.${user.id}.${Date.now()}`,
      user: pub,
    });
  });
}

// ---- Cards ----
export async function getCards() {
  await delay(200);
  return withStore((s) => {
    const list = [...s.cards].sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return ok("Cards retrieved successfully", list);
  });
}

export async function createCard(input: {
  cardHolderName: string;
  cardType?: string;
  isDefault?: boolean;
}) {
  await delay();
  return withStore((s) => {
    const { fullNumber, maskedNumber } = genCardNumber();
    const now = new Date();
    const card: Card = {
      id: s.nextCardId++,
      fullNumber,
      maskedNumber,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      cardHolderName: input.cardHolderName,
      cardType: input.cardType || "Visa",
      expiryMonth: Math.floor(1 + Math.random() * 12),
      expiryYear: now.getFullYear() + 3 + Math.floor(Math.random() * 3),
      isDefault: !!input.isDefault,
      balance: 0,
      currency: "ZAR",
      status: "Active",
      createdAt: now.toISOString(),
    };
    if (card.isDefault) s.cards.forEach((c) => (c.isDefault = false));
    s.cards.push(card);
    return ok("Virtual card created successfully", card);
  });
}

export async function closeCard(id: number) {
  await delay();
  return withStore((s) => {
    const c = s.cards.find((x) => x.id === id);
    if (!c) return fail<Card>("Card not found");
    c.status = "Closed";
    c.isDefault = false;
    return ok("Card closed successfully", c);
  });
}

export async function setDefaultCard(id: number) {
  await delay();
  return withStore((s) => {
    const c = s.cards.find((x) => x.id === id);
    if (!c) return fail<Card>("Card not found");
    s.cards.forEach((x) => (x.isDefault = false));
    c.isDefault = true;
    return ok("Default card updated", c);
  });
}

export async function topUpCard(id: number, amount: number) {
  await delay();
  return withStore((s) => {
    const c = s.cards.find((x) => x.id === id);
    if (!c) return fail<Card>("Card not found");
    if (c.status !== "Active") return fail<Card>("Card is not active");
    if (amount < 1 || amount > 1_000_000) return fail<Card>("Invalid amount");
    c.balance += amount;
    s.transactions.unshift({
      id: s.nextTxId++,
      cardId: c.id,
      dateTime: new Date().toISOString(),
      description: "Card Top Up",
      amount,
      status: "Successful",
    });
    return ok(`Card topped up successfully with R${amount.toFixed(2)}`, c);
  });
}

export async function getTransactions() {
  await delay(200);
  return withStore((s) =>
    ok(
      "Transactions retrieved",
      [...s.transactions].sort((a, b) => b.dateTime.localeCompare(a.dateTime)),
    ),
  );
}

export function resetMockStore() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORE_KEY);
}
