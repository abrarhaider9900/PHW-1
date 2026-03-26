"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const footerSections = [
        {
            title: "Services",
            links: [
                { label: "Search", href: "/allhorses" },
                { label: "Horses", href: "/allhorses" },
                { label: "Horse Profile", href: "#" },
                { label: "Trainer Profile", href: "#" },
                { label: "Events", href: "/allevents" },
            ]
        },
        {
            title: "Contacts",
            info: [
                { label: "Address", value: "123 Street ABC, Ny, 45612 USA" },
                { label: "Email", value: "hello@performancehorseworld.com" },
                { label: "Phone", value: "+1 123 456 7894" },
            ]
        },
        {
            title: "Working Hours",
            hours: [
                { day: "Monday", time: "8AM - 6AM" },
                { day: "Tuesday", time: "8AM - 6AM" },
                { day: "Wednesday", time: "8AM - 6AM" },
                { day: "Thursday - Friday", time: "8AM - 6AM" },
                { day: "Sunday", time: "Closed" },
            ]
        }
    ];

    return (
        <footer style={{ background: "var(--color-footer-bg)", color: "#ffffff", paddingTop: "60px", position: "relative" }}>
            <div className="container">
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.4fr 1.4fr", gap: "40px", paddingBottom: "60px" }}>

                    {/* About Column */}
                    <div>
                        <Link href="/">
                            <Image
                                src="/images/logo-white.png"
                                alt="logo"
                                width={220}
                                height={160}
                                style={{ objectFit: "contain", marginBottom: "20px", display: "block" }}
                            />
                        </Link>
                        <p style={{ color: "#ffffff", fontSize: "14px", lineHeight: "1.8", marginBottom: "30px", opacity: 0.9 }}>
                            Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan.
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <Link key={i} href="#" style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "0.3s",
                                    flexShrink: 0,
                                }} className="hover:bg-primary">
                                    <Icon size={16} color="#fff" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "25px", color: "#ffffff" }}>
                            {footerSections[0].title}
                        </h4>
                        <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                            {footerSections[0].links?.map((link) => (
                                <li key={link.label} style={{ marginBottom: "14px" }}>
                                    <Link
                                        href={link.href}
                                        style={{ fontSize: "15px", color: "#ffffff", opacity: 0.85, textDecoration: "none" }}
                                        className="hover:opacity-100"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contacts Column */}
                    <div>
                        <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "25px", color: "#ffffff" }}>
                            {footerSections[1].title}
                        </h4>
                        <div>
                            {footerSections[1].info?.map((item) => (
                                <div key={item.label} style={{ marginBottom: "18px", fontSize: "15px", lineHeight: "1.5", color: "#ffffff" }}>
                                    <strong style={{ fontWeight: "700" }}>{item.label}:</strong>{" "}
                                    <span style={{ opacity: 0.85 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Working Hours Column */}
                    <div>
                        <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "25px", color: "#ffffff" }}>
                            {footerSections[2].title}
                        </h4>
                        <div>
                            {footerSections[2].hours?.map((item) => (
                                <div key={item.day} style={{ marginBottom: "14px", fontSize: "15px", lineHeight: "1.5", color: "#ffffff" }}>
                                    <strong style={{ fontWeight: "700" }}>{item.day}:</strong>{" "}
                                    <span style={{ opacity: 0.85 }}>{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ background: "var(--color-footer-copyright)", padding: "20px 0" }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                    <div style={{ opacity: 0.85, color: "#ffffff" }}>© Performance Horse World</div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", color: "#ffffff" }}>
                        <Link href="#" style={{ opacity: 0.85, color: "#ffffff", textDecoration: "none" }} className="hover:opacity-100">
                            Privacy Policy
                        </Link>
                        <span style={{ opacity: 0.5 }}>-</span>
                        <Link href="#" style={{ opacity: 0.85, color: "#ffffff", textDecoration: "none" }} className="hover:opacity-100">
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    style={{
                        position: "fixed",
                        bottom: "30px",
                        right: "30px",
                        width: "45px",
                        height: "45px",
                        background: "var(--color-accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 1000,
                        transition: "0.3s",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
                    }}
                    className="hover:scale-110"
                >
                    <ChevronUp size={22} strokeWidth={3} />
                </button>
            )}
        </footer>
    );
}