export async function hashPassword(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain + "LEDGER_SALT_2026");
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(plain, hashed) {
    const newHash = await hashPassword(plain);
    return newHash === hashed;
}

export async function checkAuth(request, env) {
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/ledger_token=([^;]+)/);
    if (!match) return null;
    const token = match[1];
    const sessionData = await env.SESSIONS.get(`session:${token}`);
    if (!sessionData) return null;
    return JSON.parse(sessionData);
}
