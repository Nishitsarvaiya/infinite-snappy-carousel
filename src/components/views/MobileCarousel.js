'use client';

import { useActiveItem } from '@/context/ActiveItemContextProvider';
import { PROJECTS } from '@/lib/constants';
import { getBounds, lerp } from '@/lib/utils';
import gsap from 'gsap';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

export default function MobileCarousel() {
	const { activeIndex, setActiveIndex } = useActiveItem();
	const containerRef = useRef(null);
	const slidesRef = useRef([]);
	const cache = useRef(null);

	const on = useRef(0);
	const cx = useRef(0);
	const cy = useRef(0);
	const tc = useRef(0);
	const t = useRef(0);
	const active = useRef(false);
	const dx = useRef(0);
	const speed = useRef(2);
	const max = useRef(0);
	const so = useRef(0);
	const snapToClosest = useRef(() => 0);

	const bindEvents = () => {
		window.addEventListener('touchend', (e) => up(e));
		containerRef.current.addEventListener('touchstart', (e) => down(e));
		containerRef.current.addEventListener('touchmove', (e) => move(e));
		window.addEventListener('resize', () => resize());
		requestAnimationFrame(tick);
	};

	const unbindEvents = () => {
		window.removeEventListener('touchend', (e) => up(e));
		window.removeEventListener('resize', () => resize());
		if (containerRef.current) {
			containerRef.current.removeEventListener('touchstart', (e) => down(e));
			containerRef.current.removeEventListener('touchmove', (e) => move(e));
		}
	};

	const updateSlideClasses = useCallback(() => {
		if (!cache.current) return;

		cache.current.forEach(({ el }, i) => {
			el.classList.remove('is-big', 'is-left', 'is-right');
			if (i === activeIndex) el.classList.add('is-big');
			else if (i < activeIndex) el.classList.add('is-left');
			else if (i > activeIndex) el.classList.add('is-right');
		});
	}, [activeIndex]);

	const updateActiveIndex = useCallback(() => {
		if (!cache.current?.length) return;

		let closest = 0;
		let minDistance = Infinity;

		cache.current.forEach((item, i) => {
			const rect = item.el.getBoundingClientRect();
			const elCenter = rect.left + rect.width / 2;
			const distance = Math.abs(window.innerWidth / 2 - elCenter);
			if (distance < minDistance) {
				minDistance = distance;
				closest = i;
			}
		});

		setActiveIndex(closest);
	}, []);

	const calcMax = (el, right, width, carouselLeft) => {
		const marginRight = parseInt(getComputedStyle(el).getPropertyValue('margin-right')) || 0;
		const maximum = Math.max(0, right - (window.innerWidth - carouselLeft - width));
		max.current = maximum;
		so.current = width + marginRight;
		snapToClosest.current = gsap.utils.snap(so.current);
	};

	const visible = (start, end, val) => val > start && val < end;

	const transform = () => {
		if (!cache.current.length) return;

		cache.current.forEach((item) => {
			const { start, end, xSet } = item;
			const r = gsap.utils.wrap(-(max.current - end), end, tc.current);
			if (visible(start, end, r)) {
				if (item.out) item.out = false;
				xSet(-r);
			} else if (!item.out) {
				item.out = true;
				xSet(-r);
			}
		});

		updateActiveIndex();
	};

	const snap = () => {
		t.current = snapToClosest.current(t.current);
	};

	const pos = (e) => ({
		x: e.touches[0].clientX,
		y: e.touches[0].clientY,
	});

	const down = (e) => {
		const { x, y } = pos(e);
		active.current = true;
		cx.current = x;
		cy.current = y;
		dx.current = x;
		on.current = t.current + x * speed.current;
	};

	const move = (e) => {
		if (!active.current) return;
		const { x, y } = pos(e);
		if (Math.abs(x - cx.current) > Math.abs(y - cy.current) && e.cancelable) {
			e.preventDefault();
			e.stopPropagation();
		}
		t.current = on.current - x * speed.current;
	};

	const up = (e) => {
		if (!active.current) return;
		active.current = false;
		snap();
	};

	const tick = () => {
		const ratio = gsap.ticker.deltaRatio();
		tc.current = gsap.utils.interpolate(tc.current, t.current, 0.08 * ratio);
		if (Math.abs(t.current - tc.current) > 0.1) transform();
		requestAnimationFrame(tick);
	};

	const resize = () => {
		const container = containerRef.current;
		if (!container) return;
		const slides = slidesRef.current.filter(Boolean);
		const lastIndex = slides.length - 1;
		const carouselLeft = getBounds(container).left;

		cache.current = slides.map((el, index) => {
			el.style.transform = 'none';
			const { left, right, width } = getBounds(el);
			const start = left - window.innerWidth;
			const end = right;
			const xSet = gsap.quickSetter(el, 'x', 'px');
			if (index === lastIndex) calcMax(el, right, width, carouselLeft);
			return { el, xSet, start, end, out: true };
		});

		transform();
	};

	useEffect(() => {
		requestAnimationFrame(() => {
			bindEvents();
			resize();

			gsap.to('.js-i-slide-mask-inside', {
				clipPath: 'inset(0% 0% 0% 0%)',
				scale: 1,
				duration: 3,
				ease: 'snappy',
				stagger: 0.075,
			});

			gsap.to('.js-i-slide-text', {
				yPercent: 0,
				opacity: 1,
				duration: 3,
				ease: 'snappy',
				stagger: 0.075,
			});
		});

		return () => {
			unbindEvents();
			cache.current = null;
		};
	}, []);

	useEffect(() => {
		updateSlideClasses();
	}, [activeIndex, updateSlideClasses]);

	return (
		<div className='flex items-start px-12 pt-36 select-none absolute top-0 left-0 w-full'>
			<div ref={containerRef} className='mobile relative slides flex items-start w-full pointer-events-auto'>
				{PROJECTS.map((s, i) => (
					<article
						key={i}
						ref={(el) => (slidesRef.current[i] = el)}
						className='group relative slide js-i-slide-parent'
					>
						<div className='slide__content relative origin-top'>
							<div className='slide__text absolute left-0 bottom-full w-full pb-4'>
								<div className='flex flex-col js-i-slide-text'>
									<h2 className='leading-none'>{s.title}</h2>
									{s.type && <span className='uppercase leading-none mt-2'>[{s.type}]</span>}
								</div>
							</div>

							<div
								className={`absolute origin-top inset-0 js-i-slide js-slide-content ${
									i !== 0 && 'overflow-hidden'
								}`}
							>
								<div
									className={`absolute inset-0 origin-top overflow-hidden js-t-flip js-i-slide-mask ${
										i === 0 && 'js-i-flip'
									}`}
								>
									<div className='absolute inset-0 overflow-hidden js-i-slide-mask-inside'>
										<div className='absolute inset-0 media-fill'>
											<Image
												className='js-t-stack-item'
												src={s.image}
												alt=''
												fill
												style={{ objectFit: 'cover', objectPosition: 'center' }}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</article>
				))}
			</div>
		</div>
	);
}
