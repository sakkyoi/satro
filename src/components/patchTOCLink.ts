/**
 * A workaround for the TOC links to work with Astro's transition.
 * The original one will cause some issues like if the url is a Fragment, 
 * page content will not be changed when popstate event is triggered.
 */

window.HSScrollspy.prototype.init = function () {
    this.createCollection(window.$hsScrollspyCollection, this);

	this.links.forEach((el: HTMLElement) => {
		this.sections.push(
			this.scrollable.querySelector(el.getAttribute('href')),
		);
	});

	Array.from(this.sections).forEach((section: unknown) => {
		if (!(section as HTMLElement).getAttribute('id')) return false;

		this.scrollable.addEventListener('scroll', (evt: Event) =>
			this.update(evt, section),
		);
	});

	this.links.forEach((el: HTMLLinkElement) => {
		el.addEventListener('click', (evt) => {
			evt.preventDefault();

            const href = decodeURI(new URL((evt.target as HTMLLinkElement)?.href).hash);
            if (!href) return false;

            history.pushState({}, '', href);
            document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});
};
