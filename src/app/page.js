import InfiniteHorizontalCarousel from '../components/InfiniteHorizontalCarousel';
import { Link } from 'next-transition-router';

export default function Home() {
	return (
		<main>
			{/* <Carousel /> */}
			<InfiniteHorizontalCarousel />
			<div className='fixed left-6 bottom-6 uppercase'>
				<Link href='/'>Carousel</Link> / <Link href='/list'>List</Link>
			</div>
			<div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[calc((448/1920)*100vw)] pointer-events-none media-fill z-[998] js-t-stack-start'>
				<div className='pt-[125%]'></div>
			</div>
		</main>
	);
}
