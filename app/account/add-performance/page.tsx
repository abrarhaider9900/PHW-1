"use client";

import PerformanceForm from "@/components/admin/PerformanceForm";
import Link from "next/link";

export default function AddPerformancePage() {
    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
            <div style={{ marginBottom: "24px" }}>
                <Link
                    href="/account/rider-performances"
                    style={{
                        color: "var(--color-text-dim)",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    ← Back to My Performances
                </Link>
                <h1
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#fff",
                        marginTop: "12px",
                    }}
                >
                    Add Horse Performance
                </h1>
            </div>
            <PerformanceForm redirectPath="/account/rider-performances" />
        </div>
    );
}
