class Menu {
  constructor(stateHolder, stateController, contentHolder, mediaQuery) {
		// Name arguments
    this.container = stateHolder;
    this.button = stateController;
    this.content = contentHolder;
		this.mediaQuery = mediaQuery;

		// Start media query listener
		this.pageIsWide = window.matchMedia('(min-width: '+ this.mediaQuery +')');
		this.pageIsWide.addListener(this.handleViewportChange.bind(this));
		this.handleViewportChange(this.pageIsWide);

		// Listen for button clicks
		this.button.addEventListener('click', ()=> {
			if(this.container.classList.contains('menu-closed')) {
				this.openMenu();
			} else {
				this.closeMenu();
			}
		});
	}

	addToDOM() {
		this.content.removeAttribute('style', 'display: none');
	}

	removeFromDOM() {
		this.content.style.display = 'none';
	}

	openMenu() {
		this.addToDOM();
		setTimeout( ()=> {
			this.container.classList.remove('menu-closed');
			this.container.classList.add('menu-open');
		}, 20);
	}

	closeMenu() {
		if(!this.pageIsWide.matches) {
			this.container.classList.remove('menu-open');
			this.container.classList.add('menu-closed');
			setTimeout( ()=> {
				if(this.container.classList.contains('menu-closed')) {
					this.removeFromDOM();
				}
			}, this.transitionLength);
		}
	}

	handleViewportChange() {
		if(this.pageIsWide.matches) {
			this.addToDOM();
		} else {
			let transitionDelay = window.getComputedStyle(this.content).transitionDelay;
			let transitionDuration = window.getComputedStyle(this.content).transitionDuration;
			this.transitionLength = (parseFloat(transitionDelay) + parseFloat(transitionDuration)) * 1000;
			setTimeout( ()=> {
				this.removeFromDOM();
				this.closeMenu();
			}, 20);
		}
	}
}

document.addEventListener('DOMContentLoaded', function() {
	header = document.querySelector('#site-header');
	button = header.querySelector('#site-nav-menu-button');
	menu = header.querySelector('#site-nav-menu');

	new Menu(header, button, menu, '36rem');
}, {once: true});






// 	// Close menu when out of viewport
// 	if('IntersectionObserver' in window) {
// 		setTimeout(function() {
// 			let observer = new IntersectionObserver(menuObserver,{rootMargin: '-160px'});
// 			observer.observe(menu);
// 		}, transitionLength);
// 	}
// }
// function menuObserver(intersections, subject) {
// 	for(i = 0; i < intersections.length; i++) {
// 		if(!intersections[i].isIntersecting) {
// 			closeMenu();
// 			subject.disconnect();
// 		}
// 	};
// };