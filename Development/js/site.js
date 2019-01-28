document.addEventListener('DOMContentLoaded', initialise, {once: true});

let header;
let button;
let menu;
let	headerIsWide = window.matchMedia('(min-width: 36rem)');

function initialise() {
	// Define DOM elements
	header = document.querySelector('#site-header');
	button = header.querySelector('#site-nav-menu-button');
	menu = header.querySelector('#site-nav-menu');

	// Ensure header is always shown on wide screens
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

	// Close menu when out of viewport
	if('IntersectionObserver' in window) {
		let observer = new IntersectionObserver(menuObserver,{rootMargin: '-120px'});
		observer.observe(menu);
	}
}

function closeMenu() {
	let transitionDelay = window.getComputedStyle(menu).transitionDelay;
	let transitionDuration = window.getComputedStyle(menu).transitionDuration;
	let transitionLength = (parseFloat(transitionDelay) + parseFloat(transitionDuration)) * 1000;

	if(!headerIsWide.matches) {
		header.dataset.navMenuOpen = 'false';
		setTimeout(function() {
			if(header.dataset.navMenuOpen === 'false') {
				menu.style.display = 'none';
			}
		}, transitionLength);
	}
}

function fixHeader(mediaQuery) {
	if(mediaQuery.matches) {
		openMenu();
	} else {
		closeMenu();
	}
}


function menuObserver(intersections, subject) {
	for(i = 0; i < intersections.length; i++) {
		if(!intersections[i].isIntersecting && header.dataset.navMenuOpen === 'true') {
			closeMenu();
			subject.disconnect();
		}
	};
};