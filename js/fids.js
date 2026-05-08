// ======================================================
// FIDS PRO++ — Tri, ETA/ETD, couleurs ATC, animation boarding
// ======================================================

import { ENDPOINTS } from "./config.js";
import { fetchJSON, updateStatusPanel } from "./helpers.js";

const IS_DEV = location.hostname.includes("localhost");
const log = (...a) => IS_DEV && console.log("[FIDS]", ...a);
const logErr = (...a) => console.error("[FIDS ERROR]", ...a);

// ------------------------------------------------------
// Chargement sécurisé
// ------------------------------------------------------
export async function safeLoadFids() {
    try {
        await loadFids();
        log("FIDS chargé");
    } catch (err) {
        logErr("Erreur FIDS :", err);
    }
}

// ------------------------------------------------------
// Chargement brut
// ------------------------------------------------------
export async function loadFids() {
    const data = await fetchJSON(ENDPOINTS.fids);
    updateFidsUI(data);
    updateStatusPanel("FIDS", data);
}

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------
function parseTime(t) {
    if (!t) return 9999;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

// ------------------------------------------------------
// UI PRO++
// ------------------------------------------------------
export function updateFidsUI(data) {
    const el = document.getElementById("fids");
    if (!el) return;

    el.innerHTML = "";

    if (!Array.isArray(data) || !data.length) {
        el.innerHTML = `<div class="fids-row">Aucun départ disponible</div>`;
        return;
    }

    // Tri automatique par heure (ETD si dispo, sinon time)
    data.sort((a, b) => {
        const ta = parseTime(a.etd || a.time);
        const tb = parseTime(b.etd || b.time);
        return ta - tb;
    });

    const isFallback = data.some(f => f.fallback);

    data.forEach(f => {
        const status = (f.status || "").toLowerCase();

        let cssClass = "fids-unknown";
        if (status.includes("on time")) cssClass = "fids-on-time";
        if (status.includes("delayed")) cssClass = "fids-delayed";
        if (status.includes("cancel")) cssClass = "fids-cancelled";
        if (status.includes("board")) cssClass = "fids-boarding";

        const row = document.createElement("div");
        row.className = `fids-row ${cssClass}`;

        // Animation boarding
        if (cssClass === "fids-boarding") {
            row.style.animation = "boardingBlink 1.2s infinite alternate";
        }

        row.innerHTML = `
            <span class="fids-flight">${f.flight || "—"}</span>
            <span class="fids-dest">${f.destination || "—"}</span>
            <span class="fids-time">
                ${f.time || "—"}
                ${f.etd ? `<span class="fids-etd">ETD ${f.etd}</span>` : ""}
                ${f.eta ? `<span class="fids-eta">ETA ${f.eta}</span>` : ""}
            </span>
            <span class="fids-status">${f.status || "—"}</span>
        `;

        el.appendChild(row);
    });

    if (isFallback) {
        const fb = document.createElement("div");
        fb.className = "fids-fallback";
        fb.textContent = "Données FIDS simulées (fallback).";
        el.appendChild(fb);
    }
}
