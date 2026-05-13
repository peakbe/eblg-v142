// ======================================================
// HELPERS — VERSION PRO+
// fetch JSON, status panel, distance, utils
// ======================================================

const IS_DEV = location.hostname.includes("localhost") || location.hostname.includes("127.0.0.1");
const log = (...a) => IS_DEV && console.log("[HELPERS]", ...a);
const logErr = (...a) => console.error("[HELPERS ERROR]", ...a);

export async function fetchJSON(url) {
    try {
        log("GET", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.status);
        return await res.json();
    } catch (err) {
        logErr("fetchJSON", url, err);
        return null;
    }
}

// Status panel générique (clé → data)
export function updateStatusPanel(key, data) {
    const el = document.getElementById("status-panel");
    if (!el) return;

    const ok = data && !data.fallback;
    const row = el.querySelector(`[data-key="${key}"]`);
    if (!row) return;

    row.className = "status-row " + (ok ? "ok" : "warn");
}
