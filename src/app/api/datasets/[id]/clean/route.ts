import { getDataset, putDataset } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const body = await req.json();
    const { schema, clean_rows, missing_report, out_of_range_report } = body;
    putDataset(params.id, {
        schema,
        rows: clean_rows,
        missing: missing_report,
        outOfRange: out_of_range_report,
    });
    return NextResponse.json({ ok: true });
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    const ds = getDataset(params.id);
    if (!ds) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(ds);
}
