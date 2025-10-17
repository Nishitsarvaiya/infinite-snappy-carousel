'use client';

import { useState, useEffect } from 'react';
import MobileCarousel from './MobileCarousel';
import InfiniteHorizontalCarousel from './InfiniteHorizontalCarousel';

export default function ResponsiveCarousel() {
	const [isMobile, setIsMobile] = useState(null);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 650);
		};
		handleResize();
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);
	if (isMobile === null) return null;

	return isMobile ? <MobileCarousel /> : <InfiniteHorizontalCarousel />;
}
