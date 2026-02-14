import {toast, tl} from './modules/toast.js';
import {goGetEm} from './modules/request.js';

let container, superbar, vanilla, collapse, scrollable, sideNavOverlayWrapper, interval, token, sidenav, tokenTries = 0, observer;

function init() {

	token = checkToken();
	if (!token) {
		toast('No auth token');
		tokenTries++;
		if (tokenTries < 5) setTimeout(init, 1000);
		else (toast('No auth token present. Extension stopped. If you\'re not logged in, do it'));
		return;
	}

	if (observer) {
		observer.disconnect();
		observer = null;
	}
	// tl('observer disconnected');


	let vanilla = document.querySelector('div[aria-label="Followed Channels"]');
	if (!vanilla) {
		// tl('observer added');
		observer = new MutationObserver(init);
		observer.observe(document.body, {childList: true, subtree: true});
		// tl('No vanilla bar');
		return;
	}

	
	container = vanilla.parentElement;
	// if (!container) {
	// 	tl(no);
	// 	setTimeout(init, 100);
	// }
	collapse = document.querySelector('.collapse-toggle');
	scrollable = document.querySelector('.scrollable-area');
	sidenav = document.querySelector('.side-nav');
	sideNavOverlayWrapper = document.querySelector('.side-nav__overlay-wrapper');

	collapse.style = 'display: none !important';
	
	scrollable.style.setProperty("overflow", "visible", "important");
	scrollable.style.zIndex = "9999";
	
	sideNavOverlayWrapper.style.setProperty("overflow", "visible", "important");
	
	sidenav.style.setProperty("width", "5rem", "important");

	const garbages = container.querySelectorAll(':scope > *');
	for (const garbage of garbages)	garbage.style = 'display: none !important';

	superbar = document.createElement('div');
	superbar.id = 'superbar';
	container.append(superbar);
	superbar.addEventListener('click', poppy);
	interval = setInterval(req, 60000);
	req();
}

async function req() {

	const response = await goGetEm(token);
	const channels = response.data.currentUser.followedLiveUsers.edges;

	const html = document.createDocumentFragment();

	for (const channel of channels) {

		const name = channel.node.displayName;
		const pic = channel.node.profileImageURL;
		const game = channel.node.stream.game.name;
		const title = channel.node.stream.title;
		const count = parseInt(channel.node.stream.viewersCount);
		const url = `https://www.twitch.tv/${name}`;

		const item = document.createElement('div');
		item.classList.add('superbar-item');
		html.append(item);
		
		const anchor = document.createElement('a')
		anchor.href = url;
		anchor.classList.add('superbar-anchor')
		item.append(anchor);

		const img = document.createElement('img');
		img.classList.add('superbar-img');
		img.src = pic;
		anchor.append(img);

		const float = document.createElement('div');
		float.classList.add('superbar-float');
		item.append(float);
		
		const titleEl = document.createElement('p');
		titleEl.classList.add('superbar-title');
		titleEl.textContent = `${name} · ${game}`;
		float.append(titleEl);

		const descrEl = document.createElement('p');
		descrEl.textContent = title;
		float.append(descrEl);

		const liveEl = document.createElement('div');
		liveEl.classList.add('superbar-live');
		float.append(liveEl);

		const redDot = document.createElement('div');
		redDot.classList.add('superbar-reddot');
		liveEl.append(redDot);

		const liveInfo = document.createElement('span');
		liveInfo.classList.add('superbar-liveinfo');
		liveInfo.textContent = `Live | ${count} viewers`;
		liveEl.append(liveInfo);

	}

	superbar.innerHTML = '';
	superbar.append(html);

}

function poppy(e) {
	const target = e.target;
	const anchor = target.closest('.superbar-anchor');
	if (!anchor) return;

	e.preventDefault();
	const url = anchor.href;
	window.history.pushState({}, "", url);
	window.dispatchEvent(new PopStateEvent("popstate"));
}

function checkToken() {
	const cookie = document.cookie.match(/auth-token=([^;]+)/);
	if (cookie && cookie.length > 1) return cookie[1];
	else return null;
}

init();