document.addEventListener('DOMContentLoaded', function() {
	header = document.querySelector('#site-header');
	button = header.querySelector('#site-nav-menu-button');
	menu = header.querySelector('#site-nav-menu');

	// Activate site nav menu
	new Menu(header, button, menu, '36rem');
}, {once: true});

function Menu(stateHolder, stateController, contentHolder, mediaQuery) {
	// Name arguments
	this.container = stateHolder;
	this.button = stateController;
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
	}.bind(this), 20);
}

Menu.prototype.closeMenu = function() {
	if(!this.pageIsWide.matches) {
		this.container.classList.remove('menu-open');
		this.container.classList.add('menu-closed');
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