import { useState, useRef, useCallback } from "react";
import { ScanLine, Upload, FileText, Sparkles, AlertCircle, ArrowRight, Check, X } from "lucide-react";
import Tesseract from "tesseract.js";
import type { Category, ScanResult } from "../types";
import { formatMXN } from "../lib/formatters";
import { getCatInfo, CategoryIcon } from "./CategoryHelpers";

interface ScanModalProps {
  onResult: (result: ScanResult) => void;
  onClose: () => void;
}

type ScanState = "idle" | "scanning" | "done" | "error";

const CATEGORY_KEYWORDS: { category: Category; words: string[] }[] = [
  { category: "salud", words: ["farmacia","hospital","clínica","clinica","médico","medico","doctor","laboratorio","dental","cruz roja","imss","issste","medicamento","medicina"] },
  { category: "transporte", words: ["gasolina","gas station","oxxo gas","pemex","bp","shell","taxi","uber","cabify","didi","metro","metrobús","metrobus","autobús","autobus","transporte","estacionamiento","parking","caseta","peaje","aeropuerto","vuelo"] },
  { category: "servicios", words: ["cfe","electricidad","luz","telmex","telcel","at&t","movistar","internet","cable","agua","gas natural","gas lp","renta","predial","seguros","seguro","netflix","spotify","amazon","apple","google","microsoft","suscripcion","suscripción"] },
  { category: "ocio", words: ["cine","cinépolis","cinemex","teatro","concierto","evento","bar","cantina","club","antro","restaurante","cafe","café","coffee","starbucks","hotel","airbnb","viaje","tour","museo","parque"] },
  { category: "comida", words: ["walmart","soriana","chedraui","costco","sam's","superama","la comer","mercado","verdulería","verduleria","carnicería","carniceria","panadería","panaderia","frutas","abarrotes","supermercado","despensa","grocery"] },
];

function detectCategory(text: string): Category {
  const lower = text.toLowerCase();
  for (const { category, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => lower.includes(w))) return category;
  }
  return "otros";
}

function extractAmount(text: string): number | null {
  const patterns = [
    /(?:total|importe|pagar|cobrado|cargo|amount)\s*[:\-]?\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /\$\s*([\d,]+(?:\.\d{1,2})?)\s*(?:mxn|mx|pesos)?/gi,
    /([\d,]+(?:\.\d{2}))\s*(?:mxn|pesos)/gi,
  ];
  for (const pat of patterns) {
    const matches = [...text.matchAll(pat)];
    if (matches.length) {
      const best = Math.max(...matches.map((m) => parseFloat(m[1].replace(/,/g, ""))));
      if (best > 0) return best;
    }
  }
  return null;
}

function extractMerchant(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 2 && !/^\d+$/.test(l));
  return lines[0] ?? "Factura";
}

async function runOCR(file: File, onProgress: (step: number) => void): Promise<ScanResult> {
  onProgress(0);
  const result = await Tesseract.recognize(file, "spa+eng", {
    logger: (m) => {
      if (m.status === "recognizing text") onProgress(Math.min(3, Math.floor(m.progress * 3)));
    },
  });
  onProgress(3);
  const rawText = result.data.text;
  return {
    amount: extractAmount(rawText) ?? 0,
    category: detectCategory(rawText),
    note: extractMerchant(rawText),
    confidence: result.data.confidence / 100,
    rawText: rawText.trim().slice(0, 200),
  };
}

