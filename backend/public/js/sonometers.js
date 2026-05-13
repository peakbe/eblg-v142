// ======================================================
// SONOMETERS PRO+++ — Cockpit IFR EBLG
// ======================================================

import { ENDPOINTS } from "./config.js";
import { fetchJSON } from "./helpers.js";

let clusterLayer = null;

// ------------------------------------------------------
// Icônes ATC PRO
// ------------------------------------------------------
const iconGreen = window.L.icon({
    iconUrl: "./assets/sonometer_green.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const iconRed = window.L.icon({
    iconUrl: "./assets/sonometer_red.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const iconBlue = window.L.icon({
    iconUrl: "./assets/sonometer_blue.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

// ------------------------------------------------------
// Chargement sécurisé
// ------------------------------------------------------
export async function safeLoadSonometers() {
    try {
        await loadSonometers();
    } catch (e) {
        console.error("[SONO] Erreur :", e);
    }
}

// ------------------------------------------------------
// Chargement backend
// ------------------------------------------------------
export async function loadSonometers() {
    const data = await fetchJSON(ENDPOINTS.sonometers);
    updateSonometersUI(data);
}

// ------------------------------------------------------
// Mise à jour UI
// ------------------------------------------------------
export function updateSonometersUI(data) {
    if (!window.map) return;

    if (clusterLayer) window.map.removeLayer(clusterLayer);

    clusterLayer = window.L.markerClusterGroup({
        disableClusteringAtZoom: 15,
        spiderfyOnMaxZoom: false
    });

    if (!Array.isArray(data)) return;

    data.forEach(s => {
        const lat = s.lat;
        const lon = s.lon;
        const lvl = s.level ?? 40;

        if (!lat || !lon) return;

        const icon = lvl >= 55 ? iconRed : lvl >= 45 ? iconBlue : iconGreen;

        const marker = window.L.marker([lat, lon], { icon });

        marker.bindTooltip(`
            <b>${s.name || "Sonomètre"}</b><br>
            Niveau : ${lvl} dB<br>
            ${s.desc || ""}
        `);

        marker.on("click", () => openSonometerPanel(s));

        clusterLayer.addLayer(marker);
    });

    window.map.addLayer(clusterLayer);
}

// ------------------------------------------------------
// Panneau détail
// ------------------------------------------------------
function openSonometerPanel(s) {
    const el = document.getElementById("detail-panel");
    if (!el) return;

    document.getElementById("detail-title").textContent = s.name || "Sonomètre";
    document.getElementById("detail-address").textContent = s.address || "—";
    document.getElementById("detail-town").textContent = s.town || "—";
    document.getElementById("detail-status").textContent = s.status || "—";
    document.getElementById("detail-distance").textContent = s.distance || "—";

    el.classList.remove("hidden");
}
