import { hashPassword, verifyPassword, checkAuth } from './auth.js';
import { getAdmin, getLedgers, getCategories, getDefaultLedger } from './db.js';
import { yuanToFen, fenToYuan, parseDateToTimestamp, formatCSTDate, escapeCSV } from './utils.js';
import { renderLoginPage } from './pages/login.js';
import { renderAppPage } from './pages/app.js';
import { renderImportPage } from './pages/import.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 1. 初始化密码接口（支持网页端直接提交）
        if (path === '/init' && request.method === 'POST') {
            try {
                const existing = await getAdmin(env.DB);
                if (existing) return Response.json({ ok: false, error: "管理员已存在，初始化接口已关闭" }, { status: 403 });
                const { pwd } = await request.json();
                if (!pwd || pwd.length < 6) return Response.json({ ok: false, error: "密码至少需要6位" }, { status: 400 });
                const hash = await hashPassword(pwd);
                const id = crypto.randomUUID();
                await env.DB.prepare("INSERT INTO admins (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)").bind(id, 'admin', hash, Date.now()).run();
                return Response.json({ ok: true, message: "初始化成功，请前往登录" });
            } catch (err) {
                return Response.json({ ok: false, error: err.message }, { status: 500 });
            }
        }

        // 2. 检查是否需要初始化的状态接口
        if (path === '/api/status' && request.method === 'GET') {
            try {
                const admin = await getAdmin(env.DB);
                return Response.json({ ok: true, initialized: !!admin });
            } catch (err) {
                return Response.json({ ok: true, initialized: false });
            }
        }

        if (path === '/api/login' && request.method === 'POST') {
            try {
                const admin = await getAdmin(env.DB);
                if (!admin) return Response.json({ ok: false, error: "系统尚未初始化" }, { status: 400 });
                const { pwd } = await request.json();
                const isValid = await verifyPassword(pwd, admin.password_hash);
                if (!isValid) return Response.json({ ok: false, error: "密码错误" }, { status: 401 });
                
                const token = crypto.randomUUID();
                await env.SESSIONS.put(`session:${token}`, JSON.stringify({ user: 'admin', time: Date.now() }), { expirationTtl: 604800 });
                
                return new Response(JSON.stringify({ ok: true }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Set-Cookie": `ledger_token=${token}; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/`
                    }
                });
            } catch (err) {
                return Response.json({ ok: false, error: err.message }, { status: 500 });
            }
        }

        if (path === '/api/logout' && request.method === 'POST') {
            const cookie = request.headers.get('Cookie') || '';
            const match = cookie.match(/ledger_token=([^;]+)/);
            if (match) {
                await env.SESSIONS.delete(`session:${match[1]}`);
            }
            return new Response(JSON.stringify({ ok: true }), {
                headers: { "Set-Cookie": "ledger_token=; HttpOnly; Max-Age=0; Path=/" }
            });
        }

        // 网页登录页（自动判断是否需要初始化）
        if (path === '/login' || path === '/') {
            const admin = await getAdmin(env.DB);
            if (!admin && path === '/') {
                // 如果还未初始化，直接返回一个超级友好的网页初始化表单
                return new Response(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>系统初始化 - 个人记账系统</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-slate-800">🚀 欢迎使用个人记账系统</h1>
            <p class="text-sm text-slate-500 mt-2">首次使用，请先设置您的管理员密码</p>
        </div>
        <form id="initForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">设置管理密码 (至少6位)</label>
                <input type="password" id="initPwd" required minlength="6" placeholder="请输入新密码" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-200">完成初始化并进入</button>
        </form>
    </div>
    <script>
        document.getElementById('initForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwd = document.getElementById('initPwd').value;
            const res = await fetch('/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pwd })
            });
            const data = await res.json();
            if (data.ok) {
                alert('初始化成功！即将进入登录页');
                window.location.href = '/login';
            } else {
                alert(data.error || '初始化失败');
            }
        });
    </script>
</body>
</html>`, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
            }
            if (path === '/login') {
                return new Response(renderLoginPage(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
            }
        }

        const session = await checkAuth(request, env);
        if (!session) {
            const admin = await getAdmin(env.DB);
            if (!admin) {
                return Response.redirect(new URL('/', request.url), 302); // 未初始化重定向到初始化页
            }
            if (path.startsWith('/api/')) {
                return Response.json({ ok: false, error: "未授权，请先登录" }, { status: 401 });
            }
            return Response.redirect(new URL('/login', request.url), 302);
        }

        if (path === '/') {
            return new Response(renderAppPage(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
        }
        if (path === '/import') {
            return new Response(renderImportPage(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
        }

        try {
            if (path === '/api/ledgers' && request.method === 'GET') {
                let ledgers = await getLedgers(env.DB);
                if (ledgers.length === 0) {
                    await getDefaultLedger(env.DB);
                    ledgers = await getLedgers(env.DB);
                }
                return Response.json({ ok: true, ledgers });
            }

            if (path === '/api/categories' && request.method === 'GET') {
                const ledgerId = url.searchParams.get('ledger_id');
                if (!ledgerId) return Response.json({ ok: false, error: "缺少 ledger_id" }, { status: 400 });
                const categories = await getCategories(env.DB, ledgerId);
                return Response.json({ ok: true, categories });
            }

            if (path === '/api/categories' && request.method === 'POST') {
                const { ledger_id, name, type } = await request.json();
                if (!ledger_id || !name || !['income', 'expense'].includes(type)) {
                    return Response.json({ ok: false, error: "参数不合法" }, { status: 400 });
                }
                const cleanName = name.trim();
                const id = crypto.randomUUID();
                try {
                    await env.DB.prepare("INSERT INTO categories (id, ledger_id, name, type) VALUES (?, ?, ?, ?)").bind(id, ledger_id, cleanName, type).run();
                    return Response.json({ ok: true, id, name: cleanName, type });
                } catch (err) {
                    if (err.message && err.message.includes("UNIQUE")) {
                        return Response.json({ ok: false, error: "该分类已存在" }, { status: 409 });
                    }
                    throw err;
                }
            }

            if (path === '/api/transactions' && request.method === 'GET') {
                const ledgerId = url.searchParams.get('ledger_id');
                if (!ledgerId) return Response.json({ ok: false, error: "缺少 ledger_id" }, { status: 400 });
                const { results } = await env.DB.prepare(`
                    SELECT t.*, c.name as category_name, c.type 
                    FROM transactions t 
                    JOIN categories c ON t.category_id = c.id 
                    WHERE t.ledger_id = ? 
                    ORDER BY t.trans_date DESC LIMIT 100
                `).bind(ledgerId).all();
                return Response.json({ ok: true, transactions: results });
            }

            if (path === '/api/transactions' && request.method === 'POST') {
                const { ledger_id, category_id, amount, date, note } = await request.json();
                if (!ledger_id || !category_id || !amount) {
                    return Response.json({ ok: false, error: "必填字段不能为空" }, { status: 400 });
                }
                const amount_cents = yuanToFen(amount);
                const trans_date = parseDateToTimestamp(date);
                const id = crypto.randomUUID();

                await env.DB.prepare("INSERT INTO transactions (id, ledger_id, category_id, amount_cents, trans_date, note) VALUES (?, ?, ?, ?, ?, ?)").bind(
                    id, ledger_id, category_id, amount_cents, trans_date, note || null
                ).run();

                return Response.json({ ok: true, id });
            }

            if (path === '/api/transactions' && request.method === 'DELETE') {
                const { id, ledger_id } = await request.json();
                if (!id || !ledger_id) return Response.json({ ok: false, error: "参数不完整" }, { status: 400 });
                await env.DB.prepare("DELETE FROM transactions WHERE id = ? AND ledger_id = ?").bind(id, ledger_id).run();
                return Response.json({ ok: true });
            }

            if (path === '/api/stats' && request.method === 'GET') {
                const ledgerId = url.searchParams.get('ledger_id');
                if (!ledgerId) return Response.json({ ok: false, error: "缺少 ledger_id" }, { status: 400 });

                const now = new Date(Date.now() + 8 * 3600 * 1000);
                const y = now.getUTCFullYear();
                const m = now.getUTCMonth();
                const startUTC = Date.UTC(y, m, 1, 0, 0, 0) - 8 * 3600 * 1000;
                const endUTC = Date.UTC(y, m + 1, 1, 0, 0, 0) - 8 * 3600 * 1000;

                const { results: sumRes } = await env.DB.prepare(`
                    SELECT c.type, SUM(t.amount_cents) as total 
                    FROM transactions t 
                    JOIN categories c ON t.category_id = c.id 
                    WHERE t.ledger_id = ? AND t.trans_date >= ? AND t.trans_date < ? 
                    GROUP BY c.type
                `).bind(ledgerId, startUTC, endUTC).all();

                let income = 0, expense = 0;
                sumRes.forEach(r => {
                    if (r.type === 'income') income = r.total || 0;
                    if (r.type === 'expense') expense = r.total || 0;
                });

                return Response.json({ ok: true, income, expense });
            }

            if (path === '/api/export' && request.method === 'GET') {
                const { results } = await env.DB.prepare(`
                    SELECT l.name as ledger_name, t.trans_date, c.name as category_name, c.type, t.amount_cents, t.note
                    FROM transactions t
                    JOIN ledgers l ON t.ledger_id = l.id
                    JOIN categories c ON t.category_id = c.id
                    ORDER BY t.trans_date DESC
                `).all();

                let csv = `# 导出时间: ${new Date().toISOString()}, 范围: 全量备份\n`;
                csv += `账套名,日期,分类名,类型,金额(元),备注\n`;
                results.forEach(r => {
                    const dateStr = formatCSTDate(r.trans_date);
                    const amountYuan = (r.amount_cents / 100).toFixed(2);
                    csv += `${escapeCSV(r.ledger_name)},${dateStr},${escapeCSV(r.category_name)},${r.type},${amountYuan},${escapeCSV(r.note || '')}\n`;
                });

                return new Response("\uFEFF" + csv, {
                    headers: {
                        "Content-Type": "text/csv;charset=utf-8",
                        "Content-Disposition": "attachment; filename=ledger_backup.csv"
                    }
                });
            }

            if (path === '/api/wipe' && request.method === 'POST') {
                const { confirm_text } = await request.json();
                if (confirm_text !== '确认归零') return Response.json({ ok: false, error: "确认文字错误" }, { status: 400 });

                await env.DB.prepare("DELETE FROM budgets").run();
                await env.DB.prepare("DELETE FROM transactions").run();
                await env.DB.prepare("DELETE FROM categories").run();
                await env.DB.prepare("DELETE FROM ledgers").run();
                return Response.json({ ok: true });
            }

        } catch (err) {
            return Response.json({ ok: false, error: err.message }, { status: 500 });
        }

        return new Response("Not Found", { status: 404 });
    }
};
