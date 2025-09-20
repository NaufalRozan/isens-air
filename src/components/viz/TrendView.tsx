"use client";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

dayjs.extend(isoWeek);

type Props = { rows: any[]; schema: Record<string, string> };
type Agg = "all" | "daily" | "weekly" | "monthly";

function getNumeric(schema: Record<string, string>) {
    return Object.entries(schema)
        .filter(([, t]) => t === "number")
        .map(([k]) => k);
}
function getDatetime(schema: Record<string, string>) {
    return Object.entries(schema)
        .filter(([, t]) => t === "datetime")
        .map(([k]) => k);
}

// ----- util untuk membangun seri satu parameter -----
function buildSeries(
    rows: any[],
    timeKey: string,
    param: string,
    agg: Agg
) {
    if (!timeKey || !param) return [];
    const cleaned = rows
        .filter(r => r[timeKey] != null && r[param] != null && r[param] !== "")
        .map(r => ({ t: dayjs(r[timeKey]), v: Number(r[param]) }))
        .filter(x => x.t.isValid() && !Number.isNaN(x.v))
        .sort((a, b) => a.t.valueOf() - b.t.valueOf());

    if (agg === "all") {
        return cleaned.map(x => ({ [timeKey]: x.t.toISOString(), [param]: x.v }));
    }

    const map = new Map<string, number[]>();
    for (const x of cleaned) {
        let key = "";
        if (agg === "daily") key = x.t.format("YYYY-MM-DD");
        if (agg === "weekly") key = `${x.t.year()}-W${x.t.isoWeek()}`;
        if (agg === "monthly") key = x.t.format("YYYY-MM");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(x.v);
    }
    return [...map.entries()]
        .map(([bucket, arr]) => ({
            [timeKey]: bucket,
            [param]: arr.reduce((a, b) => a + b, 0) / arr.length,
        }))
        .sort((a: any, b: any) => String(a[timeKey]).localeCompare(String(b[timeKey])));
}

const COLORS = [
    "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099",
    "#0099C6", "#DD4477", "#66AA00", "#B82E2E", "#316395",
];

export default function TrendView({ rows, schema }: Props) {
    const numericCols = useMemo(() => getNumeric(schema), [schema]);
    const timeCols = useMemo(() => getDatetime(schema), [schema]);
    const timeKey = timeCols[0] || "";
    const [param, setParam] = useState<string>("__all__");
    const [agg, setAgg] = useState<Agg>("all");

    // data untuk satu parameter (saat bukan "All Parameters")
    const singleData = useMemo(
        () => buildSeries(rows, timeKey, param, agg),
        [rows, timeKey, param, agg]
    );

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-800">Parameter Trend Over Time</h3>

            {/* Controls */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-gray-700">
                    Select Parameter to Show
                    <div className="mt-1">
                        <select
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-800"
                            value={param}
                            onChange={(e) => setParam(e.target.value)}
                        >
                            <option value="__all__">All Parameters</option>
                            {numericCols.length === 0 && <option>- No numeric column -</option>}
                            {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </label>

                <label className="text-sm text-gray-700">
                    Aggregation
                    <div className="mt-1">
                        <select
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-800"
                            value={agg}
                            onChange={(e) => setAgg(e.target.value as Agg)}
                        >
                            <option value="all">All time</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                </label>
            </div>

            {/* ---- MODE 1: satu grafik ---- */}
            {param !== "__all__" && (
                <>
                    <p className="mt-6 text-sm text-gray-600">
                        {agg === "all" ? "All time" : agg[0].toUpperCase() + agg.slice(1)} Trend – {param || "—"}
                    </p>

                    <div className="mt-2 h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={singleData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={timeKey} tick={{ fontSize: 12 }} />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    label={{ value: param, angle: -90, position: "insideLeft", offset: 10 }}
                                />
                                <Tooltip />
                                <Line type="monotone" dataKey={param} dot={false} strokeWidth={2} stroke={COLORS[0]} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {/* ---- MODE 2: banyak grafik (All Parameters) ---- */}
            {param === "__all__" && (
                <div className="mt-6 space-y-10">
                    {numericCols.map((p, idx) => {
                        const data = buildSeries(rows, timeKey, p, agg);
                        return (
                            <div key={p}>
                                <p className="text-sm text-gray-600 mb-2">
                                    {agg === "all" ? "All time" : agg[0].toUpperCase() + agg.slice(1)} Trend – {p}
                                </p>
                                <div className="h-[320px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey={timeKey} tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey={p}
                                                dot={false}
                                                strokeWidth={2}
                                                stroke={COLORS[idx % COLORS.length]}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
