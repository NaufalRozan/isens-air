"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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

export default function Page() {
  const [mode, setMode] = useState<Mode>("csv");
  const [schema, setSchema] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [missing, setMissing] = useState<Record<string, number>>({});
  const [oor, setOor] = useState<Record<string, number>>({});
  const [hasData, setHasData] = useState(false);

  const [running, setRunning] = useState(false);

  function handleUploaded(payload: any) {
    const sc = payload?.schema ?? payload?.column_schema ?? {};
    setSchema(sc);
    setRows(payload?.clean_rows ?? []);
    setMissing(payload?.missing_report ?? {});
    setOor(payload?.out_of_range_report ?? {});
    setHasData(true);
  }

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
    setSchema({});
    setRows([]);
    setMissing({});
    setOor({});
    setHasData(false);
    setRunning(false);
  }, [mode]);

  useEffect(() => {
    if (mode !== "realtime" || !running) return;
    const id = setInterval(() => {
      const newRow = generateDummyRow();
      setSchema(FIXED_SCHEMA);
      setRows((prev) => [...prev.slice(-49), newRow]);
      setMissing({});
      setOor({});
      setHasData(true);
    }, 2000);
    return () => clearInterval(id);
  }, [mode, running]);

  async function handleHistoricalWecon(start: string, end: string) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const step = Math.floor((e - s) / 10);

    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < 10; i++) {
      const t = new Date(s + i * step).toISOString();
      rows.push({
        time: t,
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
      });
    }

    setSchema(FIXED_SCHEMA);
    setRows(rows);
    setMissing({});
    setOor({});
    setHasData(true);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* === HERO di luar container agar background foto full-bleed === */}
      <HeroHeader />

      {/* Konten lain tetap dalam container */}
      <div className="container mx-auto px-4 md:px-6 pb-16">
        <h2 className="mt-10 text-2xl font-bold text-gray-800">
          Upload your CSV data or view live monitoring from connected stations
        </h2>

        {/* === pilih mode === */}
        <section className="mt-4 flex gap-6 items-center">
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


        {/* === konten sesuai mode === */}
        {mode === "csv" && (
          <section className="mt-2">
            <h3 className="text-gray-800 font-semibold mb-2">Upload CSV file</h3>
            <FileDropzone onUploaded={handleUploaded} />
          </section>
        )}

        {mode === "realtime" && (
          <section className="mt-2 space-y-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className="px-4 py-2 border rounded-lg bg-blue-50 hover:bg-blue-100"
            >
              {running ? "Stop Realtime" : "Start Realtime"}
            </button>
          </section>
        )}

        {mode === "historical" && (
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

        {/* === sample output kalau belum ada data === */}
        {!hasData && (
          <section className="mt-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              After upload, your data will be visualized like this:
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2">pH Trend</h4>
                <Image
                  src="/img/chart_ph.png"
                  alt="Sample chart pH trend"
                  width={400}
                  height={250}
                  className="w-full h-auto rounded"
                />
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2">Sample Parameters</h4>
                <Image
                  src="/img/sample-parameter.png"
                  alt="Sample Parameters Table"
                  width={400}
                  height={250}
                  className="w-full h-auto rounded"
                />
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2">Dashboard View</h4>
                <Image
                  src="/img/dashboard.png"
                  alt="Sample dashboard"
                  width={400}
                  height={250}
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          </section>
        )}

        {/* === data real kalau sudah ada === */}
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
