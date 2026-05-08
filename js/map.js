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

// ------------------------------------------------------
// RESET ZOOM (doit être en DEHORS de initMap)
// ------------------------------------------------------
export function resetMapView() {
    if (!window.map) return;
    window.map.setView([50.637, 5.443], 13);
}
