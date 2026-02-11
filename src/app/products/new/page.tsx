"use client";
import { useEffect, useState, useRef } from "react";
// Per parsing CSV lato client
// npm install papaparse se vuoi parsing avanzato
// import Papa from "papaparse";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [csvSuccess, setCsvSuccess] = useState("");
  const [csvError, setCsvError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
    // Drag & Drop handlers
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleCSVImport({ target: { files: e.dataTransfer.files } } as any);
      }
    };
  // Gestione importazione CSV prodotti
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvSuccess("");
    setCsvError("");
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };



  const handleProcessCSV = async () => {
    setCsvSuccess("");
    setCsvError("");
    if (!selectedFile) return;
    try {
      setCsvSuccess("Richiesta presigned URL...");
      // Richiedi presigned URL
      const res = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: selectedFile.name, contentType: selectedFile.type || "text/csv" }),
      });
      if (!res.ok) throw new Error("Errore richiesta presigned url");
      const data = await res.json();
      const url = data.url;
      const bucket = data.bucket;
      const key = data.key;
      setCsvSuccess("Presigned URL ottenuto. Upload in corso...");
      // Carica il file CSV su MinIO/S3
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type || "text/csv" },
        body: selectedFile,
      });
      if (!uploadRes.ok) throw new Error("Upload fallito");
      setCsvSuccess("Upload completato. Avvio processazione...");
      // Chiama API per processare il CSV caricato
      const processRes = await fetch("/api/upload/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, key }),
      });
      if (!processRes.ok) throw new Error("Errore durante la processazione del CSV");
      setCsvSuccess("CSV caricato e processato con successo!");
      setSelectedFile(null);
      setCsvContent("");
    } catch (err) {
      setCsvError("Errore durante l'importazione o upload del CSV");
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);



  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col gap-8 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-sm">
        <button
          type="button"
          className="self-start mb-2 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-white rounded px-3 py-1 hover:bg-gray-300 dark:hover:bg-zinc-700 transition"
          onClick={() => router.push('/')}
        >
          ← Indietro
        </button>
        <h1 className="text-2xl font-bold mb-2 text-center">Importa prodotti da CSV</h1>
        <div
          className={`flex flex-col gap-2 border-2 border-dashed rounded px-3 py-8 items-center transition-colors ${dragActive ? 'border-blue-600 bg-blue-50 dark:bg-zinc-800' : 'border-zinc-300 dark:border-zinc-700'}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVImport}
            className="hidden"
          />
          <span className="font-semibold text-center">Trascina qui il file CSV oppure clicca per selezionarlo</span>
          {selectedFile && (
            <span className="text-sm text-zinc-700 dark:text-zinc-200">File selezionato: {selectedFile.name}</span>
          )}
          <button
            type="button"
            className={`mt-2 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 ${!selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={e => { e.stopPropagation(); if(selectedFile) handleProcessCSV(); }}
            disabled={!selectedFile}
          >Carica CSV</button>
          {csvError && <div className="text-red-500 text-sm">{csvError}</div>}
          {csvSuccess && <div className="text-green-600 text-sm">{csvSuccess}</div>}
          <span className="text-xs text-zinc-500">Formato: nome,prezzo per riga</span>
        </div>
      </div>
    </div>
  );
}
