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


// ===== Gallery Modal (Task 5) =====

let galleryImages = [];
let currentImageIndex = 0;
let isLoadingGallery = false;
let galleryTouchStartX = 0;
let galleryTransitionLocked = false;

// Loads all gallery image paths once when the page needs them.
async function loadGalleryImages() {
	if (galleryImages.length > 0 || isLoadingGallery) return galleryImages;

	isLoadingGallery = true;
	try {
		const response = await fetch('/images');
		if (!response.ok) throw new Error('Failed to load gallery images');
		galleryImages = await response.json();
	} finally {
		isLoadingGallery = false;
	}

	return galleryImages;
}

// Opens the gallery on desktop and reuses the image list loaded at page start.
async function openGalleryModal() {
	const modal = document.querySelector('#galleryModal');
	if (!modal || window.innerWidth < 1024 || isLoadingGallery) return;

	modal.classList.add('is-open');
	modal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('modal-open');

	try {
		await loadGalleryImages();
		renderGalleryImages();
	} catch (error) {
		const track = modal.querySelector('.gallery-modal__track');
		if (track) track.textContent = "Couldn't load images";
	} finally {
		isLoadingGallery = false;
	}
}

// Renders the API images inside the existing mobile/tablet hero carousel.
function renderInlineGallery() {
	const track = document.querySelector('.gallery-carousel__track');
	if (!track || galleryImages.length === 0) return;

	track.replaceChildren();
	galleryImages.forEach((imageUrl, index) => {
		const image = document.createElement('img');
		image.src = imageUrl;
		image.alt = `Gallery image ${index + 1}`;
		track.append(image);
	});
	updateInlineGallery();
}

// Moves the inline carousel and keeps its five dots synchronized.
function updateInlineGallery() {
	const track = document.querySelector('.gallery-carousel__track');
	const dots = Array.from(document.querySelectorAll('.carousel-dots .dot'));
	if (!track) return;

	track.style.transform = `translateX(-${currentImageIndex * 100}%)`;
	const firstIndex = Math.min(
		Math.max(currentImageIndex - 2, 0),
		Math.max(galleryImages.length - dots.length, 0)
	);
	dots.forEach((dot, dotIndex) => {
		const imageIndex = firstIndex + dotIndex;
		dot.dataset.inlineIndex = imageIndex;
		dot.setAttribute('aria-label', `Show image ${imageIndex + 1}`);
		dot.classList.toggle('active', imageIndex === currentImageIndex);
	});
}

// Changes the inline mobile/tablet image while staying within the image list.
function showInlineImage(index) {
	if (galleryImages.length === 0) return;
	currentImageIndex = Math.max(0, Math.min(index, galleryImages.length - 1));
	updateInlineGallery();
}

// Connects the inline arrows, dots, and swipe gesture without opening a modal.
function initInlineGallery() {
	const carousel = document.querySelector('.gallery-carousel');
	if (!carousel) return;

	carousel.querySelector('.gallery-carousel__arrow--prev')?.addEventListener('click', () => {
		showInlineImage(currentImageIndex - 1);
	});
	carousel.querySelector('.gallery-carousel__arrow--next')?.addEventListener('click', () => {
		showInlineImage(currentImageIndex + 1);
	});
	carousel.querySelectorAll('.carousel-dots .dot').forEach((dot) => {
		dot.addEventListener('click', () => showInlineImage(Number(dot.dataset.inlineIndex)));
	});

	carousel.addEventListener('touchstart', (event) => {
		galleryTouchStartX = event.changedTouches[0].screenX;
	}, { passive: true });
	carousel.addEventListener('touchend', (event) => {
		const distance = event.changedTouches[0].screenX - galleryTouchStartX;
		if (Math.abs(distance) >= 50) {
			showInlineImage(currentImageIndex + (distance < 0 ? 1 : -1));
		}
	}, { passive: true });
}

// Builds the slider images and resets the gallery to its first image.
function renderGalleryImages() {
	const track = document.querySelector('.gallery-modal__track');
	if (!track) return;
	track.replaceChildren();
	currentImageIndex = 0;

	if (galleryImages.length === 0) {
		track.textContent = 'No images available';
		updateGalleryPosition();
		return;
	}

	galleryImages.forEach((imageUrl, index) => {
		const image = document.createElement('img');
		image.src = imageUrl;
		image.alt = `Gallery image ${index + 1}`;
		track.append(image);
	});
	updateGalleryPosition();
	renderGalleryDots();
}

