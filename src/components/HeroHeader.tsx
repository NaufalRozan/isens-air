"use client";
import Image from "next/image";

export default function HeroHeader() {
    return (
        <section className="relative py-10 md:py-16 bg-white">
            {/* background image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/img/hero-river.jpg"
                    alt="River monitoring station"
                    fill
                    priority
                    className="object-cover object-center opacity-20"
                />
            </div>

            <div className="container mx-auto px-4">
                {/* wrapper supaya gambar skalanya rapi */}
                <div className="mx-auto w-full max-w-4xl">
                    <Image
                        src="/img/logo.png"
                        alt="UMPSA • EAESB • PPRN"
                        width={1600}
                        height={400}
                        className="w-full h-auto object-contain"
                        priority
                        sizes="(min-width: 1024px) 768px, 90vw"
                        quality={90}
                    />
                </div>

                <h1 className="mt-12 text-center text-3xl md:text-5xl font-extrabold tracking-tight text-gray-800">
                    iSENS-AIR: AI for River Water Quality Monitoring
                </h1>

                <p className="mt-4 text-center text-gray-600 text-xl">
                    Real-time and historical monitoring of water quality, powered by AI and IoT.
                </p>

                {/* intro singkat */}
                <p className="mt-6 max-w-3xl mx-auto text-center text-gray-700 text-base md:text-lg leading-relaxed">
                    iSENS-AIR enables industries and agencies to monitor river water quality
                    through AI-powered analysis, IoT connectivity, and cloud-based dashboards.
                </p>
            </div>
        </section>
    );
}
