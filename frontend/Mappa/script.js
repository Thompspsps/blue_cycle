// Initialize the map
var map = L.map('map').setView([46.0704, 11.1213], 13);
const token = localStorage.getItem('Token');

// Add the OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Coordinates of Povo (default location)
var povo = L.latLng(46.067014, 11.155030);
var startPoint = povo;

// Marker for Povo with a custom color
var povoMarker = L.circleMarker(povo, {
    color: 'red', // Change the color to red
    radius: 10,   // Adjust the size of the marker
    fillColor: 'red',
    fillOpacity: 0.8
}).addTo(map).bindPopup('Povo');

// Variables to store current route and markers
var currentRoute = null;
var currentStartMarker = null;
var currentEndMarker = null;
var existingMarkers = {}; // Map to track existing markers by coordinates

// Function to fetch machines from the API
function fetchMachines() {
    var apiUrl = 'http://127.0.0.1:3000/api/v1/machines';
    fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Errore nella risposta dell\'API: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            displayMachines(data.data);
        } else {
            alert("Errore nella risposta dell'API: " + data.message);
        }
    })
    .catch(error => {
        console.error('Errore nella chiamata API:', error);
        alert("Errore nella chiamata API: " + error.message);
    });
}

// Function to display machines on the map and in the dropdown
function displayMachines(machines) {
    // Clear the poiSelect dropdown
    const poiSelect = document.getElementById("poiSelect");
    poiSelect.innerHTML = '<option value="">Seleziona un punto di interesse</option>';

    // Remove existing markers (except Povo marker)
    for (let coordKey in existingMarkers) {
        map.removeLayer(existingMarkers[coordKey]);
    }
    existingMarkers = {}; // Clear existing markers

    // Loop through each machine and update markers
    machines.forEach(function (machine) {
        var lat = machine.position.latitude;
        var lng = machine.position.longitude;
        var coordKey = `${lat},${lng}`; // Unique key for coordinates

        // Create a new marker
        var marker = L.marker([lat, lng]).bindPopup(`Descrizione: ${machine.description}, Disponibile: ${machine.available}`);
        marker.addTo(map);

        // Track the new marker
        existingMarkers[coordKey] = marker;

        // Add the machine to the dropdown
        var option = document.createElement("option");
        option.value = JSON.stringify(machine);
        option.text = machine.description; // Use the machine description as dropdown text
        poiSelect.appendChild(option);
    });
}

// Call fetchMachines when the page loads to populate the map and dropdown
fetchMachines();

// Function to handle the change in start point selection
function handleStartSelectChange() {
    var startSelect = document.getElementById("startSelect").value;
    var manualCoords = document.getElementById("manualCoords");
    
    if (startSelect === "manual") {
        manualCoords.style.display = "block";
    } else {
        manualCoords.style.display = "none";
    }
}

// Function to apply the filter based on range and availability
function applyFilter() {
    var rangeInput = document.getElementById('rangeInput').value;
    var range = rangeInput ? parseInt(rangeInput) : null; // Make range optional
    var availability = document.getElementById('availabilitySelect').value;

    var from = { latitude: 0, longitude: 0 };
    var startSelect = document.getElementById("startSelect").value;

    // Get the user's location or manual coordinates for the filter
    if (startSelect === "geolocation") {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                from.latitude = position.coords.latitude;
                from.longitude = position.coords.longitude;
                sendFilterRequest(range, from, availability);
            }, function (error) {
                handleLocationError(error);
            });
        } else {
            alert("Il browser non supporta la geolocalizzazione.");
            return;
        }
    } else if (startSelect === "manual") {
        // Usa le coordinate trovate tramite la via
        if (typeof window.manualLat === "number" && typeof window.manualLng === "number") {
            from.latitude = window.manualLat;
            from.longitude = window.manualLng;
            sendFilterRequest(range, from, availability);
        } else {
            alert("Cerca e seleziona un indirizzo valido prima di continuare.");
            return;
        }
    } else {
        from.latitude = povo.lat;
        from.longitude = povo.lng;
        sendFilterRequest(range, from, availability);
    }
}

