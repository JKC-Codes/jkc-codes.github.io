// Start service worker
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/serviceworker.js');
}


// Start javascript events
document.addEventListener('DOMContentLoaded', function() {
	// Define DOM elements
	var menuButton = document.querySelector('#site-nav-menu-button');
	var menuButtonText = menuButton.querySelector('#site-nav-menu-button-text');
	var menuContent = document.querySelector('#site-nav-content');

	// Activate site nav menu
	var siteNavMenu = new Menu(menuButton, menuButtonText, menuContent, '48rem');
}, {once: true});


// Menu class
function Menu(stateController, stateControllerText, contentHolder, mediaQueryValue) {
	// Name arguments
	this.button = stateController;
	this.text = stateControllerText;
	this.container = contentHolder;
	this.minWidth = mediaQueryValue;

	// Start viewport width listener
	var mediaQuery = window.matchMedia('(min-width: '+ this.minWidth +')');
	mediaQuery.addListener(this.reactToViewport.bind(this));
	this.reactToViewport(mediaQuery);

	// Start menu button click listener
	this.button.addEventListener('click', this.reactToMenuButton.bind(this));

	// Create fixed variables so listeners can be removed later
	this.reactToClickOffMenu = function(event) {
		this._reactToClickOffMenu(event);
	}.bind(this);

	this.reactToEscapeKey = function(event) {
		this._reactToEscapeKey(event);
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
				this.updateButtonText('Close');
				this.updateListeners('add');
			}.bind(this), 50);
		}

		else if(newState === 'closed') {
			// Prevent transition on viewport change
			if(this.state === 'fixed') {
				this.updateDOM('remove');
			}
			this.updateView('closed');
			this.updateButtonText('Open');
			this.updateListeners('remove');
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
			this.updateListeners('remove');
		}

		this._state = newState;
	}
}


// Menu listeners that change state
Menu.prototype.reactToViewport = function(mediaQuery) {
	if(mediaQuery.matches) {
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

Menu.prototype._reactToEscapeKey = function(event) {
	if(event.key === 'Escape' || event.key === 'Esc') {
		this.state = 'closed';
	}
}

Menu.prototype.reactToScrollOutOfView = function(intersection) {
	if((intersection[0].boundingClientRect.top + window.pageYOffset) >= 0) {
		this.state = 'closed';
	}
}


// Menu handlers that react to state change handler
Menu.prototype.updateDOM = function(action) {
	if(action === 'add') {
		this.container.removeAttribute('style', 'display: none');
	}
	else if(action === 'remove') {
		this.container.style.display = 'none';
	}
}

Menu.prototype.updateView = function(state) {
	if(state === 'open') {
		this.button.setAttribute('aria-expanded', 'true');
	}
	else if(state === 'closed') {
		this.button.setAttribute('aria-expanded', 'false');
	}
}

Menu.prototype.updateButtonText = function(text) {
	this.text.textContent = text;
}

Menu.prototype.updateListeners = function(action) {
	if(action === 'add') {
		document.addEventListener('click', this.reactToClickOffMenu);
		document.addEventListener('keyup', this.reactToEscapeKey);
		if('IntersectionObserver' in window) {
			this.observer = new IntersectionObserver(this.reactToScrollOutOfView.bind(this), {threshold: 0.3});
			this.observer.observe(this.container);
		}
	}
	else if(action === 'remove') {
		document.removeEventListener('click', this.reactToClickOffMenu);
		document.removeEventListener('keyup', this.reactToEscapeKey);
		if(this.observer) {
			this.observer.unobserve(this.container);
		}
	}
}

Menu.prototype.getTransitionLength = function() {
	var containerStyles = window.getComputedStyle(this.container);
	var transitionDelay = parseFloat(containerStyles.transitionDelay);
	var transitionDuration = parseFloat(containerStyles.transitionDuration);

	this.transitionLength = (transitionDelay + transitionDuration) * 1000;
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