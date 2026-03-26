import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    display: "swap"
});

export const metadata: Metadata = {
    title: "Performance Horse World",
    description:
        "Track top performing horses across barrel racing, tie-down roping, team roping, reining, and cutting disciplines.",
    keywords: "performance horses, barrel racing, reining, cutting, tie-down roping, horse events",
    openGraph: {
        title: "Performance Horse World",
        description: "Insights That Give You An Edge",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={openSans.className} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