export function ScanModal({ onResult, onClose }: ScanModalProps) {
  const [state, setState] = useState<ScanState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") return;
    setFileName(file.name);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
    setState("scanning");
    try {
      const res = await runOCR(file, setScanStep);
      setResult(res);
      setState("done");
    } catch {
      setState("error");
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const scanLines = ["Cargando motor OCR...", "Leyendo texto de imagen...", "Extrayendo monto...", "Clasificando categoría..."];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center">
              <ScanLine size={15} className="text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">Lector de facturas</h2>
              <p className="text-xs text-muted-foreground">OCR local · sin conexión</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar modal" className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6">
          {state === "idle" && (
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Seleccionar o arrastrar factura"
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all ${
                dragOver ? "border-foreground bg-muted" : "border-border hover:border-foreground/30 hover:bg-muted/50"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Upload size={24} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Arrastra tu factura aquí</p>
                <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar un archivo</p>
                <p className="text-xs text-muted-foreground mt-3">JPG, PNG · hasta 10 MB</p>
              </div>
              <label htmlFor="scan-file-input" className="sr-only">Seleccionar archivo de factura</label>
              <input id="scan-file-input" ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {state === "scanning" && (
            <div className="flex gap-5">
              <div className="w-40 h-52 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                {preview ? (
                  <img src={preview} alt="Factura" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <FileText size={28} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground text-center px-2">{fileName}</p>
                  </div>
                )}
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <div className="absolute left-0 right-0 h-0.5 bg-foreground/60" style={{ animation: "scanLine 1.6s ease-in-out infinite" }} />
                  <div className="absolute inset-0 bg-foreground/5" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={15} className="text-foreground animate-pulse" />
                  <p className="text-sm font-semibold text-foreground">Analizando factura...</p>
                </div>
                {scanLines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < scanStep ? "bg-[#16a34a]" : i === scanStep ? "bg-foreground animate-pulse" : "bg-border"}`} />
                    <p className={`text-sm transition-colors duration-300 ${i < scanStep ? "text-[#16a34a] font-medium" : i === scanStep ? "text-foreground" : "text-muted-foreground"}`}>{line}</p>
                    {i < scanStep && <Check size={12} className="text-[#16a34a] ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {state === "done" && result && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#16a34a]/10 rounded-xl border border-[#16a34a]/20">
                <Check size={14} className="text-[#16a34a]" />
                <p className="text-xs font-medium text-[#16a34a]">Detectada con {Math.round(result.confidence * 100)}% de confianza</p>
              </div>
              <div className="flex gap-4">
                {preview && <div className="w-28 h-36 rounded-xl overflow-hidden bg-muted flex-shrink-0"><img src={preview} alt="Factura" className="w-full h-full object-cover" /></div>}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="bg-muted rounded-xl px-3 py-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Texto detectado</p>
                    <p className="text-xs text-foreground font-mono leading-relaxed whitespace-pre-line">{result.rawText}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-background border border-border rounded-xl px-3 py-2.5">
                      <p className="text-xs text-muted-foreground mb-0.5">Monto</p>
                      <p className="text-lg font-bold text-foreground">{formatMXN(result.amount)}</p>
                    </div>
                    <div className="bg-background border border-border rounded-xl px-3 py-2.5">
                      <p className="text-xs text-muted-foreground mb-1">Categoría</p>
                      <div className="flex items-center gap-1.5">
                        <CategoryIcon id={result.category} size={12} />
                        <p className="text-sm font-semibold text-foreground">{getCatInfo(result.category).label}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-xl px-3 py-2.5">
                    <p className="text-xs text-muted-foreground mb-0.5">Comercio / Nota</p>
                    <p className="text-sm font-medium text-foreground">{result.note}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-12 h-12 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center">
                <AlertCircle size={22} className="text-[#ef4444]" />
              </div>
              <p className="text-sm font-medium text-foreground">No se pudo leer la factura</p>
              <p className="text-xs text-muted-foreground text-center">Asegúrate de que la imagen sea clara y legible.</p>
              <button onClick={() => setState("idle")} className="text-xs font-medium text-foreground underline underline-offset-2 mt-1">Intentar de nuevo</button>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6">
          {state === "done" && result ? (
            <>
              <button onClick={() => { setState("idle"); setPreview(null); setResult(null); }} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-all">Escanear otra</button>
              <button onClick={() => onResult(result)} className="flex-1 h-11 rounded-xl bg-foreground text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
                Usar datos <ArrowRight size={15} />
              </button>
            </>
          ) : state !== "scanning" && (
            <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-all">Cancelar</button>
          )}
        </div>
      </div>
      <style>{`@keyframes scanLine { 0%{top:0%;opacity:1} 50%{top:95%;opacity:0.8} 100%{top:0%;opacity:1} }`}</style>
    </div>
  );
}
