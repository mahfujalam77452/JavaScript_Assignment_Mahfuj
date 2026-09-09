// Toggles the extra hero description text and keeps the link label in sync.
function initDescriptionToggle() {
	const description = document.querySelector('.description');
	const toggle = description?.querySelector('.read-more');
	const fullText = description?.querySelector('.description__full');
	const label = toggle?.querySelector('.read-more-label');

	if (!toggle || !fullText || !label) return;

	toggle.addEventListener('click', (event) => {
		event.preventDefault();
		const isExpanded = toggle.classList.toggle('is-expanded');
		fullText.hidden = !isExpanded;
		label.textContent = isExpanded ? 'Collapse' : 'Read more';
	});
}

document.addEventListener('DOMContentLoaded', initDescriptionToggle);
