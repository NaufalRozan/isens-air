import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // isi dari Vercel env
});

export async function POST(req: NextRequest) {
    try {
        const { prompt, payload } = await req.json();

        const res = await client.chat.completions.create({
            model: "gpt-4o-mini", // bisa diganti gpt-4o atau gpt-3.5-turbo
            messages: [
                { role: "system", content: "You are an AI that analyzes water quality datasets." },
                { role: "user", content: `${prompt}\n\nData context:\n${JSON.stringify(payload).slice(0, 4000)}` },
            ],
            temperature: 0.3,
        });

        const text = res.choices[0]?.message?.content || "";

        return NextResponse.json({ text });
    } catch (e: any) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
