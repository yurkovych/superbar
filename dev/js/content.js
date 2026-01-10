import {toast, tl} from './modules/toast.js';
import {goGetEm} from './modules/request.js';

let container, superbar, vanilla, collapse, scrollable, sideNavOverlayWrapper, interval;

function init() {

	let vanilla = document.querySelector('div[aria-label="Followed Channels"]');
	if (!vanilla) {
		setTimeout(init, 10);
		return;
	}
	
	container = vanilla.closest('.Layout-sc-1xcs6mc-0.dtSdDz');
	// if (!container) {
	// 	tl(no);
	// 	setTimeout(init, 100);
	// }
	collapse = document.querySelector('.collapse-toggle');
	scrollable = document.querySelector('.scrollable-area');
	sideNavOverlayWrapper = document.querySelector('.side-nav__overlay-wrapper');

	collapse.style = 'display: none !important';
	scrollable.style = 'overflow: visible !important; overflow-x: visible !important; z-index: 9999';
	sideNavOverlayWrapper.style = 'overflow: visible !important';

	const shits = container.querySelectorAll(':scope > *');
	for (const shit of shits)	shit.style = 'display: none !important';

	superbar = document.createElement('div');
	superbar.id = 'superbar';
	container.append(superbar);
	interval = setInterval(req, 60000);
	req();
}

async function req() {

	const response = await goGetEm();
	const channels = response.data.currentUser.followedLiveUsers.edges;

	const html = document.createDocumentFragment();

	for (const channel of channels) {

		const name = channel.node.displayName;
		const pic = channel.node.profileImageURL;
		const game = channel.node.stream.game.name;
		const title = channel.node.stream.title;
		const count = parseInt(channel.node.stream.viewersCount);
		const url = `https://www.twitch/${name}`;

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

init();