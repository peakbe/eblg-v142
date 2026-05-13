import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS (optionnel)
app.use(cors());

// STATIC FRONTEND
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// --------------------------------------------------
// ADS-B Airlabs PRO+++ (cache + normalisation)
// --------------------------------------------------

let adsbCache = null;
let adsbCacheTime = 0;

app.get("/api/adsb", async (req, res) => {
    const now = Date.now();

    // Cache 10 s
    if (adsbCache && now - adsbCacheTime < 10000) {
        return res.json(adsbCache);
    }

    try {
        const url = `https://airlabs.co/api/v9/flights?api_key=${process.env.AIRLABS_KEY}`;

        const r = await fetch(url);

        if (!r.ok) {
            console.error("[ADSB] Airlabs HTTP", r.status);
            if (adsbCache) return res.json(adsbCache);
            return res.status(502).json({ error: "Airlabs upstream error" });
        }

        const json = await r.json();
        const flights = json.response || [];

        // Normalisation → format attendu par map.js : { ac: [...] }
        const ac = flights
            .map(f => {
                if (!f.lat || !f.lng) return null;

                return {
                    icao: f.hex || null,
                    hex: f.hex || null,
                    call: f.flight_icao || f.flight_iata || "",
                    lat: f.lat,
                    lon: f.lng,
                    alt_baro: f.alt || null,
                    gs: f.speed || null,
                    track: f.dir || null,
                    type: f.aircraft_icao || null
                };
            })
            .filter(Boolean);

        const payload = { ac };

        adsbCache = payload;
        adsbCacheTime = now;

        res.json(payload);

    } catch (e) {
        console.error("[ADSB] Airlabs fetch failed", e);
        if (adsbCache) return res.json(adsbCache);
        res.status(500).json({ error: "ADSB fetch failed" });
    }
});

// FALLBACK SPA
app.get("*", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

// START
app.listen(PORT, () => {
    console.log(`[SERVER] Listening on port ${PORT}`);
});
