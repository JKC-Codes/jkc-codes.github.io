// Start service worker
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/serviceworker.js');
}


// Start javascript events
document.addEventListener('DOMContentLoaded', function() {
	// Define DOM elements
	menuButton = document.querySelector('#site-nav-menu-button');
	menuButtonText = menuButton.querySelector('#site-nav-menu-button-text');
	menuContent = document.querySelector('#site-nav-content');

	// Activate site nav menu
	new Menu(menuButton, menuButtonText, menuContent, '48rem');
}, {once: true});


// Menu class
function Menu(stateController, stateControllerText, contentHolder, mediaQuery) {
	// Name arguments
	this.button = stateController;
	this.text = stateControllerText;
	this.container = contentHolder;
	this.mediaQuery = mediaQuery;

	// Start viewport width listener
	this.pageIsWide = window.matchMedia('(min-width: '+ this.mediaQuery +')');
	this.pageIsWide.addListener(this.reactToViewport.bind(this));
	this.reactToViewport(this.pageIsWide);

	// Start menu button click listener
	this.button.addEventListener('click', this.reactToMenuButton.bind(this));

	// Create a fixed variable so viewport width listener can be removed later
	this.reactToClickOffMenu = function(event) {
		this._reactToClickOffMenu(event);
	}.bind(this);
}


// Menu state change handler
Menu.prototype = {
	get state() {
		return this._state;
	},

	set state(newState) {
		if(newState === 'open') {
			this.updateDOM('add');
			// Wait for menu to be added to DOM before referencing it
			setTimeout(function() {
				this.updateView('open');
				this.updateButtonText('close');
				this.setListenerClickOffMenu();
				this.setListenerScrollOutOfView();
			}.bind(this), 50);
		}

		else if(newState === 'closed') {
			// Prevent transition on viewport change
			if(this.state === 'fixed') {
				this.updateDOM('remove');
			}
			this.updateView('closed');
			this.updateButtonText('open');
			this.removeListenerClickOffMenu();
			this.removeListenerScrollOutOfView();
			// Get transition time for timeout
			if(this.transitionLength === undefined && document.readyState === 'complete') {
				this.getTransitionLength();
			}
			// Ensure menu is removed from DOM only after transition has finished
			setTimeout(function() {
				// Check that state hasn't changed during transition
				if(this.state === 'closed') {
					this.updateDOM('remove');
				}
			}.bind(this), this.transitionLength);
		}

		else if(newState === 'fixed') {
			this.updateDOM('add');
			this.removeListenerClickOffMenu();
			this.removeListenerScrollOutOfView();
		}

		this._state = newState;
	}
}


// Menu listeners that change state
Menu.prototype.reactToViewport = function() {
	if(this.pageIsWide.matches) {
		this.state = 'fixed';
	}
	else {
		this.state = 'closed';
	}
}

Menu.prototype.reactToMenuButton = function() {
	if(this.state === 'open') {
		this.state = 'closed';
	}
	else {
		this.state = 'open';
	}
}

Menu.prototype._reactToClickOffMenu = function(event) {
	if(!event.target.closest('#site-nav-content')) {
		this.state = 'closed';
	}
}

Menu.prototype.reactToScrollOutOfView = function(intersection) {
	if(intersection[0].boundingClientRect.top + window.pageYOffset >= 0) {
		this.state = 'closed';
	}
}


// Menu handlers that react to state change handler
Menu.prototype.updateDOM = function(action) {
	if(action === 'add') {
		this.container.removeAttribute('style', 'display: none');
	}
	else {
		this.container.style.display = 'none';
	}
}

Menu.prototype.updateView = function(name) {
	if(name === 'open') {
		this.button.setAttribute('aria-expanded', 'true');
	}
	else {
		this.button.setAttribute('aria-expanded', 'false');
	}
}

Menu.prototype.updateButtonText = function(text) {
	if(text === 'open') {
		this.text.textContent = 'Open';
	}
	else {
		this.text.textContent = 'Close';
	}
}


// Menu utilities
Menu.prototype.getTransitionLength = function() {
	var transitionDelay = window.getComputedStyle(this.container).transitionDelay;
	var transitionDuration = window.getComputedStyle(this.container).transitionDuration;
	this.transitionLength = (parseFloat(transitionDelay) + parseFloat(transitionDuration)) * 1000;
}

Menu.prototype.setListenerClickOffMenu = function() {
	document.addEventListener('click', this.reactToClickOffMenu);
}

Menu.prototype.removeListenerClickOffMenu = function() {
	document.removeEventListener('click', this.reactToClickOffMenu);
}

Menu.prototype.setListenerScrollOutOfView =function() {
	if('IntersectionObserver' in window) {
		this.observer = new IntersectionObserver(this.reactToScrollOutOfView.bind(this), {threshold: 0.3});
		this.observer.observe(this.container);
	}
}

Menu.prototype.removeListenerScrollOutOfView =function() {
	if(this.observer) {
		this.observer.unobserve(this.container);
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