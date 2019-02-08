document.addEventListener('DOMContentLoaded', function() {
	// Define DOM elements
	menuHeader = document.querySelector('#site-header');
	menuButton = menuHeader.querySelector('#site-nav-menu-button');
	menuButtonText = menuButton.querySelector('#site-nav-menu-button-text');
	menuContent = menuHeader.querySelector('#site-nav-menu');

	// Activate site nav menu
	new Menu(menuHeader, menuButton, menuButtonText, menuContent, '36rem');
}, {once: true});


function Menu(stateHolder, stateController, stateControllerText, contentHolder, mediaQuery) {
	// Name arguments
	this.container = stateHolder;
	this.button = stateController;
	this.buttonText = stateControllerText;
	this.content = contentHolder;
	this.mediaQuery = mediaQuery;

	// Start viewport width listener
	this.pageIsWide = window.matchMedia('(min-width: '+ this.mediaQuery +')');
	this.pageIsWide.addListener(this.reactToViewport.bind(this));
	this.reactToViewport(this.pageIsWide);

	// Start menu button click listener
	this.button.addEventListener('click', this.reactToMenuButton.bind(this));

	// Create a fixed variable so viewport width listener can be removed later
	this.reactToOffMenu = function(event) {
		this._reactToOffMenu(event);
	}.bind(this);
}

// Menu state change handler
Menu.prototype = {
	set state(newState) {

		if(newState === 'open') {
			this.updateDOM('add');
			// Wait for menu to be added to DOM before referencing it
			setTimeout(function() {
				this.updateClass('open');
				this.updateButtonText('close');
				this.setListenerOffMenu();
			}.bind(this), 50);
		}

		else if(newState === 'closed') {
			this.updateClass('closed');
			this.updateButtonText('open');
			this.removeListenerOffMenu();
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
		// Prevent transition on viewport change
		this.updateDOM('remove');
	}
}

Menu.prototype.reactToMenuButton = function() {
	if(this._state === 'open') {
		this.state = 'closed';
	}
	else {
		this.state = 'open';
	}
}

Menu.prototype._reactToOffMenu = function(event) {
	if(!event.target.closest('#site-nav-menu')) {
		this.state = 'closed';
	}
}


// Menu handlers that react to state
Menu.prototype.updateDOM = function(action) {
	if(action === 'add') {
		this.content.removeAttribute('style', 'display: none');
	}
	else {
		this.content.style.display = 'none';
	}
}

Menu.prototype.updateClass = function(name) {
	if(name === 'open') {
		this.container.classList.remove('menu-closed');
		this.container.classList.add('menu-open');
	}
	else {
		this.container.classList.remove('menu-open');
		this.container.classList.add('menu-closed');
	}
}

Menu.prototype.updateButtonText = function(text) {
	if(text === 'open') {
		this.buttonText.textContent = 'Open';
	}
	else {
		this.buttonText.textContent = 'Close';
	}
}


// Menu utilities
Menu.prototype.getTransitionLength = function() {
	var transitionDelay = window.getComputedStyle(this.content).transitionDelay;
	var transitionDuration = window.getComputedStyle(this.content).transitionDuration;
	this.transitionLength = (parseFloat(transitionDelay) + parseFloat(transitionDuration)) * 1000;
}

Menu.prototype.setListenerOffMenu = function() {
	document.addEventListener('click', this.reactToOffMenu);
}

Menu.prototype.removeListenerOffMenu = function() {
	document.removeEventListener('click', this.reactToOffMenu);
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