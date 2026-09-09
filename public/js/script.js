// Returns the maximum number of nearby properties to display
// based on the current screen width.
function getNearbyPropertiesLimit() {
	return window.innerWidth >= 1024 ? 6 : 4;
}


// Initializes the accommodation carousel.
//
// Main responsibilities:
// 1. Detect pagination dots.
// 2. Scroll to the selected card when a dot is clicked.
// 3. Update the active dot while the user scrolls.
// 4. Disable carousel behavior on desktop screens.
function initAccommodationCarousel() {
	const cardsContainer = document.querySelector('.accomodations-cards');

	const paginationLinks = document.querySelectorAll(
		'.pagination-link[data-carousel-index]'
	);

	if (!cardsContainer || !paginationLinks.length) return;


	// Carousel is enabled only on mobile/tablet-sized screens.
	function updateActiveDot() {
		if (window.innerWidth > 1024) return;

		const cards = cardsContainer.querySelectorAll(
			'.accomodations-card'
		);

		if (!cards.length) return;

		// Find the card whose position is closest to the current
		// horizontal scroll position.
		let closestIndex = 0;
		let closestDistance = Infinity;

		cards.forEach((card, index) => {
			const distance = Math.abs(
				card.offsetLeft - cardsContainer.scrollLeft
			);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});


		// Highlight the pagination dot belonging to the visible card.
		paginationLinks.forEach((link, index) => {
			link.classList.toggle(
				'is-active',
				index === closestIndex
			);
		});
	}


	// Clicking a pagination dot scrolls the carousel to
	// the corresponding accommodation card.
	paginationLinks.forEach((link) => {
		link.addEventListener('click', (event) => {
			if (window.innerWidth > 1024) return;

			event.preventDefault();

			const index = Number(link.dataset.carouselIndex);

			const card = cardsContainer.querySelectorAll(
				'.accomodations-card'
			)[index];

			if (card) {
				cardsContainer.scrollTo({
					left: card.offsetLeft,
					behavior: 'smooth'
				});
			}
		});
	});


	// Update the active pagination dot whenever the user
	// horizontally scrolls through the cards.
	cardsContainer.addEventListener(
		'scroll',
		updateActiveDot,
		{ passive: true }
	);


	// Recalculate the active dot when the screen size changes.
	window.addEventListener('resize', updateActiveDot);

	// Set the correct active dot when the carousel first loads.
	updateActiveDot();
}


// Creates and returns one accommodation card from
// a single property object received from the API.
function createNearbyPropertyCard(item) {
	const property = item.Property;
	const geoInfo = item.GeoInfo;

	const card = document.createElement('article');

	card.className = 'accomodations-card';


	// Store important API data directly on the card.
	// These data attributes can later be used by JavaScript
	// for maps, filtering, selection, etc.
	card.dataset.propertyId = item.ID;
	card.dataset.lat = geoInfo.Lat;
	card.dataset.lng = geoInfo.Lng;


	// Build the card using the existing HTML class structure
	// so the current CSS continues to work without modification.
	card.innerHTML = `
		<div class="accomodations-card-content">

			<div class="card-image-container">

				<img
					class="card-image"
					src="https://beta.imgservice.rentbyowner.com/640x300/${property.FeatureImage}"
					alt="${property.PropertyName}"
				>

				<div class="image-info">

					<p class="image-info-text">
						${property.ReviewScore}
						${property.Counts.Reviews > 0
							? ` (${property.Counts.Reviews} REVIEWS)`
							: ''}
					</p>

					<div class="image-info-icons">

						<img
							class="star-icon"
							src="/assets/Icon/accomodation-icon/leaf.svg"
							alt="Eco-friendly accommodation"
						>

						<img
							class="star-icon"
							src="/assets/Icon/accomodation-icon/location.svg"
							alt="Accommodation location"
						>

						<img
							class="star-icon"
							src="/assets/Icon/accomodation-icon/love.svg"
							alt="Save accommodation"
						>

					</div>
				</div>
			</div>


			<div class="card-body">

				<div class="card-rating">

					<span class="card-score">
						${property.ReviewScore} Exceptional
					</span>

					<span class="card-review">
						${property.Counts.Reviews > 0
							? `${property.Counts.Reviews} reviews`
							: 'No reviews yet'}
					</span>

				</div>

				<h3 class="card-title">
					${property.PropertyName}
				</h3>

				<span class="card-provider">
					Booking.com
				</span>


				<div class="card-price">

					<span class="card-price-amount">
						From $${property.Price ?? property.CachePrice}
					</span>

					<span class="card-price-icon">i</span>

				</div>


				<div class="card-location">

					<span class="card-location-text">
						${getPropertyLocation(geoInfo)}
					</span>

				</div>


				<div class="card-button-container">

					<a
						class="learn-more-button"
						href="${item.Partner?.URL || '#'}"
						target="_blank"
						rel="noopener"
					>
						Learn More
					</a>

					<a
						class="see-dates-button"
						href="${item.Partner?.URL || '#'}"
						target="_blank"
						rel="noopener"
					>
						See Dates
					</a>

				</div>

			</div>
		</div>
	`;

	return card;
}


