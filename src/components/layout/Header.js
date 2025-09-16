'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Header() {
	const headerRef = useRef(null);

	useEffect(() => {
		if (!headerRef.current) return;
		const ctx = gsap.context(() => {
			gsap.from('.js-header-fade', {
				opacity: 0,
				yPercent: 50,
				duration: 1.25,
				ease: 'power3.out',
				stagger: 0.1,
			});
		}, headerRef);
		return () => ctx.revert();
	}, []);
	return (
		<header ref={headerRef} className='fixed top-0 left-0 right-0 pt-6 lg:pt-10 px-[calc((64/1920)*100vw)]'>
			<div className='flex items-center justify-between js-header-fade'>
				<div className='text-responsive-sm js-header-fade'>3D, Motion, Art direction</div>
				<nav role='navigation' aria-label='Primary' className='js-header-fade hidden lg:block'>
					<ul role='menubar' className='flex items-center gap-2'>
						<li role='menuitem' className='text-responsive-sm'>
							Index,
						</li>
						<li role='menuitem' className='text-responsive-sm'>
							Patreon,
						</li>
						<li role='menuitem' className='text-responsive-sm'>
							Store,
						</li>
						<li role='menuitem' className='text-responsive-sm'>
							About,
						</li>
						<li role='menuitem' className='text-responsive-sm'>
							Lab
						</li>
					</ul>
				</nav>
				<div className='text-responsive-sm underline underline-offset-8 js-header-fade hidden lg:block'>
					Send me a message
				</div>
				<button className='lg:hidden js-header-fade' aria-label='Open/Close Navigation' aria-expanded='false'>
					Menu
				</button>
			</div>
		</header>
	);
}
