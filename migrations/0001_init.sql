CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash TEXT,
    ai_enabled INTEGER NOT NULL DEFAULT 1,
    ai_cfg_text TEXT,
    ai_cfg_vision TEXT,
    ai_cfg_voice TEXT,
    allow_restore INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER
);

CREATE TABLE IF NOT EXISTS ledgers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    ledger_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
    UNIQUE(ledger_id, name, type)
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    ledger_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
    trans_date INTEGER NOT NULL,
    note TEXT,
    FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(trans_date);
CREATE INDEX IF NOT EXISTS idx_transactions_ledger ON transactions(ledger_id);

CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    ledger_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    period TEXT NOT NULL,
    amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
    FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(ledger_id, category_id, period)
);

CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);
