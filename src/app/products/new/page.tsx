"use client";
import { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { ProductInputSchema } from "@/lib/zodSchemas";
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
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
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
    setCsvErrors([]);
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      // Parsing e validazione
      const results = Papa.parse(text, { skipEmptyLines: true });
      const rows = results.data as string[][];
      if (!rows.length) {
        setCsvErrors(["CSV vuoto"]);
        return;
      }
      // Header check
      const [firstRow, ...restRows] = rows;
      const isHeader = firstRow[0]?.toLowerCase().includes("nome");
      const dataRows = isHeader ? restRows : rows;
      const errors: string[] = [];
      const seenNames = new Set<string>();
      // 🔽 Controllo campi invalidi tipo '' o quote non chiuse
      dataRows.forEach((row, idx) => {
        // [name, description, price, discountPct]
        if (row.length < 4) {
          errors.push(`Riga ${idx + 2}: colonne insufficienti`);
          return;
        }
        // Controllo se la riga contiene caratteri/substrings non ammessi
        const forbidden = ["''", '"'];
        if (
          row.some(field =>
            typeof field === "string" && forbidden.some(char => field.includes(char))
          )
        ) {
          errors.push(`Riga ${idx + 2}: la riga contiene caratteri non ammessi`);
        }
        const [name, description, price, discountPct] = row;
        if (parseFloat(price) <= 0 || isNaN(parseFloat(price))) {
          errors.push(`Riga ${idx + 2}: Prezzo deve essere maggiore di 0`);
          return;
        }
        if (!name) errors.push(`Riga ${idx + 2}: Nome mancante`);
        if (seenNames.has(name)) errors.push(`Riga ${idx + 2}: Nome duplicato`);
        seenNames.add(name);
        let discountValue = 0;
        if (discountPct != null && discountPct !== "" && !isNaN(parseFloat(discountPct))) {
          discountValue = parseFloat(discountPct);
        }
        // Controllo intero positivo tra 0 e 100
        if (!Number.isInteger(discountValue) || discountValue < 0 || discountValue > 100) {
          errors.push(`Riga ${idx + 2}: Sconto deve essere un intero tra 0 e 100`);
          return;
        }
        const parsed = ProductInputSchema.safeParse({
          name,
          description,
          price: parseFloat(price),
          discountPct: discountValue,
        });
        if (!parsed.success) {
          errors.push(`Riga ${idx + 2}: ` + parsed.error.issues.map(e => e.message).join(", "));
        }
      });
      setCsvErrors(errors);
    };
    reader.readAsText(file);
  };



  const handleProcessCSV = async () => {
    setCsvSuccess("");
    setCsvError("");
    if (!selectedFile) return;
    if (csvErrors.length > 0) {
      setCsvError("Correggi gli errori nel CSV prima di caricare.");
      return;
    }
    try {
      // 1. Richiesta presigned URL
      const uniqueSuffix = Date.now();
      const uniqueFileName = `${uniqueSuffix}_${selectedFile.name}`;
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ filename: uniqueFileName }),
      });
      if (!presignRes.ok) {
        setCsvError("Errore nella richiesta presigned URL");
        return;
      }
      const presignData = await presignRes.json();
      // 2. Upload file su S3/Minio
      const uploadRes = await fetch(presignData.url, {
        method: "PUT",
        body: selectedFile,
        headers: presignData.headers || {},
      });
      if (!uploadRes.ok) {
        setCsvError("Errore nell'upload su S3/Minio");
        return;
      }
      // 3. Chiamata API process CSV
      const processRes = await fetch("/api/upload/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          bucket: presignData.bucket,
          key: presignData.key,
        }),
      });
      if (!processRes.ok) {
        const errData = await processRes.json();
        setCsvError(errData.error || "Errore durante il process CSV");
        return;
      }
      setCsvSuccess("Importazione completata!");
      setSelectedFile(null);
      setCsvContent("");
      setCsvErrors([]);
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
        {csvErrors.length > 0 && (
          <div className="bg-red-100 text-red-700 rounded p-2 text-xs">
            <b>Errori CSV:</b>
            <ul className="list-disc ml-4">
              {csvErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}
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
