'use client';

import gsap from 'gsap';
import { useCallback, useEffect, useRef, useState } from 'react';

// Utility functions (you'll need to implement these)
import Image from 'next/image';
import { getBounds, lerp } from '../lib/utils'; // Linear interpolation

export default function InfiniteHorizontalCarousel({ items }) {
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
	const last = useRef(0);
	const current = useRef(3);
	const [loaded, setLoaded] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const st = useRef(null);
	const reverse = useRef(false);
	const active = useRef(false);
	const forwards = useRef(true);
	const max = useRef(0);
	const of = useRef(0);
	const scrolling = useRef(false);
	const snapToClosest = useRef(() => 0);
	const snapWidth = useRef(() => 0);
	const increase = useRef(0);

	useEffect(() => {
		requestAnimationFrame(() => {
			resize();
			bindEvents();
			classes();
			setLoaded(true);
		});

		return () => {
			unbindEvents();
		};
	}, []);

	const classes = () => {
		if (!cache.current) return;
		cache.current.forEach((slide, i) => {
			if (!slide.visible) return;
			// big class
			if (i === current.current) slide.el.classList.add('is-big');
			else slide.el.classList.remove('is-big');
			// left/right classes based on progress
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
		containerRef.current.addEventListener('resize', resize);
		containerRef.current.addEventListener('wheel', scroll);
	};

	const unbindEvents = () => {
		containerRef.current.removeEventListener('resize', resize);
		containerRef.current.removeEventListener('wheel', scroll);
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

	const idx = () => {
		if (snapToClosest.current) {
			const center = window.innerWidth / 2 + increase.current / 2;
			const wrapped = gsap.utils.wrap(0, max.current, tc.current + center - 5);
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

	const clamp = () => {
		t.current = gsap.utils.clamp(0, max.current, t.current);
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

				if (slide.visible || isResizing) {
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
		setIsResizing(true);
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
			setIsResizing(false);
		});
	};

	const tick = () => {
		const ratio = gsap.ticker.deltaRatio();
		tc.current = gsap.utils.interpolate(tc.current, t.current, 0.1 * ratio);
		const diff = gsap.utils.clamp(0, 1, 1 - Math.abs(0.001 * (t.current - tc.current)));
		containerRef.current.style.setProperty('--diff', diff);
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

	useEffect(() => {
		gsap.ticker.add(tick);
		return () => gsap.ticker.remove(tick);
	}, []);

	return (
		<div className='fixed inset-0 flex overflow-hidden' ref={containerRef}>
			<div
				className={`flex items-start slides-wrap select-none pointer-events-none absolute inset-0${
					reverse ? ' is-reverse' : ''
				}`}
				style={{ position: 'relative', width: '100%' }}
			>
				<div className='relative slides flex items-start w-full pointer-events-auto'>
					{items.map((item, i) => (
						<article
							key={i}
							ref={(el) => (slideRefs.current[i] = el)}
							className={`group relative slide js-i-slide-parent${i === 3 ? ' is-big' : ''}${
								i < 3 ? ' is-left' : ''
							}${i > 3 ? ' is-right' : ''}`}
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
										<div className='slide__index mb-4'>
											{(i + 1 > 9 ? '' : '0') + (i + 1) + '.'}
										</div>
										<h2 className='leading-none uppercase'>{item.title}</h2>
									</div>
								</div>
								<div
									ref={(el) => (scaleRefs.current[i] = el)}
									className={`slide__scale absolute origin-top inset-0 js-i-slide js-slide-content${
										i !== 3 ? ' overflow-hidden' : ''
									}${i === 3 ? ' is-i-big js-i-scale' : ''}`}
								>
									<div
										className={`absolute inset-0 origin-top overflow-hidden js-i-slide-mask${
											i === 3 ? ' js-i-flip' : ''
										}`}
									>
										<div className='absolute inset-0 overflow-hidden js-i-slide-mask-inside'>
											<div className='absolute inset-0 media-fill'>
												<Image
													className='js-t-stack-item js-t-flip'
													src={item.image}
													alt=''
													fill
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
						</article>
					))}
				</div>
			</div>
		</div>
	);
}
