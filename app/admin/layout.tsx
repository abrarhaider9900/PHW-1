import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = { title: "Admin | Performance Horse World" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 100px)" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: "24px", background: "var(--color-bg-dark)", overflowY: "auto" }}>
                {children}
            </main>
        </div>
    );
}
