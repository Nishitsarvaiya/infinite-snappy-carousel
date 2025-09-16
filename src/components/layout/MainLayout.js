import { ActiveItemContextProvider } from '@/context/ActiveItemContextProvider';
import Footer from './Footer';
import Header from './Header';
import { Providers } from '@/app/providers';

export default function MainLayout({ children }) {
	return (
		<ActiveItemContextProvider>
			<Providers>
				<Header />
				<main className='fixed inset-0 flex items-end overflow-hidden'>
					{children}
					<Footer />
				</main>
			</Providers>
		</ActiveItemContextProvider>
	);
}
