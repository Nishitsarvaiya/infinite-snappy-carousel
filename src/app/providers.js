'use client';

import { useActiveItem } from '@/context/ActiveItemContextProvider';
import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { TransitionRouter } from 'next-transition-router';
import { usePathname } from 'next/navigation';
gsap.registerPlugin(Flip, CustomEase, SplitText);
CustomEase.create(
	'snappy',
	'M0,0 C0.094,0.026 0.124,0.127 0.157,0.29 0.197,0.486 0.254,0.8 0.348,0.884 0.42,0.949 0.374,1 1,1 '
);
CustomEase.create('smoothy', '.075,.82,.165,1');

export function Providers({ children }) {
	const pathname = usePathname();
	const { activeIndex, setActiveIndex } = useActiveItem();

	return (
		<TransitionRouter
			enter={(next) => {
				if (pathname === '/list') {
					const stackEnd = document.querySelector('.js-t-stack-end');
					const stackItems = document.querySelectorAll('.js-t-stack-item');

					stackItems.forEach((item, i) => {
						const state = Flip.getState(item);
						stackEnd.appendChild(item);
						gsap.set(item, {
							zIndex:
								activeIndex !== null && i === activeIndex
									? stackItems.length + 1
									: stackItems.length - i,
						});
						Flip.from(state, {
							absolute: true,
							scale: true,
							simple: true,
							duration: 1,
							delay: 0.05 * i,
							ease: 'snappy',
							onComplete: () => {
								document.documentElement && delete document.documentElement.dataset.spa;
								next();
							},
						});
					});
				} else {
					document.documentElement && delete document.documentElement.dataset.spa;
					next();
				}
			}}
			leave={(next, from, to) => {
				document.documentElement && (document.documentElement.dataset.spa = '1');
				if (to === '/list') {
					const stackStart = document.querySelector('.js-t-stack-start');
					const stackItems = document.querySelectorAll('.js-t-stack-item');
					const slideTexts = document.querySelectorAll('.js-i-slide-text');

					stackItems.forEach((item, i) => {
						if (item.closest('.is-big')) {
							setActiveIndex(i);
							item.classList.add('is-active');
						}

						const state = Flip.getState(item);

						stackStart.appendChild(item);

						gsap.set(item, {
							zIndex: item.classList.contains('is-active')
								? stackItems.length + 1
								: stackItems.length - i,
						});

						Flip.from(state, {
							absolute: true,
							scale: true,
							simple: true,
							duration: 1.25,
							ease: 'snappy',
							onComplete: () => {
								if (i === stackItems.length - 1) {
									next();
								}
							},
						});
					});

					gsap.to(slideTexts, {
						opacity: 0,
						duration: 0.5,
						ease: 'smoothy',
					});
				} else if (to === '/') {
					const stackStart = document.querySelector('.js-t-stack-start');
					const itemGrid = document.querySelector('.js-grid');
					gsap.to([stackStart, itemGrid], {
						opacity: 0,
						duration: 0.5,
						ease: 'smoothy',
						onComplete: () => next(),
					});
				} else {
					next();
				}
			}}
		>
			{children}
		</TransitionRouter>
	);
}
