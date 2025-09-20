"use client";
import { useMemo, useState, memo } from "react";
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { lttb } from "@/lib/lttb";

type Props = { rows: Record<string, unknown>[]; schema: Record<string, string> };

function numericColumns(schema: Record<string, string>, rows: Record<string, unknown>[]) {
    const fromSchema = Object.entries(schema)
        .filter(([k, t]) => t === "number" && !/^unnamed:\s*\d+/i.test(k))
        .map(([k]) => k);
    if (fromSchema.length) return fromSchema;

    // fallback: cek sample
    const keys = Object.keys(schema).filter((k) => !/^unnamed:\s*\d+/i.test(k));
    const sample = rows.slice(0, 200);
    return keys.filter((k) => sample.some((r) => !Number.isNaN(Number(r?.[k]))));
}

function _ScatterView({ rows, schema }: Props) {
    const numCols = useMemo(() => numericColumns(schema, rows), [schema, rows]);
    const [xKey, setXKey] = useState<string>(numCols[0] || "");
    const [yKey, setYKey] = useState<string>(numCols[1] || numCols[0] || "");

    // Hard guard utk dataset ekstrem agar tidak freeze
    const RAW_LIMIT = 100_000; // baca maksimal 100k titik dari rows
    const DRAW_LIMIT = 2_000;  // gambar maksimal 2k titik setelah LTTB

    const rawPoints = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        let count = 0;
        for (const r of rows) {
            if (count >= RAW_LIMIT) break;
            const xv = Number(r?.[xKey]);
            const yv = Number(r?.[yKey]);
            if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
            pts.push({ x: xv, y: yv });
            count++;
        }
        return pts;
    }, [rows, xKey, yKey]);

    const data = useMemo(() => lttb(rawPoints, DRAW_LIMIT), [rawPoints]);

    // Render
    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-800">Scatter Plot</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-gray-700">
                    Select X-Axis
                    <div className="mt-1">
                        <select
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-800"
                            value={xKey}
                            onChange={(e) => setXKey(e.target.value)}
                        >
                            {numCols.length === 0 && <option>- No numeric column -</option>}
                            {numCols.map((k) => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                    </div>
                </label>

                <label className="text-sm text-gray-700">
                    Select Y-Axis
                    <div className="mt-1">
                        <select
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-800"
                            value={yKey}
                            onChange={(e) => setYKey(e.target.value)}
                        >
                            {numCols.length === 0 && <option>- No numeric column -</option>}
                            {numCols.map((k) => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                    </div>
                </label>
            </div>

            <p className="mt-6 text-sm text-gray-600 font-medium">
                Relationship between {xKey || "—"} and {yKey || "—"}
            </p>

            <div className="mt-2 h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        {/* Matikan grid jika masih berat: hapus baris ini */}
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name={xKey}
                            tick={{ fontSize: 12 }}
                            label={{ value: xKey, position: "insideBottom", offset: -4 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name={yKey}
                            tick={{ fontSize: 12 }}
                            label={{ value: yKey, angle: -90, position: "insideLeft", offset: 10 }}
                        />
                        {/* Non-animated tooltip untuk performa */}
                        <Tooltip isAnimationActive={false} />
                        <Scatter data={data} fill="#2563eb" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {!data.length && (
                <p className="mt-3 text-sm text-amber-700">
                    Tidak ada pasangan nilai numerik untuk pilihan saat ini. Coba pilih kolom lain.
                </p>
            )}
        </div>
    );
}

const ScatterView = memo(_ScatterView);
export default ScatterView;
