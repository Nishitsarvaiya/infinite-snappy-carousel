'use client';

import { useActiveItem } from '@/context/ActiveItemContextProvider';
import { PROJECTS } from '@/lib/constants';
import gsap from 'gsap';
import Flip from 'gsap/Flip';
import { useEffect, useRef } from 'react';

export default function List() {
	const { activeIndex, setActiveIndex } = useActiveItem();
	const stackItemsRef = useRef([]);
	const maxZ = useRef(0);

	useEffect(() => {
		const stackEnd = document.querySelector('.js-t-stack-end');
		const stackItems = document.querySelectorAll('.js-t-stack-item');
		stackItemsRef.current = Array.from(stackItems);
		maxZ.current = stackItemsRef.current.length;
		const textItems = document.querySelectorAll('.js-item-text');

		if (!stackEnd || stackItems.length === 0) return;

		stackItems.forEach((item, i) => {
			const state = Flip.getState(item);
			stackEnd.appendChild(item);
			gsap.set(item, {
				zIndex: activeIndex !== null && i === activeIndex ? stackItems.length + 1 : stackItems.length - i,
			});

			Flip.from(state, {
				absolute: true,
				scale: true,
				simple: true,
				duration: 1,
				delay: 0.05 * i,
				ease: 'snappy',
			});
		});

		gsap.fromTo(
			textItems,
			{ yPercent: 100 },
			{
				yPercent: 0,
				duration: 1.25,
				ease: 'smoothy',
				stagger: 0.075,
				delay: 0.5,
			}
		);
	}, []);

	const handleClick = (index) => {
		setActiveIndex(index);
		const el = stackItemsRef.current[index];
		if (!el) return;
		maxZ.current += 1;
		gsap.set(el, { zIndex: maxZ.current });
	};

	return (
		<div className='fixed inset-0 flex items-end overflow-hidden'>
			<div className='absolute inset-0 pointer-events-none z-2'>
				<div className='js-grid grid grid-cols-12 gap-6 pt-[calc((160/1920)*100vw)] px-12'>
					<div className='col-span-2'>
						<div className='relative'>
							<div className='pt-[125%]'>
								<div className='absolute inset-0 media-fill js-t-stack-end'></div>
							</div>
						</div>
					</div>
					<div className='col-start-5 -col-end-1'>
						<div className='flex flex-wrap gap-x-4'>
							{PROJECTS.map((item, i) => (
								<div
									key={item.id}
									className={`text-[calc((64/1920)*100vw)] font-semibold leading-tight overflow-hidden cursor-pointer pointer-events-auto group`}
									onClick={() => handleClick(i)}
								>
									<div className='js-item-text'>
										<div
											className={`${
												activeIndex !== null && i === activeIndex ? 'opacity-100' : 'opacity-25'
											} group-hover:opacity-100 duration-200`}
										>
											{item.title}
											{i !== PROJECTS.length - 1 && ','}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
