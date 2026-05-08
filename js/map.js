// public/js/map.js

import { RUNWAYS, drawRunway, drawCorridor } from "./runways.js";

export function initMap() {
    if (!window.L) {
        console.error("[MAP] Leaflet non chargé");
        return;
    }

    const mapEl = document.getElementById("map");
    if (!mapEl) {
        console.error("[MAP] #map introuvable");
        return;
    }

    // Initialisation carte
    const map = window.L.map("map", {
        center: [50.645, 5.46],
        zoom: 12,
        zoomControl: true
    });

    // *** CRITIQUE ***
    window.map = map;   // ← tu avais window._map, mais ton app utilise window.map

    // Fond OSM
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    // Couches globales
    window.runwayLayer = window.L.layerGroup().addTo(map);
    window.corridorLayer = window.L.layerGroup().addTo(map);

    // Piste par défaut
    drawRunway("22", window.runwayLayer);
    drawCorridor("22", window.corridorLayer);

    console.log("[MAP] Carte initialisée");
}
// ======================================================
// RUNWAY PRO++ — Direction décollage / atterrissage
// ======================================================

const RWY04 = [50.64594, 5.44321];
const RWY22 = [50.63302, 5.46163];

let runwayLayer = null;
let runwayArrow = null;

export function drawRunwayDirection(active) {
    if (!window.map) return;

    // Nettoyage
    if (runwayLayer) window.map.removeLayer(runwayLayer);
    if (runwayArrow) window.map.removeLayer(runwayArrow);

    let start, end, color, label;

    if (active === "04") {
        start = RWY22;
        end = RWY04;
        color = "#00e676"; // vert = départ
        label = "RWY 04 → NE";
    } else if (active === "22") {
        start = RWY04;
        end = RWY22;
        color = "#2979ff"; // bleu = arrivée
        label = "RWY 22 → SW";
    } else {
        return;
    }

    // Ligne de piste
    runwayLayer = window.L.polyline([start, end], {
        color,
        weight: 4,
        opacity: 0.9
    }).addTo(window.map);

    // Flèche directionnelle
    runwayArrow = window.L.polylineDecorator(runwayLayer, {
        patterns: [
            {
                offset: "50%",
                repeat: 0,
                symbol: window.L.Symbol.arrowHead({
                    pixelSize: 18,
                    polygon: false,
                    pathOptions: { stroke: true, color }
                })
            }
        ]
    }).addTo(window.map);

    // Label
    window.L.marker(end, {
        icon: window.L.divIcon({
            className: "runway-label",
            html: `<div style="
                color:${color};
                font-size:14px;
                font-weight:600;
                text-shadow:0 0 4px black;
            ">${label}</div>`
        })
    }).addTo(window.map);
}

// ------------------------------------------------------
// RESET ZOOM (doit être en DEHORS de initMap)
// ------------------------------------------------------
export function resetMapView() {
    if (!window.map) return;
    window.map.setView([50.637, 5.443], 13);
}
