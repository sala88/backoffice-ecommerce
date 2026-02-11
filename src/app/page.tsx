"use client";

import { useEffect, useState } from "react";
import ProductsHome from "./products/page";

export default function Home() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setIsLoggedIn(!!localStorage.getItem("token"));
		}
	}, []);

	return <ProductsHome publicView={!isLoggedIn} />;
}
