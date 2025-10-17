"use client";

import { useEffect, useState, useRef } from "react";
import HeroHeader from "@/components/HeroHeader";
import Visualizations from "@/components/Visualizations";
import DeepseekPanel from "@/components/DeepSeekPanel";
import FileDropzone from "@/components/FileDropZone";
import CleanDataPanel from "@/components/CleanDataPanel";

type Mode = "csv" | "realtime" | "historical";

const FIXED_SCHEMA: Record<string, string> = {
  time: "datetime",
  Ph_Sensor: "number",
  ORP_Sensor: "number",
  CT_Sensor: "number",
  TDS_Sensor: "number",
  NH_Sensor: "number",
  DO_Sensor: "number",
  TR_Sensor: "number",
  BOD_Sensor: "number",
  COD_Sensor: "number",
  Predicted_Class: "string",
};

// ganti ke path CSV preview-mu di /public
const PREVIEW_CSV_PATH =
  "/csv/SG_KECHAU_ST_hisdata_alldata_1748499851383.csv";

export default function Page() {
  const [mode, setMode] = useState<Mode>("csv");

  // data nyata (hasil upload/realtime/historical)
  const [schema, setSchema] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [hasData, setHasData] = useState(false);

  // realtime
  const [running, setRunning] = useState(false);

  // preview (diproses lewat /api/upload juga)
  const [previewSchema, setPreviewSchema] = useState<Record<string, string>>({});
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // cegah load preview berkali-kali
  const previewLoadedRef = useRef(false);

  // ===== Helper: proses payload dari /api/upload =====
  function applyPayloadToState(
    payload: any,
    target: "real" | "preview" = "real"
  ) {
    const sc = payload?.schema ?? payload?.column_schema ?? {};
    const dataRows = payload?.clean_rows ?? [];
    if (target === "real") {
      setSchema(sc);
      setRows(dataRows);
      setHasData(true);
    } else {
      setPreviewSchema(sc);
      setPreviewRows(dataRows);
    }
  }

  // ===== Load PREVIEW (sekali saat awal) lewat /api/upload agar benar-benar "diproses" =====
  useEffect(() => {
    if (previewLoadedRef.current) return;
    previewLoadedRef.current = true;

    (async () => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);

        // Ambil CSV dari /public
        const resp = await fetch(PREVIEW_CSV_PATH);
        if (!resp.ok) throw new Error("Failed to fetch preview CSV");
        const blob = await resp.blob();

        // Buat File dari blob (agar /api/upload bisa terima seperti upload biasa)
        const file = new File([blob], "preview.csv", { type: "text/csv" });

        // Kirim ke /api/upload (proxy ke FastAPI)
        const fd = new FormData();
        fd.append("file", file);
        fd.append("datasetId", `preview-${Date.now()}`);

        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("Preview upload/ML service failed");
        const payload = await up.json();

        // Simpan sebagai PREVIEW (bukan data real)
        applyPayloadToState(payload, "preview");
      } catch (e: any) {
        console.error(e);
        setPreviewError(e?.message ?? "Preview failed");
      } finally {
        setPreviewLoading(false);
      }
    })();
  }, []);

  // ===== Reset data nyata kalau ganti mode =====
  useEffect(() => {
    setSchema({});
    setRows([]);
    setHasData(false);
    setRunning(false);
  }, [mode]);

  // ===== Handler upload nyata =====
  function handleUploaded(payload: any) {
    applyPayloadToState(payload, "real");
  }

  // ===== Realtime dummy =====
  function generateDummyRow(): Record<string, unknown> {
    const now = new Date();
    return {
      time: now.toISOString(),
      Ph_Sensor: (7 + Math.random() * 0.5).toFixed(3),
      ORP_Sensor: (0.95 + Math.random() * 0.05).toFixed(4),
      CT_Sensor: (0.01 + Math.random() * 0.05).toFixed(4),
      TDS_Sensor: (25 + Math.random() * 5).toFixed(3),
      NH_Sensor: (5 + Math.random() * 3).toFixed(3),
      DO_Sensor: (6 + Math.random() * 1).toFixed(3),
      TR_Sensor: (30 + Math.random() * 20).toFixed(3),
      BOD_Sensor: (1300 + Math.random() * 150).toFixed(3),
      COD_Sensor: (500 + Math.random() * 100).toFixed(3),
      Predicted_Class: ["I", "II", "III", "IV", "V"][Math.floor(Math.random() * 5)],
    };
  }

  useEffect(() => {
    if (mode !== "realtime" || !running) return;
    const id = setInterval(() => {
      const newRow = generateDummyRow();
      setSchema(FIXED_SCHEMA);
      setRows((prev) => [...prev.slice(-49), newRow]);
      setHasData(true);
    }, 2000);
    return () => clearInterval(id);
  }, [mode, running]);

  // ===== Historical dummy =====
  async function handleHistoricalWecon(start: string, end: string) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const step = Math.max(1, Math.floor((e - s) / 10));
    const arr: Record<string, unknown>[] = [];
    for (let i = 0; i < 10; i++) {
      const t = new Date(s + i * step).toISOString();
      const row = generateDummyRow();
      row.time = t;
      arr.push(row);
    }
    setSchema(FIXED_SCHEMA);
    setRows(arr);
    setHasData(true);
  }

  return (
    <main className="min-h-screen bg-white">
      <HeroHeader />

      <div className="container mx-auto px-4 md:px-6 pb-16">
        {/* === Pilihan Mode === */}
        <h2 className="mt-10 text-2xl font-bold text-gray-800">
          Upload your CSV data or view live monitoring from connected stations
        </h2>

        <section className="mt-4 flex flex-wrap gap-6 items-center">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="csv"
              checked={mode === "csv"}
              onChange={() => setMode("csv")}
            />
            Upload CSV
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="realtime"
              checked={mode === "realtime"}
              onChange={() => setMode("realtime")}
            />
            Realtime Wecon
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="historical"
              checked={mode === "historical"}
              onChange={() => setMode("historical")}
            />
            Historical Wecon
          </label>
        </section>

        {/* === Konten sesuai mode (kontrol) === */}
        {mode === "csv" && !hasData && (
          <section className="mt-2">
            <h3 className="text-gray-800 font-semibold mb-2">Upload CSV file</h3>
            <FileDropzone onUploaded={handleUploaded} />
          </section>
        )}

        {mode === "realtime" && !hasData && (
          <section className="mt-2 space-y-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className="px-4 py-2 border rounded-lg bg-blue-50 hover:bg-blue-100"
            >
              {running ? "Stop Realtime" : "Start Realtime"}
            </button>
          </section>
        )}

        {mode === "historical" && !hasData && (
          <section className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input type="datetime-local" id="start" className="border rounded px-2 py-1" />
              <input type="datetime-local" id="end" className="border rounded px-2 py-1" />
              <button
                onClick={() => {
                  const s = (document.getElementById("start") as HTMLInputElement).value;
                  const e = (document.getElementById("end") as HTMLInputElement).value;
                  if (s && e) handleHistoricalWecon(s, e);
                }}
                className="px-4 py-2 border rounded-lg bg-blue-50 hover:bg-blue-100"
              >
                Load Historical
              </button>
            </div>
          </section>
        )}

        {/* === PREVIEW (DI BAWAH PILIHAN UPLOAD) — hanya saat belum ada data nyata === */}
        {!hasData && (
          <section className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Preview data visualization
            </h3>

            {previewLoading && (
              <div className="text-gray-600">Loading preview…</div>
            )}

            {previewError && (
              <div className="text-red-600">
                Failed to load preview: {previewError}
              </div>
            )}

            {!previewLoading && !previewError && previewRows.length > 0 && (
              <>
                <section className="mt-6">
                  <Visualizations rows={previewRows} schema={previewSchema} />
                </section>
                <DeepseekPanel rows={previewRows} schema={previewSchema} />
                <CleanDataPanel rows={previewRows} schema={previewSchema} />
              </>
            )}
          </section>
        )}

        {/* === DATA NYATA (menimpa preview) === */}
        {hasData && (
          <>
            <section className="mt-10">
              <Visualizations rows={rows} schema={schema} />
            </section>
            <DeepseekPanel rows={rows} schema={schema} />
            <CleanDataPanel rows={rows} schema={schema} />
          </>
        )}
      </div>
    </main>
  );
}
