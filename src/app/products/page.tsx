"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    fetch(`/api/products?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Errore nel caricamento prodotti");
        setLoading(false);
      });
  }, [router, page, pageSize]);

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-3xl w-full">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-center">Prodotti</h1>
          <span className="ml-4 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold border border-blue-200 whitespace-nowrap">
            Totale: {total}
          </span>
        </div>
        <Button onClick={() => router.push("/products/new")}>Carica nuovo prodotto</Button>
        {loading ? (
          <div>Caricamento prodotti...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">Non ci sono prodotti.</div>
            ) : (
              <>
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
                <div className="flex justify-center gap-2 mt-4">
                  <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Pagina precedente
                  </Button>
                  <span className="self-center">Pagina {page} di {totalPages}</span>
                  <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    Pagina successiva
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
