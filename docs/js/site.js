function activateSiteNavMenu(){var e=document.querySelector(".js-site-nav-input"),t=document.querySelector(".js-site-nav-button");!function(){var n=e.checked,r=t.childNodes,o=document.createElement("button");e.checked=!1,e.parentNode.removeChild(e),o.classList.add("menu-button"),o.classList.add("js-site-nav-button"),o.setAttribute("type","button"),o.setAttribute("aria-controls","site-nav-menu"),o.setAttribute("aria-expanded",n.toString()),o.setAttribute("hidden","");for(;r.length>0;)o.appendChild(r[0]);t.parentNode.replaceChild(o,t)}();var n=document.querySelector(".js-site-nav-button"),r=n.querySelector(".js-site-nav-button-text"),o=document.querySelector(".js-site-nav-menu"),i=window.matchMedia("(min-width: 56em)");function a(){n.setAttribute("aria-expanded","true"),r.textContent="Close menu",document.addEventListener("keydown",d,{passive:!0}),document.addEventListener("click",u,{passive:!0}),document.addEventListener("focusin",u)}function c(){n.setAttribute("aria-expanded","false"),r.textContent="Open menu",document.removeEventListener("keydown",d,{passive:!0}),document.removeEventListener("click",u,{passive:!0}),document.removeEventListener("focusin",u)}function s(){i.matches?c():window.requestAnimationFrame((function(){o.classList.add("prevent-transition"),window.requestAnimationFrame((function(){o.classList.remove("prevent-transition")}))}))}function d(e){"Escape"!==e.key&&"Esc"!==e.key||c()}function u(e){var t=e.target.closest(".js-site-nav-button"),n=e.target.closest(".js-site-nav-menu");t||n||c()}n.addEventListener("click",(function(){"true"===n.getAttribute("aria-expanded")?c():a()}),{passive:!0}),i.addListener(s),s(),"true"===n.getAttribute("aria-expanded")&&a()}function activateServiceWorker(){navigator.serviceWorker.register("/serviceworker.js"),navigator.serviceWorker.controller||navigator.serviceWorker.addEventListener("controllerchange",(function(){var e=new Set;e.add(window.location.pathname),document.querySelectorAll('link[rel="stylesheet"]').forEach((function(t){e.add(t.href)})),document.querySelectorAll("script[src]").forEach((function(t){e.add(t.src)})),document.querySelectorAll("img").forEach((function(t){e.add(t.currentSrc)})),navigator.serviceWorker.controller.postMessage({command:"fillInitialCache",payload:Array.from(e)})}),{once:!0})}document.addEventListener("DOMContentLoaded",activateSiteNavMenu,{once:!0}),"serviceWorker"in navigator&&activateServiceWorker(),Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(e){var t=this;do{if(t.matches(e))return t;t=t.parentElement||t.parentNode}while(null!==t&&1===t.nodeType);return null});