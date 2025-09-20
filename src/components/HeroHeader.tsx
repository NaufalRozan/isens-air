"use client";
import Image from "next/image";

export default function HeroHeader() {
    return (
        <section className="py-10 md:py-16 bg-white">
            <div className="container mx-auto px-4">
                {/* wrapper supaya gambar skalanya rapi */}
                <div className="mx-auto w-full max-w-4xl">
                    <Image
                        src="/img/logo.png"
                        alt="UMPSA • EAST • PPRN"
                        width={1600}
                        height={400}
                        className="w-full h-auto object-contain"
                        priority
                        sizes="(min-width: 1024px) 768px, 90vw"
                        quality={90}
                    />
                </div>

                <h1 className="mt-12 text-center text-3xl md:text-5xl font-extrabold tracking-tight text-gray-800">
                    iSENS-AIR: Artificial Intelligence for River Water Quality Monitoring
                </h1>
            </div>
        </section>
    );
}
