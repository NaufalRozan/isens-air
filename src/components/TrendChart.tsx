'use client';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendChart({ rows, schema, timeKey, param }: { rows: any[]; schema: Record<string, string>; timeKey: string; param: 'ALL' | string }) {
    const numericCols = useMemo(() => Object.entries(schema).filter(([, t]) => t === 'number').map(([k]) => k), [schema]);

    const data = useMemo(() => {
        return rows
            .filter(r => r[timeKey])
            .map(r => ({ ...r, [timeKey]: new Date(r[timeKey]).toISOString() }))
            .sort((a, b) => a[timeKey].localeCompare(b[timeKey]));
    }, [rows, timeKey]);

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeKey} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    {param === 'ALL'
                        ? numericCols.map((c) => (<Line key={c} type="monotone" dataKey={c} dot={false} />))
                        : <Line type="monotone" dataKey={param} dot={false} />}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
