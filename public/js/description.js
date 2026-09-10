// Toggles the extra hero description text and keeps the link label in sync.
function initDescriptionToggle() {
	const readMoreLink = document.querySelector(".read-more");
	const descriptionFull = document.querySelector(".description__full");
    const readMoreLabel = readMoreLink.querySelector(".read-more-label");
	const icon = readMoreLink.querySelector(".icon-chevron")
	readMoreLink.addEventListener("click", (event) => {
		event.preventDefault();

		
		if (descriptionFull.hidden) {
			descriptionFull.hidden = false;
			readMoreLabel.innerText = "Collapse";
			icon.src = "../assets/Icon/hero-section-icon/collapse_13726.png"
		} else {
			descriptionFull.hidden = true;
			readMoreLabel.innerText = "Read more";
			icon.src = "../assets/Icon/hero-section-icon/down-arrow.png"
		}
	});
}

document.addEventListener('DOMContentLoaded', initDescriptionToggle);
