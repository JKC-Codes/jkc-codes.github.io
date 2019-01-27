document.addEventListener('DOMContentLoaded', initialise, {once: true});

let header;
let button;
let menu;

function initialise() {
	// Define DOM elements
	header = document.querySelector('#site-header');
	button = header.querySelector('#site-nav-menu-button');
	menu = header.querySelector('#site-nav-menu');

	// Ensure header is always shown on wide screens
	let headerIsWide = window.matchMedia('(min-width: 36rem)');
	headerIsWide.addListener(fixHeader);
	fixHeader(headerIsWide);

	// Prevent transition on initial page load
	if(!headerIsWide.matches) {
		menu.style.display = 'none';
	}

	// Enable menu button
	button.addEventListener('click', toggleNav);
}

function toggleNav() {
	if(header.dataset.navMenuOpen === 'false') {
		openMenu();
	} else {
		closeMenu();
	}
}

function openMenu() {
	menu.removeAttribute('style', 'display: none');
	setTimeout(function() {
		header.dataset.navMenuOpen = 'true';
	}, 10);
}

function closeMenu() {
	let transitionDelay = window.getComputedStyle(menu).transitionDelay;
	let transitionDuration = window.getComputedStyle(menu).transitionDuration;
	let transitionLength = (parseFloat(transitionDelay) + parseFloat(transitionDuration)) * 1000;

	header.dataset.navMenuOpen = 'false';
	setTimeout(function() {
		if(header.dataset.navMenuOpen === 'false') {
			menu.style.display = 'none';
		}
	}, transitionLength);
}

function fixHeader(mediaQuery) {
	if(mediaQuery.matches) {
		openMenu();
	} else {
		closeMenu();
	}
}