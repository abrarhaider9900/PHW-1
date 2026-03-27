"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Shield, Lock } from "lucide-react";

const tabs = [
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Roles", href: "/admin/users/roles", icon: Shield },
    { label: "Permissions", href: "/admin/users/permissions", icon: Lock },
];

export default function UserManagementTabs() {
    const pathname = usePathname();

    return (
        <div style={{ 
            display: "flex", 
            gap: "8px", 
            marginBottom: "24px",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "8px"
        }}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;
                
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: isActive ? "var(--color-primary)" : "var(--color-text-dim)",
                            background: isActive ? "rgba(200, 168, 75, 0.1)" : "transparent",
                            borderRadius: "6px",
                            transition: "all 0.2s",
                            textDecoration: "none",
                            border: isActive ? "1px solid var(--color-primary)" : "1px solid transparent",
                        }}
                    >
                        <Icon size={16} />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
