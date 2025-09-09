'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import CustomEase from 'gsap/CustomEase';
gsap.registerPlugin(CustomEase);
CustomEase.create('snappy', '0.19,1,0.22,1');

const slides = [
	{ id: 1, image: '/image-1.jpg', title: 'Aurora' },
	{ id: 2, image: '/image-2.jpg', title: 'Obsidian' },
	{ id: 3, image: '/image-3.jpg', title: 'Zenith' },
	{ id: 4, image: '/image-4.jpg', title: 'Eclipse' },
	{ id: 5, image: '/image-5.jpg', title: 'Nebula' },
	{ id: 6, image: '/image-6.jpg', title: 'Lumen' },
	{ id: 7, image: '/image-1.jpg', title: 'Prism' },
	{ id: 8, image: '/image-2.jpg', title: 'Solace' },
	{ id: 9, image: '/image-3.jpg', title: 'Vortex' },
	{ id: 10, image: '/image-4.jpg', title: 'Horizon' },
];

const lerp = (a, b, n) => (1 - n) * a + n * b;

export default function Home() {
	const items = useRef([]);
	const wrapper = useRef();
	const list = useRef();
	const listWidth = useRef(0);
	const itemWidth = useRef(0);
	const scrollerWidth = useRef(0);
	const scrollObj = useRef({ current: 0, target: 0, speed: 0 });
	const translate = useRef(0);
	const raf = useRef(null);
	const touchStart = useRef(0);
	const touchY = useRef(0);
	const isDragging = useRef(false);

	const dispose = (scroll) => {
		gsap.set(items.current, {
			width: itemWidth.current,
			x: (i) => i * itemWidth.current + scroll,
			modifiers: {
				x: (x) => {
					const s = gsap.utils.wrap(
						-itemWidth.current,
						scrollerWidth.current - itemWidth.current,
						parseFloat(x)
					);
					return `${s}px`;
				},
			},
		});

		const center = window.innerWidth / 2;

		items.current.forEach((el) => {
			if (!el) return;

			const rect = el.getBoundingClientRect();
			const elCenter = rect.left + rect.width / 2;
			const dist = elCenter - center;

			const content = el.querySelector('.item-content');
			const image = el.querySelector('.item-image');

			if (!content || !image) return;

			let scale = 1;
			let offsetX = 0;

			if (Math.abs(dist) < itemWidth.current / 2) {
				scale = 2;
				offsetX = -itemWidth.current * 0.5;
			} else if (dist < 0) {
				offsetX = -itemWidth.current * 0.5;
			} else {
				offsetX = itemWidth.current * 0.5;
			}

			gsap.to(image, {
				scale,
				x: offsetX,
				duration: 1.5,
				ease: 'snappy',
				overwrite: 'auto',
				transformOrigin: 'left top',
			});

			gsap.to(content, {
				x: offsetX,
				duration: 1.5,
				ease: 'snappy',
				overwrite: 'auto',
			});
		});
	};

	const onWheel = (e) => {
		scrollObj.current.target -= e.deltaY;
	};

	const onResize = () => {
		listWidth.current = list.current.clientWidth;
		itemWidth.current = window.innerWidth / (slides.length - 1); // each item covers ~70% of viewport
		scrollerWidth.current = items.current.length * itemWidth.current;
	};

	const update = () => {
		raf.current = requestAnimationFrame(update);

		translate.current = lerp(translate.current, scrollObj.current.target, 0.08);

		const snapPointRatio = 0.5;

		if (!isDragging.current) {
			const snapPointX = window.innerWidth * snapPointRatio;
			const center = translate.current + snapPointX;
			const index = Math.round((center - itemWidth.current / 2) / itemWidth.current);
			const snapTarget = index * itemWidth.current + itemWidth.current / 2 - snapPointX;
			scrollObj.current.target = lerp(scrollObj.current.target, snapTarget, 0.08);
		}

		dispose(translate.current);

		scrollObj.current.speed = translate.current - scrollObj.current.current;
		scrollObj.current.current = translate.current;
	};

	const onTouchStart = (e) => {
		touchStart.current = e.clientX || e.touches[0].clientX;
		isDragging.current = true;
	};

	const onTouchMove = (e) => {
		if (!isDragging.current) return;
		touchY.current = e.clientX || e.touches[0].clientX;
		scrollObj.current.target += (touchY.current - touchStart.current) * 1.5;
		touchStart.current = touchY.current;
	};

	const onTouchEnd = () => {
		isDragging.current = false;
	};

	const addEventListeners = () => {
		wrapper.current.addEventListener('wheel', onWheel);
		wrapper.current.addEventListener('mousewheel', onWheel);
		wrapper.current.addEventListener('touchstart', onTouchStart);
		wrapper.current.addEventListener('touchmove', onTouchMove);
		wrapper.current.addEventListener('touchend', onTouchEnd);
		wrapper.current.addEventListener('mousedown', onTouchStart);
		wrapper.current.addEventListener('mousemove', onTouchMove);
		wrapper.current.addEventListener('mouseleave', onTouchEnd);
		wrapper.current.addEventListener('mouseup', onTouchEnd);
	};

	const removeEventListeners = () => {
		wrapper.current.removeEventListener('wheel', onWheel);
		wrapper.current.removeEventListener('mousewheel', onWheel);
		wrapper.current.removeEventListener('touchstart', onTouchStart);
		wrapper.current.removeEventListener('touchmove', onTouchMove);
		wrapper.current.removeEventListener('touchend', onTouchEnd);
		wrapper.current.removeEventListener('mousedown', onTouchStart);
		wrapper.current.removeEventListener('mousemove', onTouchMove);
		wrapper.current.removeEventListener('mouseleave', onTouchEnd);
		wrapper.current.removeEventListener('mouseup', onTouchEnd);
	};

	useEffect(() => {
		onResize();
		dispose(0);
		update();
		addEventListeners();
		window.addEventListener('resize', onResize);

		return () => {
			removeEventListeners();
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(raf.current);
		};
	}, []);

	return (
		<main className='h-screen w-full overflow-clip fixed bg-zinc-950' ref={wrapper}>
			<div className='flex items-start select-none pointer-events-none absolute inset-0 pt-[20vh]'>
				<div className='relative slides flex items-start w-full pointer-events-auto' ref={list}>
					{slides.map((slide, idx) => (
						<div className='group absolute' key={slide.id} ref={(ref) => (items.current[idx] = ref)}>
							<div className='pt-[125%] relative origin-top cursor-pointer'>
								<div className='item-content absolute left-0 bottom-full w-full pb-0.5'>
									<div className='text-zinc-100 text-sm'>
										{slide.id < 10 ? '0' + slide.id : slide.id}.
									</div>
									<div className='text-zinc-100 my-2'>{slide.title}</div>
								</div>
								<div className='item-image absolute inset-0 origin-top overflow-hidden'>
									<div className='absolute inset-0 origin-top overflow-hidden'>
										<div className='absolute inset-0 overflow-hidden'>
											<div className='absolute inset-0'>
												<Image
													src={slide.image}
													alt=''
													fill
													style={{
														objectFit: 'cover',
														objectPosition: 'center',
													}}
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
		</main>
	);
}
