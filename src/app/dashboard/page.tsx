"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Errore nel caricamento prodotti");
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-3xl w-full">
        <h1 className="text-2xl font-bold mb-2 text-center">Dashboard</h1>
        <Button onClick={() => router.push("/products/new")}>Carica nuovo prodotto</Button>
        {loading ? (
          <div>Caricamento prodotti...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="border px-2 py-1">Nome</th>
                  <th className="border px-2 py-1">Descrizione</th>
                  <th className="border px-2 py-1">Prezzo</th>
                  <th className="border px-2 py-1">% Sconto</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="border px-2 py-1">
                      <Link href={`/products/${p.id}`} className="text-blue-600 underline hover:text-blue-800">
                        {p.name}
                      </Link>
                    </td>
                    <td className="border px-2 py-1">{p.description}</td>
                    <td className="border px-2 py-1">€ {typeof p.price === "number" ? p.price.toFixed(2) : "-"}</td>
                    <td className="border px-2 py-1">{typeof p.discountPct === "number" ? `${p.discountPct}%` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
