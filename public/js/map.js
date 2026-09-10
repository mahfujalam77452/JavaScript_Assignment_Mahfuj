let propertiesMap = null;
let mapMarkers = [];
const propertyIdToMarker = new Map();
let highlightedMarker = null;
let highlightedCard = null;
let highlightTimeout = null;
let activePropertyId = null;
let propertyInfoWindow = null;

window.activePropertyId = null;
const defaultMapCenter = { lat: 28.5383, lng: -81.3792 };

function getHighlightedMarkerIcon() {
	return {
		url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="56" viewBox="0 0 40 56"><path fill="#1976d2" stroke="#ffffff" stroke-width="2" d="M20 1C9.5 1 1 9.5 1 20c0 14 19 35 19 35s19-21 19-35C39 9.5 30.5 1 20 1z"/><circle cx="20" cy="20" r="6" fill="#ffffff"/></svg>'
		)}`,
		scaledSize: new google.maps.Size(30, 42),
		anchor: new google.maps.Point(15, 42)
	};
}

// Prevent map-specific code from throwing when Google Maps has not loaded.
function hasGoogleMaps() {
	return typeof google !== 'undefined' && google.maps && propertiesMap;
}

// Remove markers from the previous property list before rebuilding them.
function clearMapMarkers() {
	propertyInfoWindow?.close();
	mapMarkers.forEach((marker) => marker.setMap(null));
	mapMarkers = [];
	propertyIdToMarker.clear();
	highlightedMarker = null;
}

// Escape card text before placing it inside the InfoWindow HTML.
function escapeInfoWindowText(value) {
	return String(value || '').replace(/[&<>'"]/g, (character) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		"'": '&#39;',
		'"': '&quot;'
	}[character]));
}

// Build the compact property preview shown after a marker click.
function createPropertyPreview(card) {
	const image = card.querySelector('.card-image');
	const title = card.querySelector('.card-title')?.textContent.trim();
	const score = card.querySelector('.card-score')?.textContent.trim();
	const price = card.querySelector('.card-price-amount')?.textContent.trim();
	const location = card.querySelector('.card-location-text')?.textContent.trim();

	return `
		<div class="map-property-preview">
			<img class="map-property-preview__image" src="${escapeInfoWindowText(image?.src)}" alt="${escapeInfoWindowText(title)}">
			<div class="map-property-preview__details">
				<strong class="map-property-preview__title">${escapeInfoWindowText(title || 'Nearby property')}</strong>
				<span class="map-property-preview__score">${escapeInfoWindowText(score || 'Rating unavailable')}</span>
				<strong class="map-property-preview__price">${escapeInfoWindowText(price || 'Price unavailable')}</strong>
				<span class="map-property-preview__location">${escapeInfoWindowText(location || 'Location unavailable')}</span>
			</div>
		</div>
	`;
}

// Temporarily emphasize the card selected by a map marker.
function highlightCard(card) {
	if (highlightedCard && highlightedCard !== card) {
		highlightedCard.classList.remove('is-highlighted');
	}

	highlightedCard = card;
	activePropertyId = card.dataset.propertyId || null;
	window.activePropertyId = activePropertyId;
	card.classList.add('is-highlighted');
	clearTimeout(highlightTimeout);
	highlightTimeout = setTimeout(() => {
		card.classList.remove('is-highlighted');
		if (highlightedCard === card) {
			highlightedCard = null;
			activePropertyId = null;
			window.activePropertyId = null;
		}
	}, 2500);
}

// Change the marker color that corresponds to the card under the pointer.
function highlightMarker(marker) {
	if (highlightedMarker && highlightedMarker !== marker) {
		highlightedMarker.setIcon(null);
	}

	highlightedMarker = marker;
	marker.setIcon(getHighlightedMarkerIcon());
}

// Create markers from the currently rendered cards and wire marker clicks.
function renderMapMarkers() {
	if (!hasGoogleMaps()) return;

	clearMapMarkers();
	const bounds = new google.maps.LatLngBounds();
	let markerCount = 0;
	const cards = document.querySelectorAll('.accomodations-card');

	cards.forEach((card) => {
		const lat = Number.parseFloat(card.dataset.lat);
		const lng = Number.parseFloat(card.dataset.lng);
		const propertyId = card.dataset.propertyId;

		if (!propertyId || Number.isNaN(lat) || Number.isNaN(lng)) return;

		const marker = new google.maps.Marker({
			position: { lat, lng },
			map: propertiesMap,
			title: card.querySelector('.card-title')?.textContent.trim() || 'Nearby property'
		});

		mapMarkers.push(marker);
		propertyIdToMarker.set(propertyId, marker);
		bounds.extend({ lat, lng });
		markerCount += 1;

		marker.addListener('click', () => {
			const matchingCard = Array.from(cards).find(
				(cardItem) => cardItem.dataset.propertyId === propertyId
			);
			if (!matchingCard) return;

			propertyInfoWindow.setContent(createPropertyPreview(matchingCard));
			propertyInfoWindow.open({ anchor: marker, map: propertiesMap });
			highlightCard(matchingCard);
			matchingCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
		});
	});

	if (markerCount > 0) {
		propertiesMap.fitBounds(bounds);
	} else {
		propertiesMap.setCenter(defaultMapCenter);
		propertiesMap.setZoom(11);
	}
}

// Keep card hover behavior delegated so it survives dynamic card re-renders.
function initMapCardSync() {
	const cardsContainer = document.querySelector('.accomodations-cards');
	if (!cardsContainer || cardsContainer.dataset.mapSyncReady === 'true') return;

	cardsContainer.dataset.mapSyncReady = 'true';
	cardsContainer.addEventListener('mouseenter', (event) => {
		const card = event.target.closest('.accomodations-card');
		if (!card || !cardsContainer.contains(card)) return;

		const marker = propertyIdToMarker.get(card.dataset.propertyId);
		if (marker) highlightMarker(marker);
	}, true);

	cardsContainer.addEventListener('mouseleave', (event) => {
		const card = event.target.closest('.accomodations-card');
		if (!card || !cardsContainer.contains(card)) return;

		const marker = propertyIdToMarker.get(card.dataset.propertyId);
		if (marker && highlightedMarker === marker) {
			marker.setIcon(null);
			highlightedMarker = null;
		}
	}, true);

	const observer = new MutationObserver(() => {
		if (propertiesMap) renderMapMarkers();
	});
	observer.observe(cardsContainer, { childList: true });
}

// Google Maps calls this global function after the dynamic script loads.
window.initMap = function initMap() {
	const mapElement = document.getElementById('map');
	if (!mapElement || typeof google === 'undefined' || !google.maps) return;

	propertiesMap = new google.maps.Map(mapElement, {
		center: defaultMapCenter,
		zoom: 11,
		mapTypeControl: false,
		streetViewControl: false,
		fullscreenControl: false
	});
	propertyInfoWindow = new google.maps.InfoWindow();

	initMapCardSync();
	renderMapMarkers();
};

// Fetch the key from Express and load Google Maps only after receiving it.
async function loadGoogleMapsScript() {
	if (typeof google !== 'undefined' && google.maps) {
		window.initMap();
		return;
	}

	try {
		const response = await fetch('/api/maps-key');
		if (!response.ok) return;

		const { key } = await response.json();
		if (!key) return;

		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=initMap`;
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
	} catch (error) {
		// Property cards remain usable if the map service is unavailable.
	}
}

document.addEventListener('DOMContentLoaded', () => {
	initMapCardSync();
	loadGoogleMapsScript();
});
