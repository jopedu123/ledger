export function renderLoginPage(error = "") {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录 - 个人记账系统</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-slate-800">💰 个人记账系统</h1>
            <p class="text-sm text-slate-500 mt-2">基于 Cloudflare Workers 独立构建</p>
        </div>
        ${error ? `<div class="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">\${error}</div>` : ''}
        <form id="loginForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">管理员密码</label>
                <input type="password" id="password" required class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-200">登录系统</button>
        </form>
        <p class="mt-6 text-xs text-center text-slate-400">💡 提示：微信内置浏览器 Cookie 隔离严重，推荐使用手机系统自带浏览器打开。</p>
    </div>
    <script>
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
                alert(data.error || '登录失败');
            }
        });
    </script>
</body>
</html>`;
}
