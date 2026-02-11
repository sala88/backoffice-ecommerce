"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RegisterRequestSchema } from "@/lib/zodSchemas";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    // Validazione con zod
    const result = RegisterRequestSchema.safeParse({ email, password });
    if (!result.success) {
      const firstError = result.error.issues?.[0]?.message || "Invalid input";
      setError(firstError);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore di registrazione");
      } else {
        setSuccess("Registrazione avvenuta! Ora puoi accedere.");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError("Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">Registrati</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Caricamento..." : "Registrati"}
        </Button>
      </form>
    </div>
  );
}