// Send the filter request to the API
function sendFilterRequest(range, from, availability) {
    // Costruisci la query string nel formato richiesto
    let queryParams = `?proximity[from][latitude]=${from.latitude}&proximity[from][longitude]=${from.longitude}`;
    if (range !== null && !isNaN(range)) {
        queryParams = `?proximity[range]=${range}&` + queryParams.slice(1);
    }
    if (availability !== "any") {
        queryParams += `&available=${availability}`;
    }

    // Log dell'URL per il debug
    var apiUrl = `http://127.0.0.1:3000/api/v1/machines${queryParams}`;
    console.log("API URL con filtro:", apiUrl);

    // Effettua la richiesta all'API
    fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Errore nella risposta dell\'API: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            displayMachines(data.data);
        } else {
            alert("Errore nella risposta dell'API: " + data.message);
        }
    })
    .catch(error => {
        console.error('Errore nella chiamata API:', error);
        alert("Errore nella chiamata API: " + error.message);
    });
}

// Function to generate the route between the selected start point and destination
async function generateRoute() {
    var startSelect = document.getElementById("startSelect").value;
    var from = { latitude: 0, longitude: 0 };

    if (startSelect === "geolocation") {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                from.latitude = position.coords.latitude;
                from.longitude = position.coords.longitude;
                getSelectedDestination(from);
            }, function (error) {
                handleLocationError(error);
            });
        } else {
            alert("Il browser non supporta la geolocalizzazione.");
            return;
        }
    } else if (startSelect === "manual") {
        // Ottieni la via inserita
        const address = document.getElementById('manualAddress').value;
        if (!address) {
            alert("Inserisci una via o un indirizzo.");
            return;
        }
        // Limita la ricerca a Trento e provincia
        const query = `${address}, Trento, Italia`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&addressdetails=1&q=${encodeURIComponent(query)}`;
        try {
            const response = await fetch(url, {
                headers: { 'Accept-Language': 'it' }
            });
            const data = await response.json();
            const filtered = data.filter(item =>
                item.display_name.toLowerCase().includes('trento')
            );
            if (filtered.length > 0) {
                from.latitude = parseFloat(filtered[0].lat);
                from.longitude = parseFloat(filtered[0].lon);
                getSelectedDestination(from);
            } else {
                alert("Indirizzo non trovato nella provincia di Trento.");
                return;
            }
        } catch (err) {
            alert("Errore nella ricerca dell'indirizzo.");
            return;
        }
    } else {
        from.latitude = povo.lat;
        from.longitude = povo.lng;
        getSelectedDestination(from);
    }
}

// Function to get the selected destination and draw the route
function getSelectedDestination(from) {
    var poiSelect = document.getElementById("poiSelect");
    var selectedMachine = JSON.parse(poiSelect.value);

    if (selectedMachine) {
        var to = {
            latitude: selectedMachine.position.latitude,
            longitude: selectedMachine.position.longitude
        };
        drawRoute(from, to);
    } else {
        alert("Seleziona una destinazione valida.");
    }
}

// Function to draw the route on the map
function drawRoute(from, to) {
    if (currentRoute) {
        map.removeControl(currentRoute);
        currentRoute = null;
    }

    if (currentStartMarker) map.removeLayer(currentStartMarker);
    if (currentEndMarker) map.removeLayer(currentEndMarker);

    // Punto di partenza come puntino rosso
    currentStartMarker = L.circleMarker([from.latitude, from.longitude], {
        color: 'red', // Bordo rosso
        radius: 6,    // Dimensione del puntino
        fillColor: 'red', // Riempimento rosso
        fillOpacity: 0.8  // Opacità del riempimento
    }).addTo(map).bindPopup('Partenza');

    // Punto di destinazione come marker standard
    currentEndMarker = L.marker([to.latitude, to.longitude]).addTo(map).bindPopup('Destinazione');

    // Disegna il percorso tra i due punti
    currentRoute = L.Routing.control({
        waypoints: [
            L.latLng(from.latitude, from.longitude),
            L.latLng(to.latitude, to.longitude)
        ],
        router: L.Routing.osrmv1({
            serviceUrl: `https://router.project-osrm.org/route/v1/`
        })
    }).addTo(map);
}

// Modal functions
function openFilterModal() {
    document.getElementById('filterModal').style.display = 'block';
}

function closeFilterModal() {
    document.getElementById('filterModal').style.display = 'none';
}

