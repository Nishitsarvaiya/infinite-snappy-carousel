'use client';

import gsap from 'gsap';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useActiveItem } from '@/context/ActiveItemContextProvider';

import Image from 'next/image';
import { getBounds } from '../../lib/utils';
import { PROJECTS } from '@/lib/constants';

export default function InfiniteHorizontalCarousel() {
	const { activeIndex, setActiveIndex } = useActiveItem();
	const containerRef = useRef(null);
	const slideRefs = useRef([]);
	const contentRefs = useRef([]);
	const scaleRefs = useRef([]);
	const textRefs = useRef([]);
	const cache = useRef(null);
	const snaps = useRef([]);

	const t = useRef(0);
	const tc = useRef(0);
	const tl = useRef(0);
	const current = useRef(activeIndex);
	const st = useRef(null);
	const resizing = useRef(false);
	const reverse = useRef(false);
	const max = useRef(0);
	const scrolling = useRef(false);
	const snapToClosest = useRef(() => 0);
	const snapWidth = useRef(() => 0);
	const increase = useRef(0);
	const touchStartX = useRef(null);
	const lastTouchX = useRef(null);

	useEffect(() => {
		gsap.ticker.add(tick);
		requestAnimationFrame(() => {
			resize();
			bindEvents();
			classes();
			handleClick(activeIndex);

			gsap.to('.js-i-slide-mask-inside', {
				clipPath: 'inset(0% 0% 0% 0%)',
				scale: 1,
				duration: 3,
				ease: 'snappy',
				stagger: 0.075,
			});
		});

		return () => {
			unbindEvents();
			gsap.ticker.remove(tick);
		};
	}, []);

	const classes = () => {
		if (!cache.current) return;
		cache.current.forEach((slide, i) => {
			if (!slide.visible) return;
			if (i === current.current) slide.el.classList.add('is-big');
			else slide.el.classList.remove('is-big');
			if (slide.p > 0.5) {
				slide.el.classList.add('is-left');
				slide.el.classList.remove('is-right');
			} else {
				slide.el.classList.add('is-right');
				slide.el.classList.remove('is-left');
			}
		});
	};

	const bindEvents = () => {
		window.addEventListener('resize', resize);
		window.addEventListener('wheel', scroll);
		window.addEventListener('touchstart', onTouchStart, { passive: true });
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onTouchEnd, { passive: true });
	};

	const unbindEvents = () => {
		window.removeEventListener('resize', resize);
		window.removeEventListener('wheel', scroll);
		window.removeEventListener('touchstart', onTouchStart);
		window.removeEventListener('touchmove', onTouchMove);
		window.removeEventListener('touchend', onTouchEnd);
	};

	const scroll = (e) => {
		tl.current = t.current;
		t.current -= e.deltaY;
		reverse.current = tl.current > t.current;
		clearTimeout(st.current);
		st.current = setTimeout(() => {
			scrolling.current = false;
			snap();
		}, 100);
		scrolling.current = true;
	};

	const onTouchStart = (e) => {
		if (!e.touches || e.touches.length === 0) return;
		touchStartX.current = e.touches[0].clientX;
		lastTouchX.current = touchStartX.current;
		tl.current = t.current;
		scrolling.current = true;
		clearTimeout(st.current);
	};

	const onTouchMove = (e) => {
		if (lastTouchX.current == null) return;
		const x = e.touches && e.touches[0] ? e.touches[0].clientX : lastTouchX.current;
		const dx = x - lastTouchX.current;
		t.current -= dx;
		reverse.current = tl.current > t.current;
		lastTouchX.current = x;
		e.preventDefault();
		clearTimeout(st.current);
		st.current = setTimeout(() => {
			scrolling.current = false;
			snap();
		}, 100);
	};

	const onTouchEnd = () => {
		lastTouchX.current = null;
		touchStartX.current = null;
		scrolling.current = false;
		snap();
	};

	const idx = () => {
		if (snapToClosest.current) {
			const center = window.innerWidth / 2 + increase.current / 2;
			const wrapped = gsap.utils.wrap(0, max.current, tc.current + center - 5);
			console.log(wrapped);
			const snap = snapToClosest.current(wrapped);
			const newCurrent = snaps.current.indexOf(snap);
			if (newCurrent !== current.current) {
				current.current = newCurrent;
				classes();
			}
		}
	};

	const snap = () => {
		t.current = snapWidth.current(t.current);
	};

	const visible = (t, s, e) => e > t && e < s;

	const applyTransforms = () => {
		if (cache.current) {
			cache.current.forEach((slide, i) => {
				const { left, right, width } = slide.bounds;
				const center = right - window.innerWidth;

				slide.t = gsap.utils.wrap(-(max.current - right), right, tc.current);
				slide.p = gsap.utils.clamp(0, 1, (slide.t - center) / (left - center));
				slide.visible = visible(left - window.innerWidth - width, right + width, slide.t);

				if (slide.visible || resizing.current) {
					if (slide.out) {
						slide.out = false;
						show(slide);
					}
					transform(slide, slide.t);
				} else {
					if (!slide.out) {
						slide.out = true;
						transform(slide, slide.t);
						hide(slide);
					}
				}
			});
		}
	};

	const resize = () => {
		resizing.current = true;
		snaps.current = [];
		const slides = slideRefs.current;
		const lastIndex = slides.length - 1;
		if (cache.current) {
			cache.current.forEach((slide, i) => {
				slide.el.style.transform = '';
				slide.bounds = getBounds(slide.el);
				slide.visible = true;
				snaps.current.push(Math.floor(slide.bounds.right));
				if (i === lastIndex) {
					snapWidth.current = gsap.utils.snap(slide.bounds.width);
					increase.current = slide.bounds.width;
				}
			});
		} else {
			cache.current = slides.map((slide, i) => {
				slide.style.transform = '';
				const content = contentRefs.current[i];
				const scale = scaleRefs.current[i];
				const text = textRefs.current[i];
				const bounds = getBounds(slide);
				const right = bounds.right;
				const width = bounds.width;

				snaps.current.push(Math.floor(right));

				if (i === lastIndex) {
					snapWidth.current = gsap.utils.snap(width);
					increase.current = width;
				}

				return {
					el: slide,
					content: content,
					scale: scale,
					text: text,
					width: width,
					p: 0,
					o: 0,
					of: 0,
					t: 0,
					tc: 0,
					bounds: bounds,
					out: true,
					visible: true,
				};
			});
		}

		applyTransforms();
		requestAnimationFrame(() => {
			max.current = cache.current[cache.current.length - 1].bounds.right;
			snapToClosest.current = gsap.utils.snap(snaps.current);
			resizing.current = false;
		});
	};

	const tick = () => {
		const ratio = gsap.ticker.deltaRatio();
		tc.current = gsap.utils.interpolate(tc.current, t.current, 0.1 * ratio);
		const diff = gsap.utils.clamp(0, 1, 1 - Math.abs(0.001 * (t.current - tc.current)));
		containerRef.current && containerRef.current.style.setProperty('--diff', diff);
		idx();
		applyTransforms();
	};

	const show = (slide) => {
		slide.el.classList.remove('is-not-visible');
	};

	const hide = (slide) => {
		slide.el.classList.add('is-not-visible');
		slide.el.classList.remove('is-right');
	};

	const transform = (slide, offset) => {
		slide.el.style.transform = `translate3d(${-offset}px, 0, 0)`;
	};

	const handleClick = (index) => {
		setActiveIndex(index);
		const center = window.innerWidth / 2 + increase.current / 2;
		const slide = cache.current[index];
		const rect = slide.bounds;
		const isLeft = rect ? rect.left + rect.width / 2 < window.innerWidth / 2 : false;
		const L = max.current || 0;
		const targetSnap = snaps.current[index];
		if (!L) {
			t.current = targetSnap - center;
			return;
		}
		const curr = gsap.utils.wrap(0, L, t.current + center - 5);
		let delta = targetSnap - curr;
		delta = ((delta + L / 2) % L) - L / 2;
		if (isLeft && delta < 0) delta += L;
		if (!isLeft && delta > 0) delta -= L;
		if (Math.abs(delta) > L / 2) delta += delta > 0 ? -L : L;
		t.current += delta;
	};

	return (
		<div
			className={`flex items-start slides-wrap select-none pointer-events-none absolute inset-0${
				reverse ? ' is-reverse' : ''
			}`}
			ref={containerRef}
		>
			<div className='relative slides flex items-start w-full pointer-events-auto'>
				{PROJECTS.map((item, i) => (
					<div
						key={i}
						ref={(el) => (slideRefs.current[i] = el)}
						onClick={() => handleClick(i)}
						className={`group relative slide ${i === activeIndex ? ' is-big' : ''}${
							i < activeIndex ? ' is-left' : ''
						}${i > activeIndex ? ' is-right' : ''}`}
					>
						<div
							ref={(el) => (contentRefs.current[i] = el)}
							className='slide__content pt-[125%] relative origin-top cursor-pointer'
						>
							<div
								ref={(el) => (textRefs.current[i] = el)}
								className='slide__text absolute left-0 bottom-full w-full pb-4'
							>
								<div className='flex flex-col js-i-slide-text'>
									<div className='slide__index mb-4'>{(i + 1 > 9 ? '' : '0') + (i + 1) + '.'}</div>
									<h2 className='leading-none text-responsive-sm mb-2'>{item.title}</h2>
									<div className='leading-none uppercase'>[ {item.type} ]</div>
								</div>
							</div>
							<div
								ref={(el) => (scaleRefs.current[i] = el)}
								className={`slide__scale absolute origin-top inset-0 js-i-slide js-slide-content${
									i !== 3 ? ' overflow-hidden' : ''
								}${i === 3 ? ' is-i-big js-i-scale' : ''}`}
							>
								<div className='absolute inset-0 origin-top overflow-hidden js-i-slide-mask'>
									<div className='absolute inset-0 overflow-hidden js-i-slide-mask-inside'>
										<div className='absolute inset-0 media-fill'>
											<Image
												className='js-t-stack-item'
												src={item.image}
												alt=''
												fill
												priority
												style={{
													objectFit: 'cover',
													objectPosition: 'center',
												}}
												draggable={false}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
