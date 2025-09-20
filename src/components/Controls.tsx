'use client';
import { useMemo } from 'react';

export function Controls({
    schema,
    rows,
    state,
    setState,
}: {
    schema: Record<string, string>;
    rows: Record<string, unknown>[];
    state: { param: 'ALL' | string; timeKey: string; bucket: 'all' | 'daily' | 'weekly' | 'monthly'; month?: string };
    setState: (p: any) => void;
}) {
    const numericCols = useMemo(() => Object.entries(schema).filter(([, t]) => t === 'number').map(([k]) => k), [schema]);
    const datetimeCols = useMemo(() => Object.entries(schema).filter(([, t]) => t === 'datetime').map(([k]) => k), [schema]);

    return (
        <div className="grid md:grid-cols-4 gap-3">
            <label className="flex flex-col text-sm">Parameter
                <select className="border rounded p-2" value={state.param} onChange={(e) => setState({ ...state, param: e.target.value })}>
                    <option value="ALL">Semua</option>
                    {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </label>
            <label className="flex flex-col text-sm">Kolom Waktu
                <select className="border rounded p-2" value={state.timeKey} onChange={(e) => setState({ ...state, timeKey: e.target.value })}>
                    {datetimeCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </label>
            <label className="flex flex-col text-sm">Rentang
                <select className="border rounded p-2" value={state.bucket} onChange={(e) => setState({ ...state, bucket: e.target.value as any })}>
                    <option value="all">All Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </label>
            {state.bucket === 'monthly' && (
                <label className="flex flex-col text-sm">Bulan (YYYY-MM)
                    <input className="border rounded p-2" placeholder="YYYY-MM" value={state.month || ''} onChange={(e) => setState({ ...state, month: e.target.value })} />
                </label>
            )}
        </div>
    );
}
