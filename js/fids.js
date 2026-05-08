// ======================================================
// FIDS PRO+++
// 10 prochains vols confirmés
// Séparation Arrivées / Départs
// Icônes ATC minimalistes
// Tri ETA/ETD
// ======================================================

import { ENDPOINTS } from "./config.js";
import { fetchJSON, updateStatusPanel } from "./helpers.js";

export async function safeLoadFids() {
    try {
        await loadFids();
    } catch (err) {
        console.error("[FIDS ERROR]", err);
    }
}

export async function loadFids() {
    const data = await fetchJSON(ENDPOINTS.fids);
    updateFidsUI(data);
    updateStatusPanel("FIDS", data);
}

function parseTime(t) {
    if (!t) return 9999;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

export function updateFidsUI(data) {
    const arrEl = document.getElementById("fids-arrivals");
    const depEl = document.getElementById("fids-departures");
    if (!arrEl || !depEl) return;

    arrEl.innerHTML = `<div class="fids-section-title">Arrivées</div>`;
    depEl.innerHTML = `<div class="fids-section-title">Départs</div>`;

    if (!Array.isArray(data) || !data.length) {
        depEl.innerHTML += `<div class="fids-row">Aucun vol disponible</div>`;
        return;
    }

    // Séparation Arrivées / Départs
    const arrivals = data.filter(f => f.type === "arrival");
    const departures = data.filter(f => f.type === "departure");

    // Tri par ETA/ETD
    arrivals.sort((a, b) => parseTime(a.eta || a.time) - parseTime(b.eta || b.time));
    departures.sort((a, b) => parseTime(a.etd || a.time) - parseTime(b.etd || b.time));

    // Limiter à 10 vols confirmés
    const nextArrivals = arrivals.slice(0, 10);
    const nextDepartures = departures.slice(0, 10);

    // Icônes ATC minimalistes
    const icons = {
        arrival: "🛬",
        departure: "🛫",
        boarding: "🟦",
        delayed: "🟧",
        cancelled: "🟥",
        "on time": "🟩"
    };

    function render(list, container) {
        list.forEach(f => {
            const status = (f.status || "").toLowerCase();

            let cssClass = "fids-unknown";
            if (status.includes("on time")) cssClass = "fids-on-time";
            if (status.includes("delayed")) cssClass = "fids-delayed";
            if (status.includes("cancel")) cssClass = "fids-cancelled";
            if (status.includes("board")) cssClass = "fids-boarding";

            const icon = icons[f.type] || "✈️";

            const row = document.createElement("div");
            row.className = `fids-row ${cssClass}`;

            if (cssClass === "fids-boarding") {
                row.style.animation = "boardingBlink 1.2s infinite alternate";
            }

            row.innerHTML = `
                <span class="fids-icon">${icon}</span>
                <span class="fids-flight">${f.flight || "—"}</span>
                <span class="fids-dest">${f.destination || "—"}</span>
                <span class="fids-time">
                    ${f.time || "—"}
                    ${f.etd ? `<span class="fids-etd">ETD ${f.etd}</span>` : ""}
                    ${f.eta ? `<span class="fids-eta">ETA ${f.eta}</span>` : ""}
                </span>
            `;

            container.appendChild(row);
        });
    }

    render(nextArrivals, arrEl);
    render(nextDepartures, depEl);
}
