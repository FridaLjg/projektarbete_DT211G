"use strict";

//funktion som bygger karta
function buildMap(lat, lon, pad = 1, layer = 'mapnik') {
    const left = lon - pad;
    const right = lon + pad;
    const bottom = lat - pad;
    const top = lat + pad;
    const bbox = [left, bottom, right, top].join('%2C');
    const marker = `${lat}%2C${lon}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${layer}&marker=${marker}`;
}

//funktion som hämtar koordinater och uppdaterar karta
async function loadData(city) {
    const urlMap = new URL("https://geocoding-api.open-meteo.com/v1/search");
    urlMap.searchParams.set("name", city);
    urlMap.searchParams.set("count", "1");

    //Anropa och läs ut data
    try {
        const response = await fetch(urlMap.toString());
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            document.getElementById("weather").innerHTML =
                "<p><strong>Fel:</strong> Platsen hittades inte.</p>";
            return;
        }

        const location = data.results?.[0];
        const lat = location.latitude;
        const lon = location.longitude;

        const frame = document.getElementById("map");
        frame.src = buildMap(lat, lon);

        //Hämtar väder
        getWeather(lat, lon);

    } catch (error) {
        console.error("Fel " + error);
    }
}

//funktion som hämtar väder
async function getWeather(lat, lon) {
    const urlWeather = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode`;

    try {
        const response = await fetch(urlWeather);
        const data = await response.json();

        const temp = data.current.temperature_2m;
        const code = data.current.weathercode;
        const weatherText = interpretWeatherCode(code);


        document.getElementById("weather").innerHTML = `
        <p><strong>Just nu är det:</strong> ${weatherText}</p>           
        <p><strong>Temperatur:</strong> ${temp} °C</p>`;
    }

    catch (error) {
        console.error("Fel " + error);
    }
}

//funktion som tolkar väderkod
function interpretWeatherCode(code) {
    const weatherCodes = {
        0: "Klar himmel",
        1: "Mestadels klart",
        2: "Delvis molnigt",
        3: "Mulet",
        45: "Dimma",
        48: "Dimma",
        51: "Duggregn",
        53: "Duggregn",
        55: "Duggregn",
        56: "Underkylt duggregn",
        57: "Underkylt duggregn",
        61: "Lätt regn",
        63: "Måttligt regn",
        65: "Kraftigt regn",
        66: "Underkylt regn",
        67: "Underkylt regn",
        71: "Lätt snöfall",
        73: "Måttligt snöfall",
        75: "Kraftigt snöfall",
        77: "Snö",
        80: "Lätt skur",
        81: "Måttligt skur",
        82: "Kraftig skur",
        85: "Lätta snöbyar",
        86: "Kraftiga snöbyar",
        95: "Åska",
        96: "Åska med lätt hagel",
        99: "Åska med kraftigt hagel"
    };

    return weatherCodes[code];
}


//Händelsehanterare
document.addEventListener("DOMContentLoaded", async () => {
    const input = document.getElementById("search");
    const button = document.getElementById("search-button");

    button.addEventListener('click', () => {
        const city = input.value;

        loadData(city);
    })
});