// Function to reset the map to the initial state
function resetMap() {
    // Reset view to the initial coordinates and zoom level
    map.setView([46.0704, 11.1213], 13);

    // Clear existing markers (except Povo marker)
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker && layer !== povoMarker) {
            map.removeLayer(layer);
        }
    });

    // Remove existing route
    if (currentRoute) {
        map.removeControl(currentRoute);
        currentRoute = null;
    }

    // Only add the initial Povo marker
    if (!existingMarkers['46.067014,11.155030']) {
        povoMarker.addTo(map);
    }

    // Clear the poiSelect dropdown
    const poiSelect = document.getElementById("poiSelect");
    poiSelect.innerHTML = '<option value="">Seleziona un punto di interesse</option>';

    fetchMachines();
}

// Function to get coordinates from an address
async function getCoordsFromAddress() {
    const address = document.getElementById('manualAddress').value;
    if (!address) {
        window.manualLat = null;
        window.manualLng = null;
        return;
    }
    // Limita la ricerca a Trento e provincia
    const query = `${address}, Trento, Italia`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&addressdetails=1&q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url, {
            headers: { 'Accept-Language': 'it' }
        });
        const data = await response.json();
        // Filtra ulteriormente per provincia di Trento se necessario
        const filtered = data.filter(item =>
            item.display_name.toLowerCase().includes('trento')
        );
        if (filtered.length > 0) {
            window.manualLat = parseFloat(filtered[0].lat);
            window.manualLng = parseFloat(filtered[0].lon);
        } else {
            window.manualLat = null;
            window.manualLng = null;
        }
    } catch (err) {
        window.manualLat = null;
        window.manualLng = null;
    }
}

// Address suggestions functionality
document.addEventListener('DOMContentLoaded', function() {
    const manualAddressInput = document.getElementById('manualAddress');
    const suggestionsDiv = document.getElementById('addressSuggestions');
    let suggestionsList = [];
    let selectedSuggestion = -1;

    manualAddressInput.addEventListener('input', async function() {
        const query = manualAddressInput.value.trim();
        suggestionsDiv.innerHTML = '';
        suggestionsList = [];
        selectedSuggestion = -1;
        if (query.length < 3) return;

        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&addressdetails=1&limit=8&q=${encodeURIComponent(query + ', Trentino, Italia')}`;
        try {
            const response = await fetch(url, { headers: { 'Accept-Language': 'it' } });
            const data = await response.json();
            const filtered = data.filter(item =>
                (item.address && (
                    (item.address.state && item.address.state.toLowerCase().includes('trento')) ||
                    (item.address.county && item.address.county.toLowerCase().includes('trento')) ||
                    (item.display_name && item.display_name.toLowerCase().includes('trento'))
                )) &&
                item.type === "road"
            );
            if (filtered.length > 0) {
                suggestionsList = filtered;
                filtered.forEach((item, idx) => {
                    const div = document.createElement('div');
                    const regex = new RegExp(`(${query})`, 'ig');
                    div.innerHTML = item.display_name.replace(regex, '<b>$1</b>');
                    div.addEventListener('click', () => {
                        manualAddressInput.value = item.display_name;
                        suggestionsDiv.innerHTML = '';
                        window.manualLat = parseFloat(item.lat);
                        window.manualLng = parseFloat(item.lon);
                    });
                    suggestionsDiv.appendChild(div);
                });
            }
        } catch (err) {
            // Silenzia errori di rete
        }
    });

    manualAddressInput.addEventListener('keydown', function(e) {
        if (!suggestionsList.length) return;
        const items = suggestionsDiv.querySelectorAll('div');
        if (e.key === "ArrowDown") {
            selectedSuggestion = (selectedSuggestion + 1) % items.length;
            updateActiveSuggestion(items);
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            selectedSuggestion = (selectedSuggestion - 1 + items.length) % items.length;
            updateActiveSuggestion(items);
            e.preventDefault();
        } else if (e.key === "Enter") {
            if (selectedSuggestion >= 0 && items[selectedSuggestion]) {
                items[selectedSuggestion].click();
                e.preventDefault();
            }
        }
    });

    function updateActiveSuggestion(items) {
        items.forEach((item, idx) => {
            if (idx === selectedSuggestion) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (!manualAddressInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.innerHTML = '';
            suggestionsList = [];
            selectedSuggestion = -1;
        }
    });
});
