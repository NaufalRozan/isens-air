"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/docs/user-manual", label: "User Manual" },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
                {/* brand */}
                <Link href="/" className="font-bold text-gray-800 text-lg">
                    iSENS-Air
                </Link>

                {/* links */}
                <div className="flex gap-6 text-sm font-medium">
                    {links.map((link) => {
                        const isActive =
                            pathname === link.href ||
                            (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`${isActive ? "text-blue-600 font-semibold" : "text-gray-700"
                                    } hover:text-blue-600`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
