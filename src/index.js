export function renderLoginPage(error = "") {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录与初始化 - 个人记账系统</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 space-y-6">
        <div class="text-center">
            <h1 class="text-2xl font-bold text-slate-800">💰 个人记账系统</h1>
            <p class="text-sm text-slate-500 mt-2">独占式单人云端记账看板</p>
        </div>

        <!-- 登录表单 -->
        <form id="loginForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">管理员密码（登录）</label>
                <input type="password" id="password" required placeholder="请输入密码" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition">
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition">登录系统</button>
        </form>

        <hr class="border-slate-100">

        <!-- 首次初始化表单（如果还没设置过密码，直接在这里设） -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <p class="text-xs font-bold text-slate-600">🚀 首次使用？在这里设置密码（仅需一次）：</p>
            <input type="password" id="initPassword" placeholder="设置新密码（至少6位）" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none">
            <button type="button" id="initBtn" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition">点击完成初始化设置</button>
        </div>
    </div>

    <script>
        // 登录逻辑
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwd = document.getElementById('password').value;
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pwd })
            });
            const data = await res.json();
            if (data.ok) {
                window.location.href = '/';
            } else {
                alert(data.error || '登录失败，请确认是否已初始化密码');
            }
        });

        // 网页直接初始化逻辑
        document.getElementById('initBtn').addEventListener('click', async () => {
            const pwd = document.getElementById('initPassword').value;
            if (!pwd || pwd.length < 6) {
                alert('密码长度至少需要6位');
                return;
            }
            const res = await fetch('/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pwd })
            });
            const data = await res.json();
            if (data.ok) {
                alert('🎉 初始化成功！现在可以直接在上方输入密码登录了');
                document.getElementById('password').value = pwd;
            } else {
                alert(data.error || '初始化失败');
            }
        });
    </script>
</body>
</html>`;
}
