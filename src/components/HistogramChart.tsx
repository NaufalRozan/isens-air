'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HistogramChart({ rows, param }: { rows: any[]; param: string }) {
    const { bins, counts } = useMemo(() => {
        const xs = rows.map((r: any) => Number(r[param])).filter((v) => !Number.isNaN(v));
        if (xs.length === 0) return { bins: [], counts: [] };
        const k = 12;
        const min = Math.min(...xs), max = Math.max(...xs);
        const width = (max - min) / k || 1;
        const edges = Array.from({ length: k + 1 }, (_, i) => min + i * width);
        const cnts = Array.from({ length: k }, () => 0);
        for (const x of xs) {
            const idx = Math.min(k - 1, Math.floor((x - min) / width));
            cnts[idx]++;
        }
        return { bins: edges, counts: cnts };
    }, [rows, param]);

    const data = bins.slice(0, -1).map((b, i) => ({ bin: `${b.toFixed(2)}`, freq: counts[i] }));

    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bin" tick={{ fontSize: 11 }} angle={-20} height={60} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="freq" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
