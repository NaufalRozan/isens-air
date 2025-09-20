"use client";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Jakarta");

type Props = { rows: any[]; schema: Record<string, string> };

// -------- helpers --------
function guessTimeKey(schema: Record<string, string>, rows: any[]) {
    const keys = Object.keys(schema);
    const candidates = ["time", "timestamp", "datetime", "date", "created_at", "ts"];
    const byName = keys.find((k) => candidates.includes(k.toLowerCase()));
    if (byName) return byName;
    for (const k of keys) {
        const ok = rows.slice(0, 200).filter((r) => dayjs(r?.[k]).isValid()).length;
        if (ok >= Math.min(rows.length, 200) * 0.6) return k;
    }
    return "";
}
function numericColumns(schema: Record<string, string>, rows: any[]) {
    const fromSchema = Object.entries(schema)
        .filter(([k, t]) => t === "number" && !/^unnamed:\s*\d+/i.test(k))
        .map(([k]) => k);
    if (fromSchema.length) return fromSchema;
    const keys = Object.keys(schema).filter((k) => !/^unnamed:\s*\d+/i.test(k));
    const sample = rows.slice(0, 200);
    return keys.filter((k) => sample.some((r) => !Number.isNaN(Number(r?.[k]))));
}
function monthChoices(rows: any[], timeKey: string) {
    if (!timeKey) return [];
    const set = new Set<string>();
    for (const r of rows) {
        const d = dayjs(r?.[timeKey]);
        if (d.isValid()) set.add(d.format("YYYY-MM"));
    }
    return [...set]
        .sort()
        .map((v) => ({ value: v, label: dayjs(v + "-01").format("MMMM YYYY") }));
}
// Freedman–Diaconis
function makeHistogram(xs: number[]) {
    if (!xs.length) return [];
    const sorted = xs.slice().sort((a, b) => a - b);
    const n = sorted.length;
    const q1 = sorted[Math.floor(0.25 * (n - 1))];
    const q3 = sorted[Math.floor(0.75 * (n - 1))];
    const iqr = Math.max(q3 - q1, 1e-9);
    const binWidth = (2 * iqr) / Math.cbrt(n);
    const min = sorted[0], max = sorted[n - 1];
    const k = Math.max(10, Math.min(60, Math.ceil((max - min) / (binWidth || 1) || 20)));

    const edges = Array.from({ length: k + 1 }, (_, i) => min + (i * (max - min)) / k);
    const counts = Array.from({ length: k }, () => 0);
    for (const x of sorted) {
        const idx = Math.min(k - 1, Math.max(0, Math.floor(((x - min) / (max - min || 1)) * k)));
        counts[idx]++;
    }
    return edges.slice(0, -1).map((edge, i) => ({ bin: edge, freq: counts[i] }));
}

// kecil: satu chart histogram
function SmallHistogram({ title, data, xLabel }: { title: string; data: any[]; xLabel: string }) {
    return (
        <div className="rounded-lg border bg-white p-3">
            <p className="text-sm text-gray-700 mb-2">{title}</p>
            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="bin"
                            tick={{ fontSize: 11 }}
                            minTickGap={10}
                            tickFormatter={(v: number) => (Number.isFinite(v) ? `${v}` : String(v))}
                            label={{ value: xLabel, position: "insideBottom", offset: -4 }}
                        />
                        <YAxis tick={{ fontSize: 11 }} label={{ value: "Frequency", angle: -90, position: "insideLeft", offset: 8 }} />
                        <Tooltip />
                        <Bar dataKey="freq" fill="#2563eb" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {!data.length && <p className="mt-2 text-xs text-amber-700">No data for this parameter in selected month.</p>}
        </div>
    );
}

export default function HistogramView({ rows, schema }: Props) {
    const timeKey = useMemo(() => guessTimeKey(schema, rows), [schema, rows]);
    const numCols = useMemo(() => numericColumns(schema, rows), [schema, rows]);

    const months = useMemo(() => monthChoices(rows, timeKey), [rows, timeKey]);
    const defaultMonth = months.length ? months[0].value : "";

    // ⬇️ default ke ALL
    const [col, setCol] = useState<string>("__all__");
    const [month, setMonth] = useState<string>(defaultMonth);

    // filter row sesuai bulan (sekali saja; nanti masing2 param ambil nilainya)
    const monthFilteredRows = useMemo(() => {
        if (!timeKey || !month) return rows;
        return rows.filter((r) => {
            const d = dayjs(r[timeKey]);
            return d.isValid() && d.format("YYYY-MM") === month;
        });
    }, [rows, timeKey, month]);

    // SINGLE mode data
    const singleData = useMemo(() => {
        if (col === "__all__") return [];
        const xs = monthFilteredRows
            .map((r) => Number(r[col]))
            .filter((v) => !Number.isNaN(v) && Number.isFinite(v));
        return makeHistogram(xs);
    }, [monthFilteredRows, col]);

    const subtitle = useMemo(() => {
        const label = months.find((m) => m.value === month)?.label || "All Data";
        return col === "__all__"
            ? `Distribution — All Parameters · ${label}`
            : `Distribution of ${col || "—"} · ${label}`;
    }, [col, month, months]);

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-800">Histogram</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-gray-700">
                    Select column to show histogram
                    <div className="mt-1">
                        <select
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-800"
                            value={col}
                            onChange={(e) => setCol(e.target.value)}
                        >
                            <option value="__all__">All Parameters</option>
                            {numCols.length === 0 && <option>- No numeric column -</option>}
                            {numCols.map((k) => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                    </div>
                </label>

                <label className="text-sm text-gray-700">
                    Select Month
                    <div className="mt-1">
                        <select
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-800"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            disabled={!months.length}
                        >
                            {!months.length && <option>- Not available -</option>}
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                </label>
            </div>

            <p className="mt-6 text-sm text-gray-600 font-medium">{subtitle}</p>

            {/* SINGLE histogram */}
            {col !== "__all__" && (
                <div className="mt-2 h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={singleData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="bin"
                                tick={{ fontSize: 12 }}
                                minTickGap={12}
                                tickFormatter={(v: number) => (Number.isFinite(v) ? `${v}` : String(v))}
                                label={{ value: col, position: "insideBottom", offset: -4 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} label={{ value: "Frequency", angle: -90, position: "insideLeft", offset: 10 }} />
                            <Tooltip />
                            <Bar dataKey="freq" fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ALL PARAMETERS: grid of histograms */}
            {col === "__all__" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {numCols.map((k) => {
                        const xs = monthFilteredRows
                            .map((r) => Number(r[k]))
                            .filter((v) => !Number.isNaN(v) && Number.isFinite(v));
                        const data = makeHistogram(xs);
                        return <SmallHistogram key={k} title={k} data={data} xLabel={k} />;
                    })}
                </div>
            )}

            {col !== "__all__" && !singleData.length && (
                <p className="mt-3 text-sm text-amber-700">
                    Data tidak tersedia untuk pilihan saat ini. Coba pilih kolom lain atau bulan lain.
                </p>
            )}
        </div>
    );
}
