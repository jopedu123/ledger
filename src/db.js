export async function getAdmin(db) {
    const { results } = await db.prepare("SELECT * FROM admins LIMIT 1").all();
    return results[0] || null;
}

export async function getLedgers(db) {
    const { results } = await db.prepare("SELECT * FROM ledgers ORDER BY created_at DESC").all();
    return results;
}

export async function getCategories(db, ledgerId) {
    const { results } = await db.prepare("SELECT * FROM categories WHERE ledger_id = ? ORDER BY type, name").bind(ledgerId).all();
    return results;
}

export async function getDefaultLedger(db) {
    const ledgers = await getLedgers(db);
    if (ledgers.length > 0) return ledgers[0];
    
    const ledgerId = crypto.randomUUID();
    const now = Date.now();
    await db.prepare("INSERT INTO ledgers (id, name, created_at) VALUES (?, ?, ?)").bind(ledgerId, "默认账本", now).run();
    
    const defaultCategories = [
        { name: "餐饮", type: "expense" },
        { name: "交通", type: "expense" },
        { name: "购物", type: "expense" },
        { name: "居住", type: "expense" },
        { name: "娱乐", type: "expense" },
        { name: "工资", type: "income" },
        { name: "兼职", type: "income" }
    ];
    
    for (const cat of defaultCategories) {
        await db.prepare("INSERT INTO categories (id, ledger_id, name, type) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), ledgerId, cat.name, cat.type).run();
    }
    
    return { id: ledgerId, name: "默认账本", created_at: now };
}
