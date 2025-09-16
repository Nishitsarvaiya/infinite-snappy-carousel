'use client';

import { Link } from 'next-transition-router';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';

export default function Footer() {
	const pathname = usePathname();
	const footerRef = useRef(null);

	useEffect(() => {
		if (!footerRef.current) return;
		const ctx = gsap.context(() => {
			gsap.from('.js-footer-fade', {
				opacity: 0,
				yPercent: 50,
				duration: 1.25,
				ease: 'power3.out',
				stagger: 0.1,
			});

			const split = new SplitText('.js-footer-split', { type: 'chars,words', autoSplit: true });
			gsap.set(split.chars, { willChange: 'transform, opacity' });
			gsap.from(split.chars, {
				yPercent: 100,
				duration: 1.6,
				ease: 'snappy',
				stagger: { each: 0.04, from: 'start' },
				delay: 0.1,
			});
		}, footerRef);
		return () => ctx.revert();
	}, []);
	return (
		<footer ref={footerRef} className='w-full px-[calc((64/1920)*100vw)]'>
			<div className='flex items-center justify-between js-footer-fade mb-6'>
				<div className='flex items-center gap-1 text-responsive-sm font-medium js-footer-fade'>
					<Link href='/' className={`${pathname === '/' ? 'opacity-100' : 'opacity-25'}`}>
						Carousel,
					</Link>
					<Link href='/list' className={`${pathname === '/list' ? 'opacity-100' : 'opacity-25'}`}>
						List
					</Link>
				</div>
				<div className='text-responsive-sm js-footer-fade'>London, UK 17:21</div>
			</div>
			<div className='w-full flex items-center whitespace-nowrap text-[16.25vw] leading-[14vw] max-w-full uppercase overflow-y-clip'>
				<div className='js-footer-split'>
					Ross<span className='italic tracking-tighter'>mason</span>
				</div>
			</div>
		</footer>
	);
}
