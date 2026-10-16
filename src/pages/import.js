export function renderImportPage() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据备份与恢复 - 记账系统</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-100 min-h-screen text-slate-800">
    <header class="bg-white shadow-sm sticky top-0 z-30">
        <div class="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 class="text-xl font-bold">📁 数据备份与恢复</h1>
            <a href="/" class="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition">← 返回看板</a>
        </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm flex flex-wrap gap-4 justify-between items-center">
            <div>
                <h2 class="font-bold text-base">📤 全量数据备份导出</h2>
                <p class="text-xs text-slate-500 mt-1">导出全部账套的所有流水，带 UTF-8 BOM，完美适配 Excel</p>
            </div>
            <button onclick="exportAllCSV()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow transition">下载全部 CSV 备份</button>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-rose-200 space-y-4">
            <h2 class="font-bold text-base text-rose-600">⚠️ 危险操作：全局归零</h2>
            <p class="text-xs text-slate-500">清空系统内所有账套、分类与流水数据（管理员账号保留）。请先下载 CSV 备份！</p>
            <div class="flex flex-wrap gap-4 items-center">
                <input type="text" id="wipeConfirmInput" placeholder="输入「确认归零」" class="px-3 py-2 border rounded-lg text-sm">
                <button onclick="wipeSystem()" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-lg text-sm transition">执行全盘归零</button>
            </div>
        </div>
    </main>

    <script>
        function exportAllCSV() {
            window.location.href = '/api/export?scope=all';
        }

        async function wipeSystem() {
            const val = document.getElementById('wipeConfirmInput').value.trim();
            if (val !== '确认归零') {
                alert('输入文字不匹配，拒绝归零');
                return;
            }
            if (!confirm('最后警告：此操作不可撤销，确定清空所有数据？')) return;
            const res = await fetch('/api/wipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirm_text: val })
            });
            const data = await res.json();
            if (data.ok) {
                alert('系统已全盘归零');
                window.location.href = '/login';
            } else {
                alert(data.error);
            }
        }
    </script>
</body>
</html>`;
}
