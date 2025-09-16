'use client';

import { createContext, useContext, useState } from 'react';

const ActiveItemContext = createContext({
	activeIndex: 0,
	setActiveIndex: () => {},
});

export function ActiveItemContextProvider({ children }) {
	const [activeIndex, setActiveIndex] = useState(0);

	return <ActiveItemContext.Provider value={{ activeIndex, setActiveIndex }}>{children}</ActiveItemContext.Provider>;
}

export function useActiveItem() {
	return useContext(ActiveItemContext);
}
