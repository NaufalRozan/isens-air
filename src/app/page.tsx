"use client";
import { useState, useMemo } from "react";
import HeroHeader from "@/components/HeroHeader";
import Visualizations from "@/components/Visualizations";
import DeepseekPanel from "@/components/DeepSeekPanel";
import FileDropzone from "@/components/FileDropZone";
import CleanDataPanel from "@/components/CleanDataPanel";

export default function Page() {
  const [schema, setSchema] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [missing, setMissing] = useState<Record<string, number>>({});
  const [oor, setOor] = useState<Record<string, number>>({});
  const [hasData, setHasData] = useState(false);

  function handleUploaded(payload: any) {
    const sc = payload?.schema ?? payload?.column_schema ?? {};
    setSchema(sc);
    setRows(payload?.clean_rows ?? []);
    setMissing(payload?.missing_report ?? {});
    setOor(payload?.out_of_range_report ?? {});
    setHasData(true);
  }

  const prettyMissing = useMemo(() => {
    const items = Object.entries(missing)
      .filter(([k, v]) => v > 0 && !/^unnamed:\s*\d+/i.test(k));
    return items.length ? items.map(([k, v]) => `${k}:${v}`).join(", ") : "—";
  }, [missing]);

  const prettyOOR = useMemo(() => {
    const items = Object.entries(oor)
      .filter(([k]) => !/^unnamed:\s*\d+/i.test(k));
    return items.length ? items.map(([k, v]) => `${k}:${v}`).join(", ") : "—";
  }, [oor]);

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 pb-16">
        <HeroHeader />

        <section className="mt-2">
          <h3 className="text-gray-800 font-semibold mb-2">Upload CSV file</h3>
          <FileDropzone onUploaded={handleUploaded} />
        </section>

        {hasData && (
          <>
            <section className="mt-10">
              <Visualizations rows={rows} schema={schema} />
            </section>

            {/* DeepSeek Panel */}
            <DeepseekPanel rows={rows} schema={schema} />

            <CleanDataPanel rows={rows} schema={schema} />
          </>
        )}
      </div>
    </main>
  );
}