// Extracts state and city from the property's geographic data
// and returns them in the format: "State > City".
//
// If state/city information is unavailable, it uses the
// API's Display value instead.
function getPropertyLocation(geoInfo) {
	const categories = geoInfo?.Categories || [];

	const state = categories.find(
		(category) => category.Type === 'state'
	)?.Name;

	const city = categories.find(
		(category) => category.Type === 'city'
	)?.Name;

	return state && city
		? `${state} > ${city}`
		: geoInfo?.Display || 'Location unavailable';
}


// Renders the API response into the accommodation card container.
//
// It removes the old cards first, then creates and inserts
// a new card for every property returned by the API.
function renderNearbyProperties(properties) {
	const cardsContainer = document.querySelector(
		'.accomodations-cards'
	);

	if (!cardsContainer) return;

	// Remove previously rendered cards.
	cardsContainer.replaceChildren();


	// Create a new card for each property from the API response.
	properties.forEach((item) => {
		cardsContainer.appendChild(
			createNearbyPropertyCard(item)
		);
	});
}


// Fetches nearby properties from the backend according to
// the selected sorting option.
//
// The sortValue is converted into the corresponding API query
// parameter, and the responsive limit is added to the request.
async function fetchNearbyProperties(sortValue) {
	const cardsContainer = document.querySelector(
		'.accomodations-cards'
	);


	// Maps the dropdown value to the backend API query.
	const sortQuery = {
		'most-popular': 'most-popular=true',
		'highest-price': 'highest-price=true',
		'lowest-price': 'lowest-price=true'
	};

	const query =
		sortQuery[sortValue] || sortQuery['most-popular'];


	// Desktop gets 6 properties; mobile/tablet gets 4.
	const limit = getNearbyPropertiesLimit();


	// Give the user immediate feedback while the API request
	// is being processed.
	if (cardsContainer) {
		cardsContainer.innerHTML =
			'<p class="nearby-properties-message">Loading properties...</p>';
	}


	try {
		const response = await fetch(
			`/get-property?${query}&limit=${limit}`
		);

		if (!response.ok) {
			throw new Error('Failed to fetch properties');
		}


		// Convert the JSON response into a JavaScript array
		// and render the returned properties.
		const properties = await response.json();

		renderNearbyProperties(properties);

	} catch (error) {

		// Log the actual error for debugging while showing
		// a user-friendly message on the page.
		console.error(error);

		if (cardsContainer) {
			cardsContainer.innerHTML =
				'<p class="nearby-properties-message">Couldn\'t load properties, please try again</p>';
		}
	}
}


// Runs when the HTML document has finished loading.
//
// It connects the sort dropdown, initializes the carousel,
// and loads the default "Most Popular" properties.
document.addEventListener('DOMContentLoaded', () => {
	const sortSelect = document.querySelector('#sort-by');

	if (!sortSelect) return;


	// Fetch new properties whenever the user changes
	// the sorting option.
	sortSelect.addEventListener('change', () => {
		fetchNearbyProperties(sortSelect.value);
	});


	// Initialize mobile/tablet carousel functionality.
	initAccommodationCarousel();


	// Load "Most Popular" properties when the page opens.
	fetchNearbyProperties('most-popular');
});