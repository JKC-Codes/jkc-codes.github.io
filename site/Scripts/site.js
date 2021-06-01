document.addEventListener('DOMContentLoaded', activateSiteNavMenu, {once: true});

if('serviceWorker' in navigator) {
	activateServiceWorker();
}


function activateSiteNavMenu() {
	var input = document.querySelector('.js-site-nav-input');
	var label = document.querySelector('.js-site-nav-button');

	// Remove checkbox and replace label with a button
	removeFallback();

	var button = document.querySelector('.js-site-nav-button');
	var buttonText = button.querySelector('.js-site-nav-button-text');
	var menu = document.querySelector('.js-site-nav-menu');
	var mediaQuery = window.matchMedia('(min-width: 55em)');

	button.addEventListener('click', toggleNavMenu, {passive: true});

	// Internet Explorer doesn't support mediaQuery.addEventListener('change', handleViewportChange);
	mediaQuery.addListener(handleViewportChange);
	handleViewportChange();

	// If checkbox was checked before it was replaced, add listeners
	if(button.getAttribute('aria-expanded') === 'true') {
		openNavMenu();
	}


	function removeFallback() {
		var menuIsOpen = input.checked;
		var children = label.childNodes;
		var button = document.createElement('button');

		input.checked = false; // Fix Firefox persisting open menu on refresh
		input.parentNode.removeChild(input);

		button.classList.add('menu-button');
		button.classList.add('js-site-nav-button');
		button.setAttribute('type', 'button');
		button.setAttribute('aria-controls', 'site-nav-menu');
		button.setAttribute('aria-expanded', menuIsOpen.toString());
		button.setAttribute('hidden', '');
		while(children.length > 0) {
			button.appendChild(children[0]);
		}

		label.parentNode.replaceChild(button, label);
	}

	function toggleNavMenu() {
		button.getAttribute('aria-expanded') === 'true' ? closeNavMenu() : openNavMenu();
	}

	function openNavMenu() {
		button.setAttribute('aria-expanded', 'true');
		buttonText.textContent = 'Close menu';
		document.addEventListener('keydown', handleKeyDown, {passive: true});
		document.addEventListener('click', handleFocusLoss, {passive: true});
		document.addEventListener('focusin', handleFocusLoss);
	}

	function closeNavMenu() {
		button.setAttribute('aria-expanded', 'false');
		buttonText.textContent = 'Open menu';
		document.removeEventListener('keydown', handleKeyDown, {passive: true});
		document.removeEventListener('click', handleFocusLoss, {passive: true});
		document.removeEventListener('focusin', handleFocusLoss);
	}

	function handleViewportChange() {
		// If nav menu is hidden remove listeners
		if(mediaQuery.matches) {
			closeNavMenu();
		}
		// Prevent transition when header becomes menu
		else {
			// Force a repaint while transitions disabled
			window.requestAnimationFrame(function() {
				menu.classList.add('prevent-transition');
				// Add transition back after paint
				window.requestAnimationFrame(function() {
					menu.classList.remove('prevent-transition');
				});
			});
		}
	}

	function handleKeyDown(event) {
		if(event.key === 'Escape' || event.key === 'Esc') {
			closeNavMenu();
		}
	}

	function handleFocusLoss(event) {
		var isButton = event.target.closest('.js-site-nav-button');
		var isMenu = event.target.closest('.js-site-nav-menu');

		// Close menu if there's a click outside of it
		if(!isButton && !isMenu) {
			closeNavMenu();
		}
	}
}

function activateServiceWorker() {
	// Start service worker
	navigator.serviceWorker.register('/serviceworker.js');

	// Cache files downloaded before service worker activated
	if(!navigator.serviceWorker.controller) {
		navigator.serviceWorker.addEventListener('controllerchange', fillServiceWorkerCache, {once: true})
	}

	function fillServiceWorkerCache() {
		// Stop duplicates causing service worker cache.put errors
		var initialCache = new Set();

		// HTML
		initialCache.add(window.location.pathname);

		// CSS
		var stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
		stylesheets.forEach(function(stylesheet) {
			initialCache.add(stylesheet.href);
		});

		// JavaScript
		var scripts = document.querySelectorAll('script[src]');
		scripts.forEach(function(script) {
			initialCache.add(script.src);
		});

		// Images
		var images = document.querySelectorAll('img');
		images.forEach(function(image) {
			initialCache.add(image.currentSrc);
		});

		// Send files to the service worker to cache
		navigator.serviceWorker.controller.postMessage({
			command: 'fillInitialCache',
			payload: Array.from(initialCache)
		});
	}
}


// Polyfill for Element.closest
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;

		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1);
		return null;
	};
}