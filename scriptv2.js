// Keiyo Line Stations
const keiyoLine = [
    { name: "Tokyo Station", position: { lat: 35.681236, lng: 139.767125 } },
    { name: "Hatchobori Station", position: { lat: 35.6764, lng: 139.7778 } },
    { name: "Etchujima Station", position: { lat: 35.6694, lng: 139.7922 } },
    { name: "Shiomi Station", position: { lat: 35.6583, lng: 139.8144 } },
    { name: "Shin-Kiba Station", position: { lat: 35.6458, lng: 139.8269 } },
    { name: "Kasai-Rinkai Park Station", position: { lat: 35.6442, lng: 139.8611 } },
    { name: "Maihama Station", position: { lat: 35.6361, lng: 139.8806 } },
    { name: "Shin-Urayasu Station", position: { lat: 35.6494, lng: 139.9133 } },
    { name: "Ichikawashiohama Station", position: { lat: 35.6611, lng: 139.9389 } },
    { name: "Nishi-Funabashi Station", position: { lat: 35.7061, lng: 139.9594 } },
    { name: "Futamatashimmachi Station", position: { lat: 35.6933, lng: 139.9706 } },
    { name: "Minami-Funabashi Station", position: { lat: 35.6811, lng: 139.9956 } },
    { name: "Shin-Narashino Station", position: { lat: 35.6483, lng: 140.0206 } },
    { name: "Kaihimmakuhari Station", position: { lat: 35.6483, lng: 140.0333 } },
    { name: "Kemigawahama Station", position: { lat: 35.6411, lng: 140.0506 } },
    { name: "Inagekaigan Station", position: { lat: 35.6311, lng: 140.0667 } },
    { name: "Chibaminato Station", position: { lat: 35.6078, lng: 140.1067 } },
    { name: "Soga Station", position: { lat: 35.5815, lng: 140.1311 } },
];





function populateStationOptions() {
    const startStationSelect = document.getElementById('startStation');
    const endStationSelect = document.getElementById('endStation');

    startStationSelect.innerHTML = '';
    endStationSelect.innerHTML = '';

    keiyoLine.forEach(station => {
        const optionStart = document.createElement('option');
        optionStart.value = station.name;
        optionStart.textContent = station.name;

        const optionEnd = document.createElement('option');
        optionEnd.value = station.name;
        optionEnd.textContent = station.name;

        startStationSelect.appendChild(optionStart);
        endStationSelect.appendChild(optionEnd);
        startStationSelect.value = 'Soga Station';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof google !== 'undefined' && google.maps) {
        initMap(); // Only call initMap if Google Maps is loaded
    } else {
        console.error('Google Maps API not loaded correctly.');
    }
});

function performSearch() {
    console.log("performSearch function called");

    const startStation = document.getElementById('startStation').value;
    const endStation = document.getElementById('endStation').value;
    const searchType = document.getElementById('searchInput').value.trim();
    const maxDistance = parseInt(document.getElementById('maxDistance').value, 10) || 1000;

    const startCoords = keiyoLine.find(station => station.name === startStation)?.position;
    const endCoords = keiyoLine.find(station => station.name === endStation)?.position;

    if (startCoords && endCoords && searchType) {
        const stationsInRange = getStationsInRange(startStation, endStation);
        searchNearbyPlaces(stationsInRange, searchType, maxDistance);
    } else {
        alert('Please select valid start and end stations and enter a search term.');
    }
}

function getStationsInRange(startStationName, endStationName) {
    const startStation = keiyoLine.find(station => station.name === startStationName);
    const endStation = keiyoLine.find(station => station.name === endStationName);

    if (!startStation || !endStation) return [];

    const startIndex = keiyoLine.indexOf(startStation);
    const endIndex = keiyoLine.indexOf(endStation);

    if (startIndex > endIndex) {
        return keiyoLine.slice(endIndex, startIndex + 1);
    } else {
        return keiyoLine.slice(startIndex, endIndex + 1);
    }
}

function isPlaceNearPath(placeLocation, path, maxDistance) {
    let nearPath = false;

    for (let i = 0; i < path.length - 1; i++) {
        const segmentStart = new google.maps.LatLng(path[i].lat, path[i].lng);
        const segmentEnd = new google.maps.LatLng(path[i + 1].lat, path[i + 1].lng);

        const distance = google.maps.geometry.spherical.computeDistanceBetween(placeLocation, segmentStart) +
                         google.maps.geometry.spherical.computeDistanceBetween(placeLocation, segmentEnd);

        if (distance <= maxDistance) {
            nearPath = true;
            break;
        }
    }

    return nearPath;
}

function searchNearbyPlaces(stations, searchQuery, maxDistance) {
    const placesList = document.querySelector('#placesList ul');

    if (!placesList) {
        console.error('placesList element not found');
        return;
    }

    placesList.innerHTML = ''; // Clear previous results

    // Ensure google.maps.PlacesService is available
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.error('Google Maps API or PlacesService not available');
        return;
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'));

    stations.forEach(station => {
        const request = {
            location: new google.maps.LatLng(station.position.lat, station.position.lng),
            radius: String(maxDistance), // Use the max distance from the input box
            query: searchQuery,
        };

        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(place => {
                    let shortestDistance = Infinity;
                    
                    stations.forEach(station => {
                        const stationLocation = new google.maps.LatLng(station.position.lat, station.position.lng);
                        const placeLocation = place.geometry.location;

                        const distance = google.maps.geometry.spherical.computeDistanceBetween(stationLocation, placeLocation);

                        if (distance < shortestDistance) {
                            shortestDistance = distance;
                        }
                    });

                    if (shortestDistance <= maxDistance) {
                        addPlaceToList(place);
                    }
                });
            } else {
                console.error('Places search failed:', status);
            }
        });
    });
}





