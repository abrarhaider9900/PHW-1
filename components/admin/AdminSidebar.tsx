"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Horses", href: "/admin/horses", icon: "🐴" },
    { label: "Events", href: "/admin/events", icon: "📅" },
    { label: "Performances", href: "/admin/performances", icon: "🏆" },
    { label: "Video Management", href: "/admin/videos", icon: "🎬" },
    { label: "Trainers", href: "/admin/trainers", icon: "🤠" },
    { label: "Sponsors", href: "/admin/sponsors", icon: "🎁" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Disciplines", href: "/admin/disciplines", icon: "📜" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside style={{
            width: "240px",
            background: "var(--color-surface)",
            borderRight: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            padding: "20px 0"
        }}>
            <div style={{ padding: "0 20px 20px", borderBottom: "1px solid var(--color-border)", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Admin Panel
                </h2>
            </div>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", padding: "0 10px" }}>
                {adminLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.label}
                            href={link.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 14px",
                                fontSize: "13px",
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                                background: isActive ? "rgba(200, 168, 75, 0.1)" : "transparent",
                                borderRadius: "4px",
                                transition: "all 0.2s"
                            }}
                            className="hover:bg-neutral-800"
                        >
                            <span style={{ fontSize: "16px" }}>{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: "20px", borderTop: "1px solid var(--color-border)" }}>
                <Link href="/" style={{ fontSize: "12px", color: "var(--color-text-dim)" }}>
                    ← Back to Website
                </Link>
            </div>
        </aside>
    );
}
