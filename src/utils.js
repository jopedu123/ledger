export function generateUUID() {
    return crypto.randomUUID();
}

export function yuanToFen(val) {
    if (val === undefined || val === null || val === '') {
        throw new Error("金额不能为空");
    }
    const num = Number(val);
    if (isNaN(num) || !isFinite(num) || num <= 0) {
        throw new Error("金额必须为大于0的有效数字");
    }
    return Math.round(num * 100);
}

export function fenToYuan(cents) {
    if (isNaN(cents)) return "0.00";
    return (Number(cents) / 100).toFixed(2);
}

export function getCSTNow() {
    const now = new Date();
    return new Date(now.getTime() + 8 * 3600 * 1000);
}

export function getCSTMonth(date = new Date()) {
    const cst = new Date(date.getTime() + 8 * 3600 * 1000);
    const y = cst.getUTCFullYear();
    const m = String(cst.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

export function parseDateToTimestamp(dateStr) {
    if (!dateStr) return Date.now();
    if (/^\d{4}-\d{2}-\d{2}\$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return Date.UTC(y, m - 1, d, 0, 0, 0) - 8 * 3600 * 1000;
    }
    const num = Number(dateStr);
    if (!isNaN(num)) return num;
    const parsed = new Date(dateStr).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
}

export function formatCSTDate(ts) {
    const d = new Date(Number(ts) + 8 * 3600 * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function escapeCSV(str) {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""').replace(/,/g, '，');
    return `"${s}"`;
}
