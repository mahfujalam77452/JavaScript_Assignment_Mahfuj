const bookingNightlyRate = 2026;
const bookingGuestCounts = { guests: 1, infants: 0, pets: 0 };
let bookingCheckInDate = null;
let bookingCheckOutDate = null;
let guestModalChanged = false;

// Formats a selected date like "19 Sep 2025" for the booking card.
function formatBookingDate(value) {
	const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);

	return Number.isNaN(date.getTime())
		? ''
		: date.toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'short',
				year: 'numeric'
			});
}

// Calculates the total from valid nights and the fixed nightly rate.
function calculateTotalPrice() {
	if (!bookingCheckInDate || !bookingCheckOutDate) return;

	const nights =
		(bookingCheckOutDate - bookingCheckInDate) / 86400000;

	if (!Number.isFinite(nights) || nights < 1) return;

	const total = nights * bookingNightlyRate;

	const totalValue = document.querySelector(
		'.booking-price-row.total span:last-child'
	);

	const nightlyValue = document.querySelector(
		'.booking-price-row span:last-child'
	);

	const topPrice = document.querySelector('.booking-price');

	if (nightlyValue) {
		nightlyValue.textContent = `USD $${bookingNightlyRate}`;
	}

	if (totalValue) {
		totalValue.textContent = `USD $${total}`;
	}

	if (topPrice) {
		topPrice.innerHTML =
			`USD $${bookingNightlyRate} <span class="price-label">avg per night</span>`;
	}
}

// Keeps the guest summary text readable and correctly pluralized.
function updateGuestSummary() {
	const summary = document.querySelector(
		'.booking-guests .booking-field-value'
	);

	if (!summary) return;

	const label = (count, singular, plural) =>
		`${count} ${count === 1 ? singular : plural}`;

	let guestSummary = [
		label(bookingGuestCounts.guests, 'Guest', 'Guests')
	];

	if (bookingGuestCounts.infants) {
		guestSummary.push(
			label(bookingGuestCounts.infants, 'Infant', 'Infants')
		);
	}

	if (bookingGuestCounts.pets) {
		guestSummary.push(
			label(bookingGuestCounts.pets, 'Pet', 'Pets')
		);
	}

	summary.textContent = guestSummary.join(', ');
}

// Refreshes modal counts and disables decrements at their minimum values.
function renderGuestCounts() {
	document.querySelectorAll('.guest-filter-row').forEach((row) => {
		const type = row.dataset.type;
		const count = bookingGuestCounts[type];

		const countElement = row.querySelector('.guest-filter-count');
		const decrement = row.querySelector('.guest-filter-decrement');

		if (countElement) {
			countElement.textContent = count;
		}

		if (decrement) {
			decrement.disabled =
				type === 'guests' ? count <= 1 : count <= 0;
		}
	});
}

// Opens or closes the guest filter modal and preserves its session state.
function setGuestModalOpen(isOpen) {
	const modal = document.querySelector('#guestFilterModal');

	if (!modal) return;

	modal.classList.toggle('is-open', isOpen);
	modal.setAttribute('aria-hidden', String(!isOpen));
	document.body.classList.toggle('booking-modal-open', isOpen);

	if (isOpen) {
		renderGuestCounts();
	}

	if (!isOpen && guestModalChanged) {
		updateGuestSummary();
		guestModalChanged = false;
	}
}

// Connects date fields, guest controls, and the booking guest modal once.
function initBookingWidgets() {
	const dateRangeInput = document.querySelector('#dateRangeInput');
	const guestTrigger = document.querySelector('.booking-guests');
	const modal = document.querySelector('#guestFilterModal');

	if (!dateRangeInput || !guestTrigger || !modal) return;

	let datepicker;

	if (typeof HotelDatepicker === 'function') {
		datepicker = new HotelDatepicker(dateRangeInput, {
			startDate: new Date(),
			minNights: 1,
			selectForward: true,
			format: 'DD MMM YYYY',
			showTopbar: true,
			autoClose: true,
            

			onSelectRange: () => {
				const start = new Date(datepicker.start);
				const end = new Date(datepicker.end);

				if (
					!Number.isFinite(start.getTime()) ||
					!Number.isFinite(end.getTime()) ||
					end <= start
				) {
					return;
				}

				bookingCheckInDate = start;
				bookingCheckOutDate = end;

				const fields = document.querySelectorAll(
					'.booking-field-value'
				);

				if (fields[0]) {
					fields[0].textContent = formatBookingDate(start);
				}

				if (fields[1]) {
					fields[1].textContent = formatBookingDate(end);
				}

				calculateTotalPrice();
			}
		});

       

	

	}

	// Opens the datepicker when clicking Check-in or Check-out.
	document.querySelectorAll('.booking-field').forEach((field) => {
		field.addEventListener('click', (event) => {
			event.stopPropagation();
			datepicker?.open();
		});
	});

	dateRangeInput.addEventListener('click', (event) => {
		event.stopPropagation();
	});

	// Opens the guest modal.
	guestTrigger.addEventListener('click', () => {
		setGuestModalOpen(true);
	});

	// Closes the guest modal.
	modal
		.querySelector('.guest-filter-modal__close')
		?.addEventListener('click', () => {
			setGuestModalOpen(false);
		});

	modal
		.querySelector('.guest-filter-modal__backdrop')
		?.addEventListener('click', () => {
			setGuestModalOpen(false);
		});

	// Increases guest/infant/pet count.
	modal
		.querySelectorAll('.guest-filter-increment')
		.forEach((button) => {
			button.addEventListener('click', () => {
				const type =
					button.closest('.guest-filter-row').dataset.type;

				bookingGuestCounts[type] += 1;
				guestModalChanged = true;

				renderGuestCounts();
			});
		});

	// Decreases guest/infant/pet count.
	modal
		.querySelectorAll('.guest-filter-decrement')
		.forEach((button) => {
			button.addEventListener('click', () => {
				const type =
					button.closest('.guest-filter-row').dataset.type;

				const minimum = type === 'guests' ? 1 : 0;

				bookingGuestCounts[type] = Math.max(
					minimum,
					bookingGuestCounts[type] - 1
				);

				guestModalChanged = true;

				renderGuestCounts();
			});
		});
}

document.addEventListener('DOMContentLoaded', initBookingWidgets);