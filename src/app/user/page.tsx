"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserDetailsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    // Simulazione fetch dati utente
    setTimeout(() => {
      setUser({ email: "utente@example.com", nome: "Mario Rossi" });
      setLoading(false);
    }, 500);
  }, [router]);

  if (loading) return <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">Caricamento...</div>;

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-sm items-center">
        <h1 className="text-2xl font-bold mb-2 text-center">Dettagli Utente</h1>
        <div className="text-lg">Nome: {user.nome}</div>
        <div className="text-lg">Email: {user.email}</div>
      </div>
    </div>
  );
}
