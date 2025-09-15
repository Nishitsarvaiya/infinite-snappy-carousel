import gsap from 'gsap';
import Carousel from './Carousel';
import CustomEase from 'gsap/CustomEase';
import InfiniteHorizontalCarousel from './InfiniteHorizontalCarousel';
gsap.registerPlugin(CustomEase);
CustomEase.create('snap', '0.19,1,0.22,1');

const items = [
	{ id: 1, image: '/image-1.jpg', title: 'Aurora' },
	{ id: 2, image: '/image-2.jpg', title: 'Obsidian' },
	{ id: 3, image: '/image-3.jpg', title: 'Zenith' },
	{ id: 4, image: '/image-4.jpg', title: 'Eclipse' },
	{ id: 5, image: '/image-5.jpg', title: 'Nebula' },
	{ id: 6, image: '/image-6.jpg', title: 'Lumen' },
	{ id: 7, image: '/image-7.jpg', title: 'Prism' },
	{ id: 8, image: '/image-8.jpg', title: 'Solace' },
	{ id: 9, image: '/image-9.jpg', title: 'Vortex' },
	{ id: 10, image: '/image-10.jpg', title: 'Horizon' },
	{ id: 11, image: '/image-11.jpg', title: 'Elyfto' },
];

export default function Home() {
	return (
		<main>
			{/* <Carousel /> */}
			<InfiniteHorizontalCarousel items={items} />
		</main>
	);
}
