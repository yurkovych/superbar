import {toast, tl} from './modules/toast.js';
let categories;
const gameLinkSelector = 'a[data-test-selector="GameLink"]';
let tower;
async function init() {

	if (!categories) {
		categories = await getCategories();
		if (!categories) {
			setTimeout(init, 2000)
			// toast('Retrying to get categories from storage in 2s');
			return;
		}
	}

	if (!tower) {
		tower = document.querySelector('.ScTower-sc-1sjzzes-0.hTjsYU.tw-tower');
		if (!tower) {
			setTimeout(init, 1000);
			// toast('No tower element. Retrying in 1s');
			return;
		}
	}

	observeTower();
	observeBody();

	const scrollable = document.querySelector('.root-scrollable');
	scrollable.addEventListener('scroll', onScroll);

}

if (window.location.href.includes('twitch.tv/directory')) {
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
}

function observeBody() {
	const targetNode = document.body;
	const observer = new MutationObserver(checkTower);

	observer.observe(targetNode, {
		childList: true,
		subtree: true
	});
}

function checkTower() {
	const newTower = document.querySelector('.ScTower-sc-1sjzzes-0.hTjsYU.tw-tower');
	if (newTower && newTower !== tower) {
		observer.disconnect();
		observeTower();
	}
}


async function getCategories() {
	const result = await chrome.storage.local.get('categories');
	if (chrome.runtime.lastError) {
		toast(0, `Failed to get categories from storage. Error: ${chrome.runtime.lastError}`);
		return null;
	}
	else if (result?.categories?.length) {
		return result.categories;
	}
	else {
		toast('No error, but no categories from storage');
		return [];
	}
}

async function updateCategories(cat) {
	const result = await chrome.storage.local.set({'categories': categories});
	if (chrome.runtime.lastError) {
		toast(0, `Failed to update storage. Error: ${chrome.runtime.lastError}`);
		return null;
	}
	else {
		toast(1, `Guess "${cat}" category was blocked and put into storage`);
	}
}


let observer;

function observeTower() {

	tower = document.querySelector('.ScTower-sc-1sjzzes-0.hTjsYU.tw-tower');

	if (!tower) {
		toast(0, 'No tower in observeTower. Retry in 1s');
		setTimeout(observeTower, 1000);
		return;
	}

	const targetNode = document.body; // observing body is fine. few mutations
	observer = new MutationObserver(mutationCb);

	observer.observe(tower, {
		childList: true,
		subtree: true
	});
}

function mutationCb() {

	observer.disconnect();

	const tower = document.querySelector('.ScTower-sc-1sjzzes-0.hTjsYU.tw-tower');

	if (!tower) {
		toast(0, 'No tower in mutation callback. Retry in 1s');
		setTimeout(mutationCb, 1000);
		return;
	}

	const els = tower.querySelectorAll(':scope > div:not(.processed)');
	
	if (els) filterElements(els);

	observeTower();

}

function filterElements(els) {

	for (const el of els) {
		const gameLink = el.querySelector(gameLinkSelector);

		if (gameLink) {
			const slug = parseLinkToCategory(gameLink);
			const index = categories.indexOf(slug);

			if (index !== -1)	el.remove();
			else if (!el.classList.contains('processed')) {
				el.classList.add('processed');
				addBlockCatButton(gameLink);
			}
		}
	}

}

function parseLinkToCategory(gameLink) {
	const href = gameLink.href;
	const slug = href.split('/').pop();
	return slug;
}

function addBlockCatButton(gameLink) {
	const button = generateBlockButton();
	const parent = gameLink.parentNode;
	parent.append(button);
}

function generateBlockButton() {
	const button = document.createElement('button');
	button.classList.add('huitch-block-button');
	button.textContent = '×';
	button.addEventListener('click', blockCategory);
	return button;
}

let blocking = false;

async function blockCategory(e) {
	
	if (blocking) return;
	blocking = true;

	categories = await getCategories();

	if (!categories) {
		toast(0, 'something is wrong with getting categories from storage');
		blocking = false;
		return;
	}

	const parent = this.closest('div');
	const gameLink = parent.querySelector(gameLinkSelector);
	const cat = parseLinkToCategory(gameLink);

	categories.push(cat);

	const tower = document.querySelector('.ScTower-sc-1sjzzes-0.hTjsYU.tw-tower');
	const els = tower.querySelectorAll(':scope > div');

	filterElements(els);

	await updateCategories(cat);
	
	blocking = false;
}

function onScroll(e) {
	let scrollCounter = e.target.scrollTop;
	if (scrollCounter > 800) {
		const items = document.querySelectorAll('.ScTower-sc-1sjzzes-0.hTjsYU.tw-tower > div');
		const firstSix = Array.from(items).slice(0, 6);
		for (const el of firstSix) {
			el.remove();
		}
	}
}
