document.addEventListener('DOMContentLoaded', function() {
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

	// Start media query listener
	this.pageIsWide = window.matchMedia('(min-width: '+ this.mediaQuery +')');
	this.pageIsWide.addListener(this.handleViewportChange.bind(this));
	this.handleViewportChange(this.pageIsWide);

	// Listen for menu button clicks
	this.button.addEventListener('click', function() {
		if(this.container.classList.contains('menu-closed')) {
			this.openMenu();
		}
		else {
			this.closeMenu();
		}
	}.bind(this));

	// Ensure listener context is always the same so it can be removed
	this.handleOffMenuClick = function(event) {
		this.handleOffMenuClickFunc(event);
	}.bind(this);
}

Menu.prototype.addToDOM = function() {
	this.content.removeAttribute('style', 'display: none');
}

Menu.prototype.removeFromDOM = function() {
	this.content.style.display = 'none';
}

Menu.prototype.openMenu = function() {
	this.addToDOM();
	setTimeout(function() {
		this.container.classList.remove('menu-closed');
		this.container.classList.add('menu-open');
		this.buttonText.textContent = 'Close';
		document.addEventListener('click', this.handleOffMenuClick);
	}.bind(this), 50);
}

Menu.prototype.handleOffMenuClickFunc = function(event) {
	if(!event.target.closest('#site-nav-menu')) {
		this.closeMenu();
	}
}

Menu.prototype.closeMenu = function() {
	if(!this.pageIsWide.matches) {
		this.container.classList.remove('menu-open');
		this.container.classList.add('menu-closed');
		this.buttonText.textContent = 'Open';
		document.removeEventListener('click', this.handleOffMenuClick);
		if(this.transitionLength === undefined && document.readyState === 'complete') {
			this.getTransitionLength();
		}
		setTimeout(function() {
			if(this.container.classList.contains('menu-closed')) {
				this.removeFromDOM();
			}
		}.bind(this), this.transitionLength);
	}
}

Menu.prototype.getTransitionLength = function() {
	var transitionDelay = window.getComputedStyle(this.content).transitionDelay;
	var transitionDuration = window.getComputedStyle(this.content).transitionDuration;
	this.transitionLength = (parseFloat(transitionDelay) + parseFloat(transitionDuration)) * 1000;
}

Menu.prototype.handleViewportChange = function() {
	if(this.pageIsWide.matches) {
		this.addToDOM();
	}
	else {
		// Ignore animation when closing menu
		this.removeFromDOM();
		this.closeMenu();
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