// ======================================================
// SONOMETERS PRO++ — Cockpit IFR
// - Chargement sécurisé
// - Clustering + Heatmap
// - Intégration carte (window.map)
// - Panneau latéral compact
// ======================================================

import { ENDPOINTS } from "./config.js";
import { fetchJSON } from "./helpers.js";

const IS_DEV = location.hostname.includes("localhost");
const log = (...a) => IS_DEV && console.log("[SONO]", ...a);
const logErr = (...a) => console.error("[SONO ERROR]", ...a);

let sonoMarkers = null;
let sonoHeat = null;
let sonoDataCache = [];

// ------------------------------------------------------
// Chargement principal
// ------------------------------------------------------
export async function loadSonometers() {
    try {
        const data = await fetchJSON(ENDPOINTS.sonometers);
        sonoDataCache = Array.isArray(data) ? data : [];
        renderSonometers(sonoDataCache);
        renderSonoList(sonoDataCache);
        log("Sonomètres chargés :", sonoDataCache.length);
    } catch (err) {
        logErr("Erreur chargement sonomètres :", err);
    }
}

// ------------------------------------------------------
// Rendu carte
// ------------------------------------------------------
function renderSonometers(data) {
    if (!window.map) {
        logErr("Carte non initialisée");
        return;
    }

    // Nettoyage
    if (sonoMarkers) {
        window.map.removeLayer(sonoMarkers);
        sonoMarkers = null;
    }
    if (sonoHeat) {
        window.map.removeLayer(sonoHeat);
        sonoHeat = null;
    }

    if (!Array.isArray(data) || !data.length) return;

    // Cluster markers
    sonoMarkers = window.L.markerClusterGroup({
        disableClusteringAtZoom: 15,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
    });

    const heatPoints = [];

    data.forEach(s => {
        if (!s.lat || !s.lng) return;

        const latlng = [s.lat, s.lng];

        const marker = window.L.circleMarker(latlng, {
            radius: 6,
            color: "#00e5ff",
            weight: 1,
            fillColor: "#00e5ff",
            fillOpacity: 0.7
        });

        const level = s.level || "—";
        const name = s.name || s.id || "Sonomètre";

        marker.bindPopup(`
            <b>${name}</b><br>
            Niveau : ${level} dB<br>
            Commune : ${s.town || "—"}<br>
            Statut : ${s.status || "—"}
        `);

        marker.on("click", () => {
            updateDetailPanel(s);
        });

        sonoMarkers.addLayer(marker);

        // Heatmap
        const intensity = s.level ? Math.min(Math.max((s.level - 40) / 40, 0.1), 1) : 0.3;
        heatPoints.push([...latlng, intensity]);
    });

    sonoHeat = window.L.heatLayer(heatPoints, {
        radius: 25,
        blur: 18,
        maxZoom: 17,
        gradient: {
            0.2: "#00e676",
            0.5: "#ffeb3b",
            0.8: "#ff9800",
            1.0: "#f44336"
        }
    });

    sonoMarkers.addTo(window.map);
    sonoHeat.addTo(window.map);
}

// ------------------------------------------------------
// Toggle Heatmap (si tu veux l’utiliser ailleurs)
// ------------------------------------------------------
export function toggleHeatmap(enabled) {
    if (!window.map || !sonoHeat) return;
    if (enabled) {
        if (!window.map.hasLayer(sonoHeat)) sonoHeat.addTo(window.map);
    } else {
        if (window.map.hasLayer(sonoHeat)) window.map.removeLayer(sonoHeat);
    }
}

// ------------------------------------------------------
// Panneau latéral — liste des sonomètres
// ------------------------------------------------------
function renderSonoList(data) {
    const el = document.getElementById("sono-list");
    if (!el) return;

    el.innerHTML = "";

    if (!Array.isArray(data) || !data.length) {
        el.innerHTML = `<div class="sono-row">Aucun sonomètre disponible</div>`;
        return;
    }

    data.forEach(s => {
        const row = document.createElement("div");
        row.className = "sono-row";

        row.innerHTML = `
            <span class="sono-name">${s.name || s.id || "Sonomètre"}</span>
            <span class="sono-town">${s.town || "—"}</span>
            <span class="sono-level">${s.level ? s.level + " dB" : "—"}</span>
        `;

        row.addEventListener("click", () => {
            if (window.map && s.lat && s.lng) {
                window.map.setView([s.lat, s.lng], 15);
            }
            updateDetailPanel(s);
        });

        el.appendChild(row);
    });
}

// ------------------------------------------------------
// Détail panel
// ------------------------------------------------------
function updateDetailPanel(s) {
    const panel = document.getElementById("detail-panel");
    if (!panel) return;

    document.getElementById("detail-title").textContent = s.name || s.id || "Sonomètre";
    document.getElementById("detail-address").textContent = s.address || "—";
    document.getElementById("detail-town").textContent = s.town || "—";
    document.getElementById("detail-status").textContent = s.status || "—";
    document.getElementById("detail-distance").textContent = s.distance || "—";

    panel.classList.remove("hidden");
}
