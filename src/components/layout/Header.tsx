import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-zinc-900 text-white py-4 px-6 flex items-center justify-between shadow">
      <Link href="/" className="text-xl font-bold">
        Backoffice E-Commerce
      </Link>
      <nav className="flex gap-4">
        <Link href="/login" className="hover:underline">Login</Link>
        <Link href="/register" className="hover:underline">Registrati</Link>
        <Link href="/docs" className="hover:underline">API Docs</Link>
      </nav>
    </header>
  );
}
