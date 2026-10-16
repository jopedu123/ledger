export function renderAppPage() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个人记账系统 · 独占看板</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-slate-100 min-h-screen text-slate-800">
    <header class="bg-white shadow-sm sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 class="text-xl font-bold flex items-center gap-2">📊 <span>Cloudflare 记账系统</span></h1>
            <div class="flex items-center gap-3">
                <a href="/import" class="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition">📁 批量/恢复/导出</a>
                <button id="logoutBtn" class="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition">退出登录</button>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div class="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-slate-600">当前账套：</label>
                <select id="globalLedgerSelect" class="px-3 py-1.5 border rounded-lg bg-white text-sm font-medium"></select>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500">
                <p class="text-xs text-slate-500 font-medium">总收入 (元)</p>
                <p id="kpiIncome" class="text-2xl font-bold text-emerald-600 mt-1">0.00</p>
            </div>
            <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-rose-500">
                <p class="text-xs text-slate-500 font-medium">总支出 (元)</p>
                <p id="kpiExpense" class="text-2xl font-bold text-rose-600 mt-1">0.00</p>
            </div>
            <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
                <p class="text-xs text-slate-500 font-medium">结余 (元)</p>
                <p id="kpiBalance" class="text-2xl font-bold text-blue-600 mt-1">0.00</p>
            </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">✍️ 记一笔</h2>
            <form id="recordForm" class="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">账套</label>
                    <select id="formLedger" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" disabled></select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">收支类型</label>
                    <select id="formType" class="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="expense">支出</option>
                        <option value="income">收入</option>
                    </select>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-xs font-medium text-slate-600">分类</label>
                        <button type="button" id="openNewCategoryModalBtn" class="text-xs text-blue-600 hover:underline font-medium">➕ 新建分类</button>
                    </div>
                    <select id="formCategory" class="w-full px-3 py-2 border rounded-lg text-sm"></select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">金额 (元)</label>
                    <input type="number" step="0.01" min="0.01" id="formAmount" required placeholder="0.00" class="w-full px-3 py-2 border rounded-lg text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">日期</label>
                    <input type="date" id="formDate" required class="w-full px-3 py-2 border rounded-lg text-sm">
                </div>
                <div class="md:col-span-6">
                    <label class="block text-xs font-medium text-slate-600 mb-1">备注说明 (可选)</label>
                    <div class="flex gap-2">
                        <input type="text" id="formNote" placeholder="例如：午餐、买书..." class="flex-1 px-3 py-2 border rounded-lg text-sm">
                        <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow transition">确认记账</button>
                    </div>
                </div>
            </form>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm">
            <h2 class="text-lg font-bold mb-4">📜 近期流水明细</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b bg-slate-50 text-slate-600">
                            <th class="p-3">日期</th>
                            <th class="p-3">类型</th>
                            <th class="p-3">分类</th>
                            <th class="p-3">金额 (元)</th>
                            <th class="p-3">备注</th>
                            <th class="p-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody id="transactionTableBody"></tbody>
                </table>
            </div>
        </div>
    </main>

    <div id="categoryModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 class="text-lg font-bold mb-4">➕ 新建分类</h3>
            <form id="categoryForm" class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">所属账套 (锁定)</label>
                    <select id="modalCatLedger" disabled class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-100"></select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">分类类型 (锁定)</label>
                    <select id="modalCatType" disabled class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-100">
                        <option value="expense">支出</option>
                        <option value="income">收入</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">分类名称</label>
                    <input type="text" id="modalCatName" required maxlength="20" placeholder="例如：零食、数码" class="w-full px-3 py-2 border rounded-lg text-sm">
                </div>
                <div class="flex justify-end gap-2 mt-6">
                    <button type="button" id="closeCategoryModalBtn" class="px-4 py-2 border rounded-lg text-sm">取消</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">确认创建</button>
                </div>
            </form>
        </div>
    </div>

    <div id="toast" class="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm z-50 transition-opacity duration-300 opacity-0 pointer-events-none"></div>

    <script>
        let currentLedgerId = '';
        let categoriesCache = [];

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.innerText = msg;
            t.classList.remove('opacity-0', 'pointer-events-none');
            t.classList.add('opacity-100');
            setTimeout(() => {
                t.classList.remove('opacity-100');
                t.classList.add('opacity-0', 'pointer-events-none');
            }, 3000);
        }

        function initDateInput() {
            const now = new Date(Date.now() + 8 * 3600 * 1000);
            const y = now.getUTCFullYear();
            const m = String(now.getUTCMonth() + 1).padStart(2, '0');
            const d = String(now.getUTCDate()).padStart(2, '0');
            document.getElementById('formDate').value = \`\${y}-\${m}-\${d}\`;
        }

        async function loadLedgers() {
            const res = await fetch('/api/ledgers');
            const data = await res.json();
            if (data.ok) {
                const globalSel = document.getElementById('globalLedgerSelect');
                const formSel = document.getElementById('formLedger');
                const modalSel = document.getElementById('modalCatLedger');
                globalSel.innerHTML = ''; formSel.innerHTML = ''; modalSel.innerHTML = '';
                data.ledgers.forEach(l => {
                    globalSel.add(new Option(l.name, l.id));
                    formSel.add(new Option(l.name, l.id));
                    modalSel.add(new Option(l.name, l.id));
                });
                if (data.ledgers.length > 0) {
                    currentLedgerId = data.ledgers[0].id;
                    globalSel.value = currentLedgerId;
                    formSel.value = currentLedgerId;
                    modalSel.value = currentLedgerId;
                    await switchLedger(currentLedgerId);
                }
            }
        }

        async function switchLedger(ledgerId) {
            currentLedgerId = ledgerId;
            document.getElementById('formLedger').value = ledgerId;
            document.getElementById('modalCatLedger').value = ledgerId;
            await loadCategories();
            await loadTransactions();
            await loadDashboard();
        }

        async function loadCategories() {
            const res = await fetch(\`/api/categories?ledger_id=\${currentLedgerId}\`);
            const data = await res.json();
            if (data.ok) {
                categoriesCache = data.categories;
                updateCategorySelects();
            }
        }

        function updateCategorySelects() {
            const type = document.getElementById('formType').value;
            const catSel = document.getElementById('formCategory');
            catSel.innerHTML = '';
            const filtered = categoriesCache.filter(c => c.type === type);
            if (filtered.length === 0) {
                catSel.add(new Option('暂无分类，请先添加', ''));
            } else {
                filtered.forEach(c => catSel.add(new Option(\`\${c.type==='income'?'收入':'支出'}-\${c.name}\`, c.id)));
            }
        }

        document.getElementById('formType').addEventListener('change', updateCategorySelects);

        async function loadDashboard() {
            const res = await fetch(\`/api/stats?ledger_id=\${currentLedgerId}\`);
            const data = await res.json();
            if (data.ok) {
                document.getElementById('kpiIncome').innerText = (data.income / 100).toFixed(2);
                document.getElementById('kpiExpense').innerText = (data.expense / 100).toFixed(2);
                document.getElementById('kpiBalance').innerText = ((data.income - data.expense) / 100).toFixed(2);
            }
        }

        async function loadTransactions() {
            const res = await fetch(\`/api/transactions?ledger_id=\${currentLedgerId}\`);
            const data = await res.json();
            if (data.ok) {
                const tbody = document.getElementById('transactionTableBody');
                tbody.innerHTML = '';
                if (data.transactions.length === 0) {
                    tbody.innerHTML = \`<tr><td colspan="6" class="p-4 text-center text-slate-400">暂无流水记录</td></tr>\`;
                    return;
                }
                data.transactions.forEach(tx => {
                    const dateStr = new Date(tx.trans_date + 8*3600*1000).toISOString().slice(0, 10);
                    const tr = document.createElement('tr');
                    tr.className = 'border-b hover:bg-slate-50 transition';
                    tr.innerHTML = \`
                        <td class="p-3 text-slate-600">\${dateStr}</td>
                        <td class="p-3"><span class="px-2 py-0.5 rounded text-xs font-medium \${tx.type==='income'?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700'}">\${tx.type==='income'?'收入':'支出'}</span></td>
                        <td class="p-3 font-medium">\${tx.category_name}</td>
                        <td class="p-3 font-bold \${tx.type==='income'?'text-emerald-600':'text-rose-600'}">\${tx.type==='income'?'+':'-'}\${(tx.amount_cents/100).toFixed(2)}</td>
                        <td class="p-3 text-slate-500">\${tx.note || '-'}</td>
                        <td class="p-3 text-right"><button onclick="deleteTx('\${tx.id}')" class="text-xs text-red-500 hover:underline">删除</button></td>
                    \`;
                    tbody.appendChild(tr);
                });
            }
        }

        document.getElementById('recordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                ledger_id: currentLedgerId,
                category_id: document.getElementById('formCategory').value,
                amount: document.getElementById('formAmount').value,
                date: document.getElementById('formDate').value,
                note: document.getElementById('formNote').value
            };
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.ok) {
                document.getElementById('formAmount').value = '';
                document.getElementById('formNote').value = '';
                showToast('✅ 记账成功');
                await loadDashboard();
                await loadTransactions();
            } else {
                alert(data.error);
            }
        });

        window.deleteTx = async function(id) {
            if (!confirm('确认删除该笔流水？')) return;
            const res = await fetch('/api/transactions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ledger_id: currentLedgerId })
            });
            const data = await res.json();
            if (data.ok) {
                showToast('🗑️ 流水已删除');
                await loadDashboard();
                await loadTransactions();
            } else {
                alert(data.error);
            }
        };

        const catModal = document.getElementById('categoryModal');
        document.getElementById('openNewCategoryModalBtn').addEventListener('click', () => {
            document.getElementById('modalCatType').value = document.getElementById('formType').value;
            catModal.classList.remove('hidden');
        });
        document.getElementById('closeCategoryModalBtn').addEventListener('click', () => catModal.classList.add('hidden'));
        document.getElementById('categoryForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('modalCatName').value.trim();
            const type = document.getElementById('modalCatType').value;
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ledger_id: currentLedgerId, name, type })
            });
            const data = await res.json();
            if (data.ok) {
                catModal.classList.add('hidden');
                document.getElementById('modalCatName').value = '';
                categoriesCache.push({ id: data.id, ledger_id: currentLedgerId, name, type });
                updateCategorySelects();
                document.getElementById('formCategory').value = data.id;
                showToast(\`分类「\${name}」已创建并选中\`);
            } else {
                alert(data.error);
            }
        });

        document.getElementById('globalLedgerSelect').addEventListener('change', (e) => switchLedger(e.target.value));
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
        });

        initDateInput();
        loadLedgers();
    </script>
</body>
</html>`;
}
