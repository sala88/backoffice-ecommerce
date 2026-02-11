import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-900 text-white py-3 px-6 text-sm mt-auto flex flex-row items-center justify-between">
      <span className="text-left">© {new Date().getFullYear()} Backoffice E-Commerce. Tutti i diritti riservati.</span>
      <Link href="/docs" className="hover:underline text-blue-200 text-right">API Docs</Link>
    </footer>
  );
}
