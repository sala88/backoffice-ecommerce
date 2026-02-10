"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch(() => {
        setError("Errore nel caricamento prodotto");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error();
      setSuccess("Prodotto aggiornato!");
    } catch {
      setError("Errore aggiornamento prodotto");
    }
  };

  const handleDelete = async () => {
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      setError("Errore eliminazione prodotto");
    }
  };

  if (loading) return <div className="p-8">Caricamento...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!product) return <div className="p-8">Prodotto non trovato</div>;

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Modifica prodotto</h1>
        <input
          name="name"
          value={product.name || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="Nome"
        />
        <textarea
          name="description"
          value={product.description || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="Descrizione"
        />
        <input
          name="price"
          type="number"
          value={product.price || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="Prezzo"
        />
        <input
          name="discount"
          type="number"
          value={product.discount || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="Prezzo scontato (opzionale)"
        />
        <input
          name="discountPct"
          type="number"
          value={product.discountPct || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="% Sconto (opzionale)"
        />
        {success && <div className="text-green-600 text-sm">{success}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2 mt-2">
          <Button onClick={handleSave}>Salva</Button>
          <Button variant="destructive" onClick={handleDelete}>Elimina</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Indietro</Button>
        </div>
      </div>
    </div>
  );
}
