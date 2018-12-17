document.addEventListener('DOMContentLoaded', initialise, {once: true});

let header;
let button;

function initialise() {
	header = document.querySelector('#site-header');
	button = header.querySelector('#site-nav-menu-button');
	header.dataset.navMenuOpen = 'false';
	button.addEventListener('click', toggleNav);
}

function toggleNav() {
	if(header.dataset.navMenuOpen === 'true') {
		header.dataset.navMenuOpen = 'false';
	} else {
		header.dataset.navMenuOpen = 'true';
	}
}