function addPlaceToList(place) {
    const placesList = document.querySelector('#placesList ul');

    if (!placesList) {
        console.error('placesList ul element not found');
        return;
    }

    let nearestStation = null;
    let shortestDistance = Infinity;

    keiyoLine.forEach(station => {
        const stationLocation = new google.maps.LatLng(station.position.lat, station.position.lng);
        const placeLocation = place.geometry.location;

        const distance = google.maps.geometry.spherical.computeDistanceBetween(stationLocation, placeLocation);

        if (distance < shortestDistance) {
            nearestStation = station.name;
            shortestDistance = distance;
        }
    });

    const distanceInMeters = Math.round(shortestDistance);

    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    listItem.innerHTML = `
        <div class="d-flex align-items-start">
            <img src="${place.photos && place.photos.length > 0 
                ? place.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 }) 
                : 'https://via.placeholder.com/100'}" 
                alt="${place.name}" class="mr-3" style="width: 100px; height: 100px; object-fit: cover;">
            <div>
                <h5>${place.name}</h5>
                <p>Nearest Station: ${nearestStation}</p>
                <p>Distance: ${distanceInMeters} meters</p>
                <p>${place.formatted_address || place.vicinity}</p>
            </div>
        </div>
    `;

    listItem.addEventListener('click', () => {
        getPlaceDetails(place.place_id);
    });

    placesList.appendChild(listItem);
}

function getPlaceDetails(placeId) {
    const service = new google.maps.places.PlacesService(document.createElement('div'));

    const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'geometry', 'opening_hours', 'photos', 'rating', 'reviews', 'types', 'website', 'place_id']
    };

    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            showPlaceDetails(place);
        } else {
            console.error('Failed to get place details:', status);
        }
    });
}







function showPlaceDetails(place) {
    const placeName = document.getElementById('placeName');
    const placeCategory = document.getElementById('placeCategory');
    const placeAddress = document.getElementById('placeAddress');
    const placeContact = document.getElementById('placeContact');
    const placeOpeningHours = document.getElementById('placeOpeningHours');
    const placeRating = document.getElementById('placeRating');
    const placeReviews = document.getElementById('placeReviews');
    const placePhotos = document.getElementById('placePhotos');
    const placePriceLevel = document.getElementById('placePriceLevel');
    const placeFeatures = document.getElementById('placeFeatures');
    const openInMaps = document.getElementById('openInMaps');
    const smallMapContainer = document.getElementById('smallMap');

    placeName.textContent = place.name;
    placeCategory.textContent = place.types ? place.types.join(', ') : 'Category not available';
    placeAddress.textContent = place.formatted_address || 'Address not available';
    placeContact.textContent = place.formatted_phone_number || 'Phone number not available';

    if (place.opening_hours && place.opening_hours.weekday_text) {
        placeOpeningHours.innerHTML = `Opening Hours:<br>${place.opening_hours.weekday_text.join('<br>')}`;
    } else {
        placeOpeningHours.textContent = 'Opening hours not available';
    }

    placeRating.textContent = place.rating ? `Rating: ${place.rating} ⭐` : 'No rating available';

    placeReviews.innerHTML = '';
    if (place.reviews && place.reviews.length > 0) {
        place.reviews.slice(0, 3).forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.classList.add('review');
            reviewDiv.innerHTML = `<p><strong>${review.author_name}:</strong> ${review.text}</p>`;
            placeReviews.appendChild(reviewDiv);
        });
    } else {
        placeReviews.textContent = 'No reviews available';
    }

    placePhotos.innerHTML = '';
    if (place.photos && place.photos.length > 0) {
        place.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo.getUrl({ maxWidth: 400, maxHeight: 300 });
            placePhotos.appendChild(img);
        });
    } else {
        placePhotos.textContent = 'No photos available';
    }

    placeFeatures.textContent = place.types ? `Features: ${place.types.join(', ')}` : 'Features not available';

    openInMaps.onclick = function() {
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
        window.open(googleMapsLink, '_blank');
    };

    const smallMap = new google.maps.Map(smallMapContainer, {
        center: place.geometry.location,
        zoom: 16,
        disableDefaultUI: true,
    });

    new google.maps.Marker({
        position: place.geometry.location,
        map: smallMap,
        title: place.name,
    });

    const infoPanel = document.getElementById('infoPanel');
    infoPanel.classList.add('open');
}


document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check if dark mode is already enabled (using local storage to remember the user's preference)
    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true; // Set the switch to checked if dark mode is enabled
    } else {
        darkModeToggle.checked = false; // Ensure the switch is unchecked if dark mode is not enabled
    }

    // Toggle dark mode on switch change
    darkModeToggle.addEventListener('change', function() {
        if (darkModeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('dark-mode', 'enabled');
        } else {
            body.classList.remove('dark-mode');
            localStorage.removeItem('dark-mode');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const closePanelButton = document.getElementById('closePanel');
    const infoPanel = document.getElementById('infoPanel');

    // Close the side panel when the close button is clicked
    closePanelButton.addEventListener('click', function() {
        infoPanel.classList.remove('open'); // This will slide the panel out
    });
});


