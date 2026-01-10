export function toast(...args) {

	let toastType, type, message, code;

	if (args.length === 2 && typeof(args[0]) === 'number' && typeof(args[1]) === 'string') {

		toastType = 'classic';

		code = args[0];
		message = args[1];

		if (code && code !== 500) type = 'success';
		else type = 'error';

		if (code !== 0 && code !== 1) message = `Code #${code}: ` + message;

	}
	else if (args.length === 1 && typeof(args[0]) === 'object') {
		toastType = 'object';
		message = '';
		let obj = args[0];

		for (const key in obj) {
			if (typeof(obj[key]) === 'object' && obj[key] !== null) {
				const obj2 = obj[key];
				message += `<div class="toast-div"><span class="toast-object-heading">${key} [object]:</span><ul class="toast-object-ul">`;
				for (const key2 in obj2) {
					message += `<li class="toast-object-li">${key2}: ${obj2[key2]}</li>`;
				}
				message += `</ul></div>`;
			}
			else {
				message += `<div class="toast-div">${key}: ${obj[key]}</div>`;
			}
		}

	}
	else if (args.length === 1 && (typeof(args[0]) === 'string' || typeof(args[0]) === 'number')) {
		toastType = 'string';
		message = args[0];
	}

	let container = document.getElementById('toast-container');
	if (!container) container = generateContainer();

	// const existingToast = container.querySelector('.toast:not(.proto)');
	// existingToast?.remove();

	const proto = container.querySelector('.toast-content.proto');
	const toast = proto.cloneNode(true);
	toast.classList.remove('proto');

	const iconSpan = toast.querySelector('.toast-icon');
	const messageSpan = toast.querySelector('.toast-message');

	if (toastType === 'classic') {
		toast.classList.add(type); // add success or error class
		const icon = type === 'success' ? '✓' : '✕';

		iconSpan.textContent = icon;
		messageSpan.innerHTML = message;
	}
	else if (toastType === 'string' || toastType === 'object') {
		messageSpan.innerHTML = message;
	}

	container.appendChild(toast);

	// Trigger animation
	setTimeout(() => {toast.classList.add('show')}, 10);

	let removeTimeout;
	setToastRemoveTimeout();

	function setToastRemoveTimeout() {
		// toast.classList.remove('wiggle');
		removeTimeout = setTimeout(hideToast, 3000);
		toast.addEventListener('mouseover', hoverToast, {once: true});
	}

	function hideToast() {
		toast.classList.remove('show');
		const height = toast.offsetHeight;
		toast.style.height = height + 'px';
		setTimeout(removeToast, 300);
	}

	function removeToast() {
		toast.style.height = 0;
		toast.classList.add('removing');
		setTimeout(() => { toast.remove() }, 300);
	}

	function hoverToast() {
		clearTimeout(removeTimeout);
		// toast.classList.add('wiggle');
		toast.addEventListener('mouseout', setToastRemoveTimeout, {once: true});
	}

	function generateContainer() {
		const container = document.createElement('div');
		container.classList.add('toast-container');
		container.id = 'toast-container';

		const content = document.createElement('div');
		content.classList.add('toast', 'toast-content', 'proto');
		container.append(content);

		const icon = document.createElement('span');
		icon.classList.add('toast-icon')
		content.append(icon);

		const message = document.createElement('span');
		message.classList.add('toast-message')
		content.append(message);

		document.body.append(container);

		return container;

	}

}

export function tl(...args) {
	console.log(args[0]);
	toast(args[0]);
}