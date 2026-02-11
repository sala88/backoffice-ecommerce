"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("token"));
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      router.replace("/login");
    }
  };

  return (
    <header className="w-full bg-zinc-900 text-white py-4 px-6 flex items-center justify-between shadow">
      <Link href="/" className="text-xl font-bold">
        Backoffice E-Commerce
      </Link>
      <nav className="flex gap-4">
        {!isLoggedIn && (
          <>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/register" className="hover:underline">Registrati</Link>
          </>
        )}
        {isLoggedIn && (
          <button onClick={handleLogout} className="hover:underline bg-transparent border-none cursor-pointer text-white">Logout</button>
        )}
      </nav>
    </header>
  );
}