// Moves the slider and refreshes its counter and active dot.
function updateGalleryPosition() {
	const track = document.querySelector('.gallery-modal__track');
	const counter = document.querySelector('.gallery-modal__counter');
	if (!track) return;
	track.style.transform = `translateX(-${currentImageIndex * 100}%)`;
	if (counter) counter.textContent = galleryImages.length
		? `${currentImageIndex + 1} / ${galleryImages.length}`
		: '';
	document.querySelectorAll('.gallery-modal__dot').forEach((dot) => {
		dot.classList.toggle('active', Number(dot.dataset.index) === currentImageIndex);
	});
}

// Renders a maximum of five dots in a moving window around the active image.
function renderGalleryDots() {
	const dotsContainer = document.querySelector('.gallery-modal__dots');
	if (!dotsContainer) return;
	dotsContainer.replaceChildren();
	const visibleCount = Math.min(5, galleryImages.length);
	const firstIndex = Math.min(
		Math.max(currentImageIndex - 2, 0),
		Math.max(galleryImages.length - visibleCount, 0)
	);

	for (let index = firstIndex; index < firstIndex + visibleCount; index += 1) {
		const dot = document.createElement('button');
		dot.type = 'button';
		dot.className = 'gallery-modal__dot';
		dot.dataset.index = index;
		dot.setAttribute('aria-label', `Show image ${index + 1}`);
		dot.addEventListener('click', () => {
			currentImageIndex = index;
			updateGalleryPosition();
			renderGalleryDots();
		});
		dotsContainer.append(dot);
	}
}

// Advances one image, stopping at the last image.
function showNextImage() {
	if (galleryTransitionLocked || currentImageIndex >= galleryImages.length - 1) return;
	galleryTransitionLocked = true;
	currentImageIndex += 1;
	updateGalleryPosition();
	renderGalleryDots();
	window.setTimeout(() => { galleryTransitionLocked = false; }, 300);
}

// Moves back one image, stopping at the first image.
function showPrevImage() {
	if (galleryTransitionLocked || currentImageIndex <= 0) return;
	galleryTransitionLocked = true;
	currentImageIndex -= 1;
	updateGalleryPosition();
	renderGalleryDots();
	window.setTimeout(() => { galleryTransitionLocked = false; }, 300);
}

// Closes the gallery and unlocks the page behind the modal.
function closeGalleryModal() {
	const modal = document.querySelector('#galleryModal');
	if (!modal) return;
	modal.classList.remove('is-open');
	modal.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('modal-open');
}

// Connects the gallery trigger, controls, backdrop, and swipe gestures once.
function initGalleryModal() {
	const modal = document.querySelector('#galleryModal');
	const trigger = document.querySelector('.gallery-view-all');
	const track = modal?.querySelector('.gallery-modal__track');
	if (!modal || !trigger || !track) return;

	trigger.addEventListener('click', openGalleryModal);
	modal.querySelector('.gallery-modal__close')?.addEventListener('click', closeGalleryModal);
	modal.querySelector('.gallery-modal__backdrop')?.addEventListener('click', closeGalleryModal);
	modal.querySelector('.gallery-modal__arrow--next')?.addEventListener('click', showNextImage);
	modal.querySelector('.gallery-modal__arrow--prev')?.addEventListener('click', showPrevImage);
	track.addEventListener('touchstart', (event) => {
		galleryTouchStartX = event.changedTouches[0].screenX;
	}, { passive: true });
	track.addEventListener('touchend', (event) => {
		const distance = event.changedTouches[0].screenX - galleryTouchStartX;
		if (Math.abs(distance) < 50) return;
		if (distance < 0) showNextImage();
		else showPrevImage();
	}, { passive: true });
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

	// Initialize the image gallery modal controls.
	initGalleryModal();
	initInlineGallery();
	loadGalleryImages()
		.then(renderInlineGallery)
		.catch(() => {});
});