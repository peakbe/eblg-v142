// ======================================================
// STATUS PANEL — VERSION PRO+
// Vérification API, couleurs ATC, logs propres.
// ======================================================

import { ENDPOINTS } from "./config.js";

const IS_DEV = location.hostname.includes("localhost");
const log = (...a) => IS_DEV && console.log("[STATUS]", ...a);
const logErr = (...a) => console.error("[STATUS ERROR]", ...a);

export async function checkApiStatus() {
    log("Vérification statut API…");

    const results = {
        METAR: await ping(ENDPOINTS.metar),
        TAF: await ping(ENDPOINTS.taf),
        FIDS: await ping(ENDPOINTS.fids),
        SONO: await ping(ENDPOINTS.sonometers)
    };

    updateStatusPanel(results);
}

async function ping(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) return "DOWN";
        return "OK";
    } catch (err) {
        logErr("Ping error:", url, err);
        return "DOWN";
    }
}

function updateStatusPanel(results) {
    const el = document.getElementById("api-status");
    if (!el) return;

    el.innerHTML = `
        <div class="status-row" data-key="METAR">
            <span>METAR</span>
            <span class="status-dot ${color(results.METAR)}"></span>
        </div>
        <div class="status-row" data-key="TAF">
            <span>TAF</span>
            <span class="status-dot ${color(results.TAF)}"></span>
        </div>
        <div class="status-row" data-key="FIDS">
            <span>FIDS</span>
            <span class="status-dot ${color(results.FIDS)}"></span>
        </div>
        <div class="status-row" data-key="SONO">
            <span>Sonomètres</span>
            <span class="status-dot ${color(results.SONO)}"></span>
        </div>
    `;
}

function color(state) {
    switch (state) {
        case "OK": return "green";
        case "DOWN": return "red";
        default: return "orange";
    }
}
