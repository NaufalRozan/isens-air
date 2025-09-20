"use client";
import { useState } from "react";

export default function UploadZone({
    onUploaded,
}: { onUploaded: (payload: any) => void }) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setErr(null); setLoading(true);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("datasetId", `${Date.now()}`);

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) { setErr("Gagal upload/ML"); setLoading(false); return; }

        const payload = await res.json();
        onUploaded(payload);
        setLoading(false);
    }

    return (
        <div className="space-y-2">
            <input type="file" accept=".csv" onChange={onFile} />
            {loading && <div className="text-sm">Memproses…</div>}
            {err && <div className="text-sm text-red-600">{err}</div>}
        </div>
    );
}
