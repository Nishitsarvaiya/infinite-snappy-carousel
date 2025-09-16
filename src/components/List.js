'use client';

import { useActiveItem } from '@/context/ActiveItemContextProvider';
import { ITEMS } from '@/lib/constants';
import gsap from 'gsap';
import Flip from 'gsap/Flip';
import Image from 'next/image';
import { useEffect } from 'react';

export default function List() {
	const { activeIndex } = useActiveItem();

	useEffect(() => {
		// Only when directly loaded on /list
		const stackEnd = document.querySelector('.js-t-stack-end');
		const stackItems = document.querySelectorAll('.js-t-stack-item');

		if (!stackEnd || stackItems.length === 0) return;

		stackItems.forEach((item, i) => {
			// record Flip state
			const state = Flip.getState(item);

			// move to new container
			stackEnd.appendChild(item);

			// restore zIndex so previously active stays on top
			gsap.set(item, {
				zIndex: activeIndex !== null && i === activeIndex ? stackItems.length + 1 : stackItems.length - i,
			});

			// animate from old state
			Flip.from(state, {
				absolute: true,
				scale: true,
				simple: true,
				duration: 1,
				delay: 0.05 * i,
				ease: 'snappy',
			});
		});
	}, [activeIndex]);

	return (
		<div className='fixed inset-0 flex items-end overflow-hidden'>
			<div className='absolute inset-0 pointer-events-none z-2'>
				<div className='grid grid-cols-12 gap-6 pt-[calc((160/1920)*100vw)] px-12'>
					<div className='col-span-2'>
						<div className='relative'>
							<div className='pt-[125%]'>
								<div className='absolute inset-0 media-fill js-t-stack-end'></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
