"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function DashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-3xl w-full">
        <h1 className="text-2xl font-bold mb-2 text-center">Overview</h1>
        <p className="text-center">Benvenuto nel backoffice. Qui puoi gestire i prodotti e visualizzare le statistiche.</p>
        <div className="flex justify-center mt-4">
          <Button asChild>
            <Link href="/products/new">Carica prodotti</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
