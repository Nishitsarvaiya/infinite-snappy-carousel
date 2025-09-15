export function lerp(start, end, amt) {
	return (1 - amt) * start + amt * end;
}

export function getBounds(el) {
	if (!el || !(el instanceof Element)) {
		return {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			width: 0,
			height: 0,
		};
	}
	const rect = el.getBoundingClientRect();
	return {
		left: rect.left,
		right: rect.right,
		top: rect.top,
		bottom: rect.bottom,
		width: rect.width,
		height: rect.height,
	};
}
