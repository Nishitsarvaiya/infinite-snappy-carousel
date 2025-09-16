import List from '@/components/views/List';
import { PROJECTS } from '@/lib/constants';
import Image from 'next/image';

export default function page() {
	return (
		<main>
			<List />
			<div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[calc((448/1920)*100vw)] pointer-events-none media-fill z-[998] js-t-stack-start'>
				<div className='pt-[125%]'>
					{PROJECTS.map((item) => (
						<Image
							className='js-t-stack-item'
							key={item.id}
							src={item.image}
							alt=''
							fill
							style={{ objectFit: 'cover', objectPosition: 'center' }}
						/>
					))}
				</div>
			</div>
		</main>
	);
}
