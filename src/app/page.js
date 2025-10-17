import ResponsiveCarousel from '@/components/views/ResponsiveCarousel';

export default function Home() {
	return (
		<div className='z-10'>
			<ResponsiveCarousel />
			<div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[50vw] lg:max-w-[calc((448/1920)*100vw)] pointer-events-none media-fill z-[998] js-t-stack-start'>
				<div className='pt-[125%]'></div>
			</div>
		</div>
	);
}
