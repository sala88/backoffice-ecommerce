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
        setProduct(data); // <-- usa direttamente l'oggetto ricevuto
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
    // CSV validation rules: forbidden substrings
    const forbidden = ["''", '"'];
    const fields = [product.name, product.description, String(product.price), String(product.discountPct)];
    if (fields.some(field => typeof field === "string" && forbidden.some(char => field.includes(char)))) {
      setError(`Il prodotto contiene caratteri non ammessi (${forbidden.join(", ")})`);
      return;
    }
    try {
      // Converte price e discountPct in numero
      const payload = {
        ...product,
        price: product.price !== undefined && product.price !== "" ? Number(product.price) : undefined,
        discountPct: product.discountPct !== undefined && product.discountPct !== "" ? Number(product.discountPct) : null,
      };
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      // Logical delete: send full product data with isActive: false
      const payload = {
        ...product,
        isActive: false,
      };
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSuccess("Prodotto eliminato (logicamente) con successo!");
      setTimeout(() => {
        router.push("/");
      }, 1500);
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
        <label className="text-sm font-medium mb-1" htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          value={product.name || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="Nome"
        />
        <label className="text-sm font-medium mb-1" htmlFor="description">Descrizione</label>
        <textarea
          id="description"
          name="description"
          value={product.description || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="Descrizione"
        />
        <label className="text-sm font-medium mb-1" htmlFor="price">Prezzo</label>
        <input
          id="price"
          name="price"
          type="number"
          value={product.price || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="Prezzo"
        />
        <label className="text-sm font-medium mb-1" htmlFor="discountPct">% Sconto (opzionale)</label>
        <input
          id="discountPct"
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
          <Button variant="outline" onClick={() => router.push("/")}>Indietro</Button>
        </div>
      </div>
    </div>
  );
}
