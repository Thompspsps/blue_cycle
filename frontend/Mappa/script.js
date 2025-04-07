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
var povoMarker = L.marker(povo).addTo(map).bindPopup('Povo'); // Marker for Povo

// Variables to store current route and markers
var currentRoute = null;
var currentStartMarker = null;
var currentEndMarker = null;
var existingMarkers = {}; // Map to track existing markers by coordinates

// Function to fetch machines from the API
function fetchMachines() {
    var apiUrl = 'http://localhost:3000/api/v1/machines';
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
    var range = parseInt(document.getElementById('rangeInput').value);
    var availability = document.getElementById('availabilitySelect').value;
    if (isNaN(range)) {
        alert('Inserisci un intervallo di distanza valido.');
        return;
    }
   
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
        var manualLat = parseFloat(document.getElementById("manualLat").value);
        var manualLng = parseFloat(document.getElementById("manualLng").value);
        if (!isNaN(manualLat) && !isNaN(manualLng)) {
            from.latitude = manualLat;
            from.longitude = manualLng;
            sendFilterRequest(range, from, availability);
        } else {
            alert("Inserisci latitudine e longitudine valide.");
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
    var queryParams = `?range=${range}&from[latitude]=${from.latitude}&from[longitude]=${from.longitude}`;
    if (availability !== "any") {
        queryParams += `&available=${availability}`;
    }

    var apiUrl = `http://localhost:3000/api/v1/machines${queryParams}`;
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
function generateRoute() {
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
        var manualLat = parseFloat(document.getElementById("manualLat").value);
        var manualLng = parseFloat(document.getElementById("manualLng").value);
        if (!isNaN(manualLat) && !isNaN(manualLng)) {
            from.latitude = manualLat;
            from.longitude = manualLng;
            getSelectedDestination(from);
        } else {
            alert("Inserisci latitudine e longitudine valide.");
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

    currentStartMarker = L.marker([from.latitude, from.longitude]).addTo(map).bindPopup('Partenza');
    currentEndMarker = L.marker([to.latitude, to.longitude]).addTo(map).bindPopup('Destinazione');

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
