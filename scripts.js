// Function to get query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const apiKey = getQueryParam('apiKey');
console.log('API Key:', apiKey); // Add this line to debug

if (!apiKey) {
    alert('API Key is required');
    throw new Error('API Key is required');
}

mapboxgl.accessToken = apiKey;
console.log('Mapbox Access Token:', mapboxgl.accessToken); // Add this line to debug

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-74.5, 40],
    zoom: 9
});

const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    }
});
map.addControl(draw);

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    placeholder: 'Enter address'
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

geocoder.on('result', function(e) {
    map.flyTo({
        center: e.result.center,
        zoom: 18
    });
    document.getElementById('search-container').classList.add('minimized');
    document.getElementById('instructions').classList.remove('hidden');
});

map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);

function updateArea(e) {
    const data = draw.getAll();
    if (data.features.length > 0) {
        const area = turf.area(data);
        const rounded_area = Math.round(area * 100) / 100;
        document.getElementById('calculated-area').innerHTML = `<p>Roof area: ${rounded_area} square meters</p>`;
        document.getElementById('info-container').classList.remove('hidden');
        document.getElementById('instructions').classList.add('hidden');
    } else {
        document.getElementById('calculated-area').innerHTML = '';
        document.getElementById('info-container').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
    }
}

document.getElementById('reset-button').addEventListener('click', function() {
    draw.deleteAll();
    document.getElementById('search-container').classList.remove('minimized');
    document.getElementById('info-container').classList.add('hidden');
    document.getElementById('instructions').classList.add('hidden');
    map.flyTo({
        center: [-74.5, 40],
        zoom: 9
    });
});

