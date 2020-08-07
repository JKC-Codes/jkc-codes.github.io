function fillServiceWorkerCache() {
	// Using a set prevents duplicates
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

	navigator.serviceWorker.controller.postMessage({
		command: 'fillInitialCache',
		payload: Array.from(initialCache)
	});
}


// Site navigation menu
var MENU = {
	init: function init(stateController, stateText, contentContainer, mediaQueryValue) {
		this.button = stateController;
		this.text = stateText;
		this.menu = contentContainer;
		this.minWidth = mediaQueryValue;

		// Create fixed references so listeners can be removed later
		this.handleButtonClick = function handleButtonClick(event) {
			this._handleButtonClick(event);
		}.bind(this);

		this.handleClickOffMenu = function handleClickOffMenu(event) {
			this._handleClickOffMenu(event);
		}.bind(this);

		this.handleEscapeKey = function handleEscapeKey(event) {
			this._handleEscapeKey(event);
		}.bind(this);

		this.handleScrollAway = function handleScrollAway(event) {
			this._handleScrollAway(event);
		}.bind(this);

		this.handleTransitionEnd = function handleTransitionEnd(event) {
			this._handleTransitionEnd(event);
		}.bind(this);

		// Start viewport width listener
		this.mediaQuery = window.matchMedia('(min-width: '+ this.minWidth +')');
		this.mediaQuery.addListener(this.handleViewportChange.bind(this));

		// Trigger menu activation
		this.button.removeAttribute('hidden');
		this.handleViewportChange(this.mediaQuery);
	},

	openMenu: function openMenu() {
		// Add menu back to the DOM
		this.menu.style.display = '';

		// Force a repaint so transitions work
		var styles = window.getComputedStyle(this.menu);
		styles.getPropertyValue('display');

		this.button.setAttribute('aria-expanded', 'true');
		this.text.textContent = 'Close';

		document.addEventListener('click', this.handleClickOffMenu, {passive: true});
		document.addEventListener('keyup', this.handleEscapeKey, {passive: true});
		if('IntersectionObserver' in window) {
			this.observer = new IntersectionObserver(this.handleScrollAway, {threshold: 0.2});
			this.observer.observe(this.menu);
		}
	},

	closeMenu: function closeMenu() {
		this.button.setAttribute('aria-expanded', 'false');
		this.text.textContent = 'Open';

		document.removeEventListener('click', this.handleClickOffMenu, {passive: true});
		document.removeEventListener('keyup', this.handleEscapeKey, {passive: true});
		if(this.observer) {
			this.observer.unobserve(this.menu);
		}

		// If mobile and not initial load
		if(!this.mediaQuery.matches && this.menu.style.display !== 'none') {
			if(this.transitionLength === undefined) {
				this.getTransitionLength();
			}

			// Wait for transition end before removing from DOM
			if(this.transitionLength > 0) {
				this.menu.addEventListener('transitionend', this.handleTransitionEnd, {once: true});
			}
			else {
				this.menu.style.display = 'none';
			}
		}
	},

	_handleButtonClick: function _handleButtonClick() {
		this.button.getAttribute('aria-expanded') === 'false' ? this.openMenu() : this.closeMenu();
	},

	_handleClickOffMenu: function _handleClickOffMenu() {
		if(!event.target.closest('#site-nav-menu')) {
			this.closeMenu();
		}
	},

	_handleEscapeKey: function _handleEscapeKey() {
		if(event.key === 'Escape' || event.key === 'Esc') {
			this.closeMenu();
		}
	},

	_handleScrollAway: function _handleScrollAway(event) {
		if(event[0].intersectionRatio > 0 && event[0].intersectionRatio <= 0.2) {
			this.closeMenu();
		}
	},

	_handleTransitionEnd: function _handleTransitionEnd() {
		// Ensure menu is still closed
		if(this.button.getAttribute('aria-expanded') === 'false') {
			this.menu.style.display = 'none';
		}
		this.menu.removeEventListener('transitionend', this.handleTransitionEnd);
	},

	handleViewportChange: function handleViewportChange(mediaQuery) {
		if(mediaQuery.matches) {
			this.menu.style.display = '';
			this.button.removeEventListener('click', this.handleButtonClick, {passive: true});
		}
		else {
			this.menu.style.display = 'none';
			this.button.addEventListener('click', this.handleButtonClick, {passive: true});
		}
		this.closeMenu();
	},

	getTransitionLength: function getTransitionLength() {
		var contentStyles = window.getComputedStyle(this.menu);
		var transitionDelay = parseFloat(contentStyles.transitionDelay);
		var transitionDuration = parseFloat(contentStyles.transitionDuration);

		this.transitionLength = (transitionDelay + transitionDuration) * 1000;
	}
}


// Polyfill for Element.closest used in clicks off menu
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


if('serviceWorker' in navigator) {
	// Start service worker
	navigator.serviceWorker.register('/serviceworker.js');

	// Cache files downloaded before service worker activated
	if(!navigator.serviceWorker.controller) {
		navigator.serviceWorker.addEventListener('controllerchange', fillServiceWorkerCache, {once: true})
	}
}


document.addEventListener('DOMContentLoaded', function() {
	// Create nav menu
	var menuButton = document.querySelector('#site-nav-menu-button');
	var menuButtonText = menuButton.querySelector('#site-nav-menu-button-text');
	var menuContent = document.querySelector('#site-nav-content');
	var siteNavMenu = Object.create(MENU);

	siteNavMenu.init(menuButton, menuButtonText, menuContent, '48rem');

}, {once: